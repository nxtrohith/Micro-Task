/**
 * ESCALATION SYSTEM - HACKATHON DEMO GUIDE
 * 
 * Quick setup and testing guide for live demos
 */

// ============================================================================
// QUICK START (5 minutes)
// ============================================================================

/*
1. INSTALL DEPENDENCIES
   cd backend
   npm install

2. CONFIGURE ENVIRONMENT
   Copy and update .env:
   - TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   - TWILIO_AUTH_TOKEN=your_auth_token_here
   - TWILIO_PHONE_NUMBER=+1234567890
   - ADMIN_PHONE_NUMBER=your_phone_number
   - DEMO_MODE=true
   - NODE_ENV=development

3. MIGRATE DATABASE
   node scripts/migrate-escalation.js

4. START SERVER
   npm run dev
   
   Watch for: "[ESCALATION SYSTEM] Active and ready..."

5. THE SYSTEM IS LIVE!
   - Cron jobs running every 5 minutes (demo mode)
   - Ready to escalate high-severity issues
*/

// ============================================================================
// TESTING SCENARIOS
// ============================================================================

/*
SCENARIO 1: Quick Demo (Create Issue Manually in MongoDB)

1. In MongoDB:
   db.issues.insertOne({
     title: "Power Outage - Main Gate",
     description: "No electricity",
     location: "Main Gate",
     predictedIssueType: "Power Outage",
     severityScore: 9,
     status: "reported",
     viewedByAdmin: false,
     escalationActive: false,
     createdAt: new Date(Date.now() - 100 * 60 * 60 * 1000), // 100 hours ago
     upvotes: []
   })

2. Wait 5 minutes (demo mode cron)
3. Check server logs for:
   [ESCALATION CHECK] Running escalation check...
   [ESCALATION] Triggering voice call...
   [ESCALATION SUCCESS] Call initiated with SID: CA...

4. Admin phone receives TTS call!
*/

// ============================================================================
// TEST ENDPOINTS
// ============================================================================

/*
ENDPOINT 1: Create Test Issue
POST /api/admin/test-escalation
Headers: Authorization: Bearer <admin-token>

Response:
{
  success: true,
  message: "Test issue prepared for escalation",
  testIssue: { ... }
}

Then wait 5 minutes for cron to trigger the call.
*/

/*
ENDPOINT 2: Get Escalation Dashboard
GET /api/admin/escalation-dashboard/summary
Headers: Authorization: Bearer <admin-token>

Response:
{
  success: true,
  data: {
    unviewedHighSeverityCount: 2,
    unviewedIssues: [...],
    escalationCallsLast24h: 5,
    callsByIssue: { issueId: 2, ... },
    recentEscalations: [...]
  }
}
*/

/*
ENDPOINT 3: Get Escalation History
GET /api/admin/issues/:id/escalation-history
Headers: Authorization: Bearer <admin-token>

Response:
{
  success: true,
  data: {
    issueId: "507f1f77bcf86cd799439011",
    totalCalls: 2,
    calls: [
      {
        callSid: "CA1234567890abcdef",
        callStatus: "completed",
        message: "Issue number 507f... regarding Power Outage...",
        severity: 9,
        callSentAt: "2026-02-20T14:23:45.123Z"
      }
    ]
  }
}
*/

/*
ENDPOINT 4: Mark Issue as Viewed
POST /api/admin/issues/:id/mark-viewed
Headers: Authorization: Bearer <admin-token>

Response:
{
  success: true,
  message: "Issue marked as viewed - escalation stopped",
  data: { ... updated issue ... }
}

This STOPS further escalation calls for this issue.
*/

/*
ENDPOINT 5: Reset Escalation (for re-testing)
POST /api/admin/issues/:id/reset-escalation
Headers: Authorization: Bearer <admin-token>

Response:
{
  success: true,
  message: "Escalation reset - issue is eligible for re-escalation",
  data: { ... updated issue ... }
}

Use this to re-test the same issue multiple times.
*/

// ============================================================================
// DEMO WALKTHROUGH
// ============================================================================

