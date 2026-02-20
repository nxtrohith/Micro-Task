#!/bin/bash
# ESCALATION SYSTEM - QUICK START & CHEAT SHEET
# Copy-paste commands for rapid setup and testing

# ============================================================================
# INSTALLATION
# ============================================================================

# 1. Install dependencies
cd backend
npm install

# 2. Copy and edit environment file
cp .env.example .env
# Edit .env with your Twilio credentials

# 3. Run database migration
node scripts/migrate-escalation.js

# 4. Start the server
npm run dev

# ============================================================================
# QUICK TESTS (with curl)
# ============================================================================

# Get your admin token first (copy from browser DevTools or login response)
ADMIN_TOKEN="your_clerk_jwt_token_here"

# Test 1: Create demo issue
curl -X POST http://localhost:3000/api/admin/test-escalation \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# Test 2: Get escalation dashboard
curl http://localhost:3000/api/admin/escalation-dashboard/summary \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Test 3: Get escalation history (replace with actual issue ID)
ISSUE_ID="507f1f77bcf86cd799439011"
curl http://localhost:3000/api/admin/issues/$ISSUE_ID/escalation-history \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Test 4: Mark issue as viewed (stops escalation)
curl -X POST http://localhost:3000/api/admin/issues/$ISSUE_ID/mark-viewed \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Test 5: Reset escalation (for retesting)
curl -X POST http://localhost:3000/api/admin/issues/$ISSUE_ID/reset-escalation \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# ============================================================================
# DATABASE QUERIES (MongoDB)
# ============================================================================

# Find all eligible escalation issues
db.issues.find({
  severityScore: { $gte: 8 },
  status: "reported",
  viewedByAdmin: { $ne: true },
  createdAt: { $lte: new Date(Date.now() - 72 * 60 * 60 * 1000) }
})

# Find all escalation calls for an issue
db.escalationLogs.find({
  issueId: ObjectId("507f1f77bcf86cd799439011")
}).sort({ callSentAt: -1 }).limit(5)

# Count calls sent today
db.escalationLogs.countDocuments({
  callSentAt: {
    $gte: new Date().setHours(0, 0, 0, 0)
  }
})

# Delete test data
db.issues.deleteMany({ title: /\[DEMO\]/ })

# ============================================================================
# ENVIRONMENT VARIABLES
# ============================================================================

# Essential (required for voice calls)
export TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export TWILIO_AUTH_TOKEN="your_token_here"
export TWILIO_PHONE_NUMBER="+1234567890"
export ADMIN_PHONE_NUMBER="+0987654321"

# Demo/Development
export NODE_ENV="development"
export DEMO_MODE="true"

# Server
export PORT="3000"
export MONGO_URI="mongodb://localhost:27017/webathon"

# ============================================================================
# NODE REPL TESTING
# ============================================================================

# Start Node REPL
node

# In REPL:
const { checkForEscalations } = require('./escalationService');
await checkForEscalations();

# Get all issues that need escalation
const db = require('./config/db').getDB();
const issues = await db.collection('issues').find({
  severityScore: { $gte: 8 },
  status: "reported",
  viewedByAdmin: { $ne: true }
}).toArray();
console.log('Eligible:', issues.length);

# ============================================================================
# USEFUL LOGS TO WATCH
# ============================================================================

# All escalation-related logs contain [ESCALATION]
# Filter in terminal:
grep "\[ESCALATION\]" server.log

# Cron job logs:
grep "\[CRON\]" server.log

# Startup logs:
grep "\[STARTUP\]" server.log

# ============================================================================
# TROUBLESHOOTING COMMANDS
# ============================================================================

# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Check if server is running
curl http://localhost:3000

# Check database connection
curl http://localhost:3000/api/test-db

# List all indexes on issues collection
db.issues.getIndexes()

# Clear all escalation logs (WARNING: destructive)
db.escalationLogs.deleteMany({})

