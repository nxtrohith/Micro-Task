require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { clerkMiddleware } = require('@clerk/express');
const { connectDB, getDB } = require('./config/db');
const issueRoutes = require('./routes/issue.routes');
const userRoutes = require('./routes/user.routes');
const eventRoutes = require('./routes/event.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'https://micro-task-three.vercel.app',
    'http://localhost:3000',
  ],
  credentials: true,
}));
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
app.use('/api/events', eventRoutes);

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
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // Extend timeouts so long-running n8n webhook calls (up to 90 s)
    // don't get dropped by Node's default 5-second keep-alive timeout,
    // which would cause the browser to receive a 502 Bad Gateway.
    server.keepAliveTimeout = 120_000;  // 120 s
    server.headersTimeout = 125_000;  // must be > keepAliveTimeout
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
