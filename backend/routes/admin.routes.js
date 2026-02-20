const express = require('express');
const { ObjectId } = require('mongodb');
const { requireAuth, getAuth } = require('../middleware/auth');
const { getDB } = require('../config/db');
const {
  markIssueAsViewed,
  getEscalationHistory,
  resetEscalation,
} = require('../escalationService');

const router = express.Router();

/**
 * POST /api/admin/issues/:id/mark-viewed
 * Mark an issue as viewed by admin - stops escalation
 */
router.post('/:id/mark-viewed', requireAuth(), async (req, res) => {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const db = getDB();

    // Verify admin
    const user = await db.collection('users').findOne({ clerkUserId });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const issueId = req.params.id;

    // Mark issue as viewed
    const result = await markIssueAsViewed(issueId);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    res.json({
      success: true,
      message: 'Issue marked as viewed - escalation stopped',
      data: result,
    });
  } catch (error) {
    console.error('Error marking issue as viewed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/admin/issues/:id/escalation-history
 * Get escalation call history for an issue
 */
router.get('/:id/escalation-history', requireAuth(), async (req, res) => {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const db = getDB();

    // Verify admin
    const user = await db.collection('users').findOne({ clerkUserId });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const issueId = req.params.id;
    const history = await getEscalationHistory(issueId);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching escalation history:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/admin/issues/:id/reset-escalation
 * Reset escalation for an issue (allows retesting)
 */
router.post('/:id/reset-escalation', requireAuth(), async (req, res) => {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const db = getDB();

    // Verify admin
    const user = await db.collection('users').findOne({ clerkUserId });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const issueId = req.params.id;
    const result = await resetEscalation(issueId);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    res.json({
      success: true,
      message: 'Escalation reset - issue is eligible for re-escalation',
      data: result,
    });
  } catch (error) {
    console.error('Error resetting escalation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/admin/escalation-dashboard
 * Get summary of all escalation activities
 */
router.get('/dashboard/summary', requireAuth(), async (req, res) => {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const db = getDB();

    // Verify admin
    const user = await db.collection('users').findOne({ clerkUserId });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    // Get high-severity issues not yet viewed
    const unviewedHighSeverity = await db
      .collection('issues')
      .find({
        severityScore: { $gte: 8 },
        viewedByAdmin: { $ne: true },
      })
      .toArray();

    // Get escalation logs from last 24 hours
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEscalations = await db
      .collection('escalationLogs')
      .find({ callSentAt: { $gte: last24h } })
      .sort({ callSentAt: -1 })
      .toArray();

    // Group by issue to get call counts
    const callCounts = {};
    recentEscalations.forEach((log) => {
      const issueIdStr = log.issueId.toString();
      callCounts[issueIdStr] = (callCounts[issueIdStr] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        unviewedHighSeverityCount: unviewedHighSeverity.length,
        unviewedIssues: unviewedHighSeverity,
        escalationCallsLast24h: recentEscalations.length,
        callsByIssue: callCounts,
        recentEscalations: recentEscalations.slice(0, 10),
      },
    });
  } catch (error) {
    console.error('Error fetching escalation dashboard:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/admin/test-escalation
 * Trigger an immediate test escalation (for hackathon demo)
 * Creates or uses an existing high-severity unviewed issue
 */
router.post('/test-escalation', requireAuth(), async (req, res) => {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const db = getDB();

    // Verify admin
    const user = await db.collection('users').findOne({ clerkUserId });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    // Find or create a test issue
    let testIssue = await db.collection('issues').findOne({
      _id: new ObjectId('000000000000000000000001'),
    });

    if (!testIssue) {
      // Create a test issue
      const inserted = await db.collection('issues').insertOne({
        title: '[DEMO] Critical System Failure',
        description: 'This is a demo issue for testing escalation',
        location: 'Main Gate',
        category: 'Infrastructure',
        predictedIssueType: 'Power Outage',
        severityScore: 9,
        status: 'reported',
        viewedByAdmin: false,
        escalationActive: false,
        upvotes: [],
        createdAt: new Date(Date.now() - 100 * 60 * 60 * 1000), // 100 hours ago
        updatedAt: new Date(),
      });

      testIssue = await db.collection('issues').findOne({
        _id: inserted.insertedId,
      });
    }

    res.json({
      success: true,
      message: 'Test issue prepared for escalation. Run checkForEscalations() immediately.',
      testIssue,
    });
  } catch (error) {
    console.error('Error creating test escalation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