# Reset all issues to non-escalated state
db.issues.updateMany({}, { 
  $set: { 
    viewedByAdmin: false, 
    escalationActive: false, 
    lastReminderSent: null 
  } 
})

# ============================================================================
# PERFORMANCE METRICS
# ============================================================================

# Check query performance
db.issues.find({
  severityScore: { $gte: 8 },
  status: "reported",
  viewedByAdmin: { $ne: true }
}).explain("executionStats")

# Show slowest operations
db.system.profile.find().limit(5).sort({ millis: -1 }).pretty()

# ============================================================================
# DEPLOYMENT CHECKLIST
# ============================================================================

# []  Verify Twilio credentials in .env
# []  Run database migration: node scripts/migrate-escalation.js
# []  Test with: npm run dev
# []  Receive test call on admin phone
# []  View logs: grep "\[ESCALATION\]"
# []  Create high-severity issue in admin dashboard
# []  Wait 72+ hours (or modify createdAt in DB)
# []  Receive escalation call
# []  Mark issue as viewed via API
# []  Verify no more calls for that issue
# []  Check escalation history: GET /api/admin/issues/:id/escalation-history
# []  View dashboard: GET /api/admin/escalation-dashboard/summary
# []  Deploy to production with NODE_ENV=production
# []  Set up monitoring and alerts
# []  Document for admin team

# ============================================================================
# .ENV TEMPLATE (copy to .env and fill in)
# ============================================================================

cat > .env << 'EOF'
# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=+
ADMIN_PHONE_NUMBER=+

# Server
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/webathon
DEMO_MODE=true

# Twilio (optional fine-tuning)
# MAX_CALLS_PER_DAY=2
# REMINDER_COOLDOWN_HOURS=12
# SEVERITY_THRESHOLD=8
EOF

# ============================================================================
# KEY METRICS
# ============================================================================

# Escalation coverage: Issues >= 8 severity / Issues >= 8 severity unviewed
# Call success rate: Successful calls / Total call attempts
# Response time: Minutes from escalation to admin action
# Daily call volume: Calls across all issues per day
# Admin engagement: Issues viewed within 1 hour of first call

# ============================================================================
# FILE STRUCTURE
# ============================================================================

# Main code:
backend/escalationService.js              # Core logic
backend/cron/escalationCron.js            # Scheduler
backend/routes/admin.routes.js            # API endpoints

# Setup & config:
backend/.env.example                      # Template
backend/scripts/migrate-escalation.js     # Database setup
backend/config/db.js                      # Indexes

# Documentation:
backend/ESCALATION_SYSTEM.md              # Full docs
backend/IMPLEMENTATION_SUMMARY.md         # What was built
backend/DEMO_GUIDE.js                     # Demo walkthrough
backend/API_EXAMPLES.js                   # Code examples
backend/QUICK_START.sh                    # This file

# ============================================================================
# COMMON WORKFLOWS
# ============================================================================

# Workflow 1: Test escalation immediately
npm run dev
# Wait 5 minutes for cron
# Check logs for [ESCALATION]
# Receive call on admin phone

# Workflow 2: Create issue and escalate manually
# 1. Insert high-severity issue in MongoDB (72+ hours old)
# 2. Run: const { checkForEscalations } = require('./escalationService')
# 3. Await checkForEscalations()
# 4. Receive call

# Workflow 3: Stop escalation
# 1. Run: curl -X POST http://localhost:3000/api/admin/issues/:id/mark-viewed
# 2. Issue marked as viewedByAdmin: true
# 3. No more calls for that issue

# ============================================================================
# NOTES
# ============================================================================

# - Call SID uniquely identifies each call (saved in escalationLogs)
# - Max 2 calls per day per issue (enforced by callsToday counter)
# - 12-hour cooldown between calls (prevents spam)
# - Automatic stop when admin views issue
# - Cron runs every 5 min in DEMO_MODE, every 1 hour in production
# - All calls logged for audit trail
# - TTS voice message auto-generated with issue details
# - Admin can press 1 to acknowledge (future: implement DTMF)

# ============================================================================
