const express = require('express');
const { ObjectId } = require('mongodb');
const axios = require('axios');
const upload = require('../middleware/upload');
const { requireAuth, getAuth } = require('../middleware/auth');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { getDB } = require('../config/db');

const router = express.Router();

const WEBHOOK_URL = 'https://n8n1.rohithn8n.me/webhook/cad109f9-1c30-404a-be6b-6a6aa8c90b64';
const WEBHOOK_TIMEOUT_MS = 90000; // 90 s — production n8n workflows can take longer than 60 s

// ---------- POST /api/issues/preview  ----------
// Step 1: Upload image to Cloudinary, call n8n webhook, return AI-enriched fields.
// The issue is NOT saved to the DB here. 
router.post('/preview', requireAuth(), upload.single('image'), async (req, res) => {
  try {
<<<<<<< HEAD
    const { userId: clerkUserId } = getAuth(req);
    const { title, description, location, lat, lng } = req.body;
=======
    const { title, description } = req.body;
    console.log('\n[PREVIEW] ── New preview request received ──');
    console.log('[PREVIEW] Title:', title);
    console.log('[PREVIEW] Description:', description);
    console.log('[PREVIEW] Image attached:', req.file ? `yes (${req.file.originalname}, ${(req.file.size / 1024).toFixed(1)} KB)` : 'no');
>>>>>>> 3414cf4ab471eaa4d55491da470b40a4493b3972

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    // Upload image to Cloudinary if provided
    let imageUrl = null;
    if (req.file) {
      console.log('[PREVIEW] Uploading image to Cloudinary…');
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
      console.log('[PREVIEW] ✅ Cloudinary upload successful:', imageUrl);
    } else {
      console.log('[PREVIEW] No image — skipping Cloudinary upload.');
    }

    // Call n8n webhook synchronously and await AI-enriched fields
    let aiFields = {};
    let webhookOk = true;
    let webhookError = null; // 'TIMEOUT' | 'HTTP_ERROR' | 'NETWORK_ERROR' | 'EMPTY_RESPONSE' | null
    try {
      console.log('[PREVIEW] Calling n8n webhook…');
      console.log('[PREVIEW] Payload:', JSON.stringify({ title, description, image_url: imageUrl }));
      const webhookRes = await axios.post(
        WEBHOOK_URL,
        { title, description, image_url: imageUrl },
        { headers: { 'Content-Type': 'application/json' }, timeout: WEBHOOK_TIMEOUT_MS }
      );

      // n8n often wraps its response in an array — unwrap it
      const raw = webhookRes.data;
      console.log('[PREVIEW] ✅ Raw webhook response (status=%d, type=%s):', webhookRes.status, Array.isArray(raw) ? 'array' : typeof raw, JSON.stringify(raw));
      aiFields = Array.isArray(raw) ? (raw[0] || {}) : (raw && typeof raw === 'object' ? raw : {});
      console.log('[PREVIEW] Parsed aiFields:', JSON.stringify(aiFields));

      if (!aiFields || !aiFields.category) {
        console.warn('[PREVIEW] ⚠️  n8n returned empty/partial data — showing original fields for manual review.');
        webhookOk = false;
        webhookError = 'EMPTY_RESPONSE';
      }
    } catch (webhookErr) {
      const status = webhookErr.response?.status;
      const responseBody = webhookErr.response?.data;
      const isTimeout = webhookErr.code === 'ECONNABORTED' || webhookErr.message?.includes('timeout');
      console.error('[PREVIEW] ❌ Webhook call failed — status:', status, '| body:', JSON.stringify(responseBody), '| code:', webhookErr.code, '| message:', webhookErr.message);
      // Don't hard-fail — fall back to showing the original fields for the user to fill in
      webhookOk = false;
      webhookError = isTimeout ? 'TIMEOUT' : (status ? 'HTTP_ERROR' : 'NETWORK_ERROR');
    }

    const responseData = {
      imageUrl,
      category: aiFields.category || null,
      predictedIssueType: aiFields.predictedIssueType || null,
      severityScore: aiFields.severityScore || null,
      suggestedDepartment: aiFields.suggestedDepartment || null,
      description: aiFields.description || description,
      webhookOk,
      webhookError,
    };
    console.log('[PREVIEW] Sending enriched fields to client:', JSON.stringify(responseData));
    console.log('[PREVIEW] ── Done. Awaiting user confirmation. ──\n');

    // Return Cloudinary URL + AI fields to the client for review
    return res.status(200).json({ success: true, data: responseData });
  } catch (err) {
    console.error('[PREVIEW] ❌ Unexpected error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- POST /api/issues  ----------
// Step 2: Save the confirmed (and optionally user-edited) issue to the DB.
// Accepts imageUrl as a plain string (already uploaded in /preview).
router.post('/', requireAuth(), async (req, res) => {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const {
      title,
      description,
      location,
      category,
      lat,
      lng,
      imageUrl,
      predictedIssueType,
      severityScore,
      suggestedDepartment,
    } = req.body;

    console.log('\n[CREATE] ── User confirmed issue, saving to DB ──');
    console.log('[CREATE] Reported by:', clerkUserId);
    console.log('[CREATE] Title:', title);
    console.log('[CREATE] Description:', description);
    console.log('[CREATE] Category:', category, '| Dept:', suggestedDepartment, '| Severity:', severityScore);
    console.log('[CREATE] Predicted type:', predictedIssueType);
    console.log('[CREATE] Image URL:', imageUrl || 'none');
    console.log('[CREATE] GPS:', lat && lng ? `${lat}, ${lng}` : 'not provided');

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const db = getDB();

    const coordinates =
      lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;

    const issue = {
      title,
      description,
      location: location || null,
<<<<<<< HEAD
      imageUrl,
=======
      category: category || null,
      imageUrl: imageUrl || null,
      predictedIssueType: predictedIssueType || null,
      severityScore: severityScore != null ? parseInt(severityScore, 10) : null,
      suggestedDepartment: suggestedDepartment || null,
>>>>>>> 3414cf4ab471eaa4d55491da470b40a4493b3972
      coordinates,
      reportedBy: clerkUserId,
      status: 'reported',
      upvotes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('[CREATE] Inserting into MongoDB…');
    const inserted = await db.collection('issues').insertOne(issue);
    console.log('[CREATE] ✅ Issue saved! ID:', inserted.insertedId.toString());
    console.log('[CREATE] ── Done ──\n');

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: { _id: inserted.insertedId, ...issue },
    });
  } catch (err) {
    console.error('[CREATE] ❌ Error saving issue:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- POST /api/issues/check-duplicate  ----------
// Returns nearby issues with similar descriptions (potential duplicates).
// Uses Haversine distance + Jaccard text similarity — no external dependencies.
router.post('/check-duplicate', async (req, res) => {
  try {
    const { description, lat, lng } = req.body;

    if (!description || lat == null || lng == null) {
      return res.json({ success: true, duplicates: [] });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const db = getDB();

    // Fetch issues that have coordinates (only non-resolved/nearby candidates)
    const candidates = await db
      .collection('issues')
      .find(
        { coordinates: { $ne: null }, status: { $ne: 'resolved' } },
        { projection: { _id: 1, title: 1, description: 1, location: 1, imageUrl: 1, status: 1, category: 1, suggestedDepartment: 1, coordinates: 1, createdAt: 1, upvotes: 1 } }
      )
      .toArray();

    // ── Haversine distance in metres ──────────────────────────────────────
    function haversine(lat1, lng1, lat2, lng2) {
      const R = 6371000;
      const toRad = (d) => (d * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // ── Jaccard similarity on normalized word tokens ──────────────────────
    function normalize(text) {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2); // drop very short words
    }

    function jaccard(a, b) {
      const setA = new Set(normalize(a));
      const setB = new Set(normalize(b));
      if (setA.size === 0 && setB.size === 0) return 0;
      const intersection = [...setA].filter((w) => setB.has(w)).length;
      const union = new Set([...setA, ...setB]).size;
      return union === 0 ? 0 : intersection / union;
    }

    const DISTANCE_THRESHOLD_M = 200; // 200 m radius
    const SIMILARITY_THRESHOLD = 0.25; // Jaccard ≥ 0.25

    const matches = [];
    for (const issue of candidates) {
      const { lat: iLat, lng: iLng } = issue.coordinates || {};
      if (iLat == null || iLng == null) continue;

      const distanceMeters = haversine(userLat, userLng, iLat, iLng);
      if (distanceMeters > DISTANCE_THRESHOLD_M) continue;

      const sim = jaccard(description, issue.description || '');
      if (sim < SIMILARITY_THRESHOLD) continue;

      matches.push({ ...issue, similarityScore: Math.round(sim * 100), distanceMeters: Math.round(distanceMeters) });
    }

    // Sort by similarity descending, return top 3
    matches.sort((a, b) => b.similarityScore - a.similarityScore);

    res.json({ success: true, duplicates: matches.slice(0, 3) });
  } catch (err) {
    console.error('[CHECK-DUPLICATE] ❌', err.message);
    res.json({ success: true, duplicates: [] }); // fail open — never block submission
  }
});


// Fetch all issues (newest first) with reporter name joined from users
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const issues = await db
      .collection('issues')
      .aggregate([
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: 'users',
            localField: 'reportedBy',
            foreignField: 'clerkUserId',
            as: '_reporter',
          },
        },
        {
          $addFields: {
            reporterName: {
              $ifNull: [{ $arrayElemAt: ['$_reporter.fullName', 0] }, 'Anonymous'],
            },
            reporterImage: { $arrayElemAt: ['$_reporter.imageUrl', 0] },
          },
        },
        { $project: { _reporter: 0 } },
      ])
      .toArray();

    res.json({ success: true, data: issues });
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- GET /api/issues/:id/comments  ----------
router.get('/:id/comments', async (req, res) => {
  try {
    const db = getDB();
    const comments = await db
      .collection('comments')
      .aggregate([
        { $match: { issueId: req.params.id } },
        { $sort: { createdAt: 1 } },
        {
          $lookup: {
            from: 'users',
            localField: 'clerkUserId',
            foreignField: 'clerkUserId',
            as: '_user',
          },
        },
        {
          $addFields: {
            userName: {
              $ifNull: [{ $arrayElemAt: ['$_user.fullName', 0] }, 'Anonymous'],
            },
            userImage: { $arrayElemAt: ['$_user.imageUrl', 0] },
          },
        },
        { $project: { _user: 0 } },
      ])
      .toArray();

    res.json({ success: true, data: comments });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- POST /api/issues/:id/comments  ----------
router.post('/:id/comments', requireAuth(), async (req, res) => {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const db = getDB();

    // Verify issue exists
    const issue = await db.collection('issues').findOne({ _id: new ObjectId(req.params.id) });
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const comment = {
      issueId: req.params.id,
      clerkUserId,
      text: text.trim(),
      createdAt: new Date(),
    };

    const result = await db.collection('comments').insertOne(comment);

    // Fetch user info for the response
    const user = await db.collection('users').findOne({ clerkUserId });

    res.status(201).json({
      success: true,
      data: {
        _id: result.insertedId,
        ...comment,
        userName: user?.fullName || 'Anonymous',
        userImage: user?.imageUrl || null,
      },
    });
  } catch (err) {
    console.error('Error posting comment:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- PATCH /api/issues/:id/upvote  ----------
// Toggle upvote for the authenticated user
router.patch('/:id/upvote', requireAuth(), async (req, res) => {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const db = getDB();
    const issueId = new ObjectId(req.params.id);

    const issue = await db.collection('issues').findOne({ _id: issueId });
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const hasUpvoted = Array.isArray(issue.upvotes) && issue.upvotes.includes(clerkUserId);
    const update = hasUpvoted
      ? { $pull: { upvotes: clerkUserId } }
      : { $addToSet: { upvotes: clerkUserId } };

    await db.collection('issues').updateOne({ _id: issueId }, update);

    const updated = await db.collection('issues').findOne({ _id: issueId });

    res.json({
      success: true,
      data: {
        upvotes: updated.upvotes,
        upvoteCount: updated.upvotes.length,
        hasUpvoted: !hasUpvoted,
      },
    });
  } catch (err) {
    console.error('Error toggling upvote:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- GET /api/issues/:id  ----------
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const issue = await db.collection('issues').findOne({ _id: new ObjectId(req.params.id) });

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    res.json({ success: true, data: issue });
  } catch (err) {
    console.error('Error fetching issue:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- PATCH /api/issues/:id  ----------
// Admin: update issue fields (status, severity, department, etc.)
router.patch('/:id', requireAuth(), async (req, res) => {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const db = getDB();

    // Verify the caller is an admin
    const caller = await db.collection('users').findOne({ clerkUserId });
    if (!caller || caller.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin only' });
    }

    const issueId = new ObjectId(req.params.id);
    const allowedFields = [
      'status', 'severityScore', 'suggestedDepartment',
      'title', 'description', 'location', 'predictedIssueType',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    updates.updatedAt = new Date();

    const result = await db.collection('issues').findOneAndUpdate(
      { _id: issueId },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error updating issue:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
