const express = require('express');
const { ObjectId } = require('mongodb');
const upload = require('../middleware/upload');
const { requireAuth, getAuth } = require('../middleware/auth');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { getDB } = require('../config/db');

const router = express.Router();

// ---------- POST /api/issues  ----------
// Create a new issue with an optional image upload (requires authentication)
router.post('/', requireAuth(), upload.single('image'), async (req, res) => {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const { title, description, location, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    let imageUrl = null;

    // If an image file was sent, upload it to Cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const db = getDB();
    const issue = {
      title,
      description,
      location: location || null,
      category: category || null,
      imageUrl,
      reportedBy: clerkUserId,
      status: 'reported',
      upvotes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const inserted = await db.collection('issues').insertOne(issue);

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: { _id: inserted.insertedId, ...issue },
    });
  } catch (err) {
    console.error('Error creating issue:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- GET /api/issues  ----------
// Fetch all issues (newest first)
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const issues = await db
      .collection('issues')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, data: issues });
  } catch (err) {
    console.error('Error fetching issues:', err);
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

module.exports = router;
