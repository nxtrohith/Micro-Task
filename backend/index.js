require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { clerkMiddleware } = require('@clerk/express');
const { connectDB, getDB } = require('./config/db');
const { initializeEscalationCron } = require('./cron/escalationCron');
const issueRoutes = require('./routes/issue.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Store cron job reference for cleanup
let cronJobs = null;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Clerk middleware — makes req.auth available on every request
// (does NOT enforce auth — individual routes use requireAuth())
app.use(clerkMiddleware());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use('/api/issues', issueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/issues', adminRoutes);

app.get('/api/test-db', async (req, res) => {
  try {
    const db = getDB();
    await db.command({ ping: 1 });
    res.json({ success: true, message: 'MongoDB connection is healthy' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'MongoDB connection failed', error: err.message });
  }
});

// Connect to DB then start server
connectDB()
  .then(() => {
    // Initialize escalation cron job
    cronJobs = initializeEscalationCron();
    console.log('[STARTUP] Escalation cron job initialized');

    // Ensure escalationLogs collection indexes
    const db = getDB();
    db.collection('escalationLogs').createIndex({ issueId: 1, callSentAt: -1 });
    db.collection('escalationLogs').createIndex({ callSentAt: 1 });
    console.log('[STARTUP] Escalation indexes created');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`[ESCALATION SYSTEM] Active and ready for high-severity issue escalations`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