/*
LIVE DEMO SCRIPT (During Hackathon Presentation)

1. SHOW SERVER STARTUP (2 min)
   - Run: npm run dev
   - Show logs:
     ✓ Connected to MongoDB
     ✓ [CRON] Initializing escalation cron job...
     ✓ [CRON] Demo mode enabled - runs every 5 minutes
     ✓ [ESCALATION SYSTEM] Active and ready...

2. CREATE TEST ISSUE (1 min)
   - POST /api/admin/test-escalation
   - Show response with created issue
   - Issue is 100+ hours old, severity 9, unviewed

3. TRIGGER ESCALATION (1 min)
   - Wait for next cron cycle (max 5 minutes)
   - OR manually call checkForEscalations()
   - Show logs:
     [ESCALATION CHECK] Running escalation check...
     [ESCALATION CHECK] Found 1 eligible issues...
     [ESCALATION] Triggering voice call...
     [ESCALATION SUCCESS] Call initiated...

4. RECEIVE CALL (1 min)
   - Admin phone rings!
   - Play TTS message:
     "Issue number 507f... regarding Power Outage 
      has not been reviewed and is marked as highly severe
      Please take action immediately"

5. VIEW DASHBOARD (1 min)
   - GET /api/admin/escalation-dashboard/summary
   - Show unviewed issues, call counts, escalation logs

6. MARK AS VIEWED (1 min)
   - POST /api/admin/issues/:id/mark-viewed
   - Show viewedByAdmin = true
   - Explain: No more calls for this issue

Total: 7 minutes live demo
*/

// ============================================================================
// MANUAL TESTING (Node REPL)
// ============================================================================

/*
To test without waiting for cron:

1. Start Node REPL in backend directory:
   node

2. Load and test the service:
   
   const { checkForEscalations, generateVoiceMessage } = require('./escalationService');
   
   // Run escalation check immediately
   await checkForEscalations();
   
   // See issues that would be escalated
   const db = require('./config/db').getDB();
   const issues = await db.collection('issues').find({
     severityScore: { $gte: 8 },
     status: 'reported',
     viewedByAdmin: { $ne: true }
   }).toArray();
   console.log('Eligible issues:', issues.length);
   
   // Generate message for an issue
   const msg = generateVoiceMessage(issues[0]);
   console.log('Message:', msg);
*/

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

/*
PROBLEM: No cron logs appearing
FIX:
- Check NODE_ENV=development or DEMO_MODE=true
- Verify MongoDB connection: npm run dev should show "Connected to MongoDB"
- Look for any errors in startup logs

PROBLEM: Twilio call not connecting
FIX:
- Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env
- Check TWILIO_PHONE_NUMBER and ADMIN_PHONE_NUMBER are correct
- Format: +1234567890 (E.164 format)
- Twilio account must have credits and Voice enabled

PROBLEM: Cron running but no escalations
FIX:
- Create test issue with:
  * severityScore: 9 (at least 8)
  * status: "reported"
  * viewedByAdmin: false
  * createdAt: more than 72 hours ago
- Check escalation check logs for filtering details
- Manually run: await checkForEscalations()

PROBLEM: Getting 403 errors on admin endpoints
FIX:
- Include proper Authorization header (Clerk JWT)
- User must have role: 'admin' in database
- Check Clerk middleware is working: GET /
*/

// ============================================================================
// KEY METRICS TO SHOWCASE
// ============================================================================

/*
1. ESCALATION CRITERIA
   ✓ Severity >= 8
   ✓ Status = "reported"
   ✓ Admin hasn't viewed
   ✓ Unaddressed for 72+ hours
   ✓ Max 2 calls per day (intelligent throttling)
   
2. RESPONSE TIME
   - Escalation check: ~50ms per 100 issues
   - Voice call setup: ~2-3 seconds
   - Database indexes optimize queries
   
3. CALL QUALITY
   - Natural TTS voice (Alice)
   - Clear issue details in message
   - Admin can press 1 to acknowledge
   - Call recorded and logged
   
4. SYSTEM RELIABILITY
   - Error handling for all failures
   - Logging for audit trails
   - Automatic retry on next cron cycle
   - TTL cleanup of old logs
*/

// ============================================================================
// PRODUCTION DEPLOYMENT CHECKLIST
// ============================================================================

/*
Before going live:

[ ] Verify Twilio credentials and account balance
[ ] Set NODE_ENV=production (cron runs hourly, not every 5 min)
[ ] Set DEMO_MODE=false or remove env var
[ ] Run database migration: node scripts/migrate-escalation.js
[ ] Test with real admin phone number
[ ] Set up external logging (CloudWatch, DataDog)
[ ] Configure call failure webhooks
[ ] Set up monitoring/alerts for escalation spike
[ ] Backup database before migration
[ ] Document escalation policy for admins
[ ] Train admins on voice call system
[ ] Plan for Twilio cost management
[ ] Set up redundancy for critical systems
*/

module.exports = {}; // Node script
