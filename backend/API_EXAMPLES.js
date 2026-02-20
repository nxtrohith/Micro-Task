/**
 * ESCALATION SYSTEM - CODE EXAMPLES & API REFERENCE
 * 
 * Complete examples of how to use the escalation system
 */

// ============================================================================
// EXAMPLE 1: Understanding the Escalation Flow
// ============================================================================

/*
ESCALATION FLOW DIAGRAM:

User Reports Issue
        ↓
Issue Stored (status: "reported")
        ↓
72 HOURS PASS (if severity >= 8 & unviewed)
        ↓
Cron Job Runs (hourly or every 5 min in demo)
        ↓
checkForEscalations() executes
        ↓
Query: Find eligible issues
  - severityScore >= 8
  - status == "reported"
  - viewedByAdmin == false
  - createdAt > 72 hours ago
        ↓
For Each Eligible Issue:
  - Check daily call count (<2)
  - Check cooldown (12+ hours since last)
  - Trigger Voice Call
  - Log the attempt
        ↓
Admin Receives Automated Call
        ↓
Admin Views Issue
        ↓
Mark as Viewed: viewedByAdmin = true
        ↓
Escalation Stops (no more calls)
*/

// ============================================================================
// EXAMPLE 2: Direct Service Usage
// ============================================================================

// Accessing the escalation service directly:

const {
  checkForEscalations,
  triggerVoiceCall,
  markIssueAsViewed,
  getEscalationHistory,
  resetEscalation,
  generateVoiceMessage,
} = require('./escalationService');

// Run escalation check immediately (bypasses cron)
async function testEscalation() {
  try {
    const result = await checkForEscalations();
    console.log(`Escalation complete: ${result.escalatedCount} issues escalated`);
    console.log('Results:', result.results);
  } catch (error) {
    console.error('Escalation failed:', error);
  }
}

// Get voice message for an issue
async function previewMessage() {
  const issue = {
    _id: '507f1f77bcf86cd799439011',
    predictedIssueType: 'Water Leak',
  };

  const message = generateVoiceMessage(issue);
  console.log('Call message:', message);
  // Output: "Issue number 507f1f77bcf86cd799439011 regarding Water Leak 
  //          has not been reviewed and is marked as highly severe."
}

// Stop escalation for an issue
async function stopEscalation() {
  const issueId = '507f1f77bcf86cd799439011';
  const result = await markIssueAsViewed(issueId);
  console.log('Issue marked as viewed:', result);
}

// Get all calls sent for an issue
async function viewCallHistory() {
  const issueId = '507f1f77bcf86cd799439011';
  const history = await getEscalationHistory(issueId);
  console.log(`Total calls: ${history.totalCalls}`);
  history.calls.forEach((call) => {
    console.log(`- Call SID: ${call.callSid}`);
    console.log(`  Status: ${call.callStatus}`);
    console.log(`  Sent: ${call.callSentAt}`);
  });
}

// Reset escalation (for testing same issue multiple times)
async function resetForTesting() {
  const issueId = '507f1f77bcf86cd799439011';
  const result = await resetEscalation(issueId);
  console.log('Escalation reset - issue now eligible again');
}

// ============================================================================
// EXAMPLE 3: REST API Usage
// ============================================================================

/*
1. CREATE A HIGH-SEVERITY UNVIEWED ISSUE
   POST /api/issues
   {
     title: "Elevator Breakdown",
     description: "Lift stuck between floors",
     location: "Tower A",
     category: "Lift",
     severityScore: 9,
     status: "reported"
   }

2. WAIT 72+ HOURS (or modify createdAt in DB)

3. ESCALATION AUTOMATICALLY TRIGGERS
   [ESCALATION] Triggering voice call...
   [ESCALATION SUCCESS] Call initiated with SID: CA...

4. VIEW ESCALATION DASHBOARD
   GET /api/admin/escalation-dashboard/summary
   
   Response:
   {
     success: true,
     data: {
       unviewedHighSeverityCount: 1,
       unviewedIssues: [...],
       escalationCallsLast24h: 3,
       callsByIssue: {
         "507f1f77bcf86cd799439011": 2
       },
       recentEscalations: [...]
     }
   }

5. MARK AS VIEWED (STOPS ESCALATION)
   POST /api/admin/issues/507f1f77bcf86cd799439011/mark-viewed
   
   Response:
   {
     success: true,
     message: "Issue marked as viewed - escalation stopped",
     data: {
       _id: "507f1f77bcf86cd799439011",
       viewedByAdmin: true,
       escalationActive: true,
       lastReminderSent: "2026-02-20T14:23:45.123Z"
     }
   }

6. VIEW CALL HISTORY
   GET /api/admin/issues/507f1f77bcf86cd799439011/escalation-history
   
   Response:
   {
     success: true,
     data: {
       issueId: "507f1f77bcf86cd799439011",
       totalCalls: 2,
       calls: [
         {
           callSid: "CA7c2c14b7f5d4a2b1e0d9c8b7a6f5e4d",
           callStatus: "completed",
           message: "Issue number 507f... regarding Elevator Breakdown...",
           severity: 9,
           callSentAt: "2026-02-20T14:23:45.123Z",
           adminPhone: "+1234567890"
         },
         {
           callSid: "CA2e1d0c9b8a7f6e5d4c3b2a1",
           callStatus: "completed",
           message: "Issue number 507f... regarding Elevator Breakdown...",
           severity: 9,
           callSentAt: "2026-02-20T02:15:30.456Z",
           adminPhone: "+1234567890"
         }
       ]
     }
   }
*/

// ============================================================================
// EXAMPLE 4: Curl Commands for Testing
// ============================================================================

/*
TEST 1: Create Demo Issue
curl -X POST http://localhost:3000/api/admin/test-escalation \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

TEST 2: Get Escalation Dashboard
curl http://localhost:3000/api/admin/escalation-dashboard/summary \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

TEST 3: Mark Issue as Viewed
curl -X POST http://localhost:3000/api/admin/issues/60d5ec49f1b2c72000f1a2b3/mark-viewed \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

TEST 4: Get Escalation History
curl http://localhost:3000/api/admin/issues/60d5ec49f1b2c72000f1a2b3/escalation-history \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

TEST 5: Reset Escalation
curl -X POST http://localhost:3000/api/admin/issues/60d5ec49f1b2c72000f1a2b3/reset-escalation \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
*/

// ============================================================================
// EXAMPLE 5: Database Queries
// ============================================================================

/*
Find all issues eligible for escalation:

db.issues.find({
  severityScore: { $gte: 8 },
  status: "reported",
  viewedByAdmin: { $ne: true },
  createdAt: { $lte: new Date(Date.now() - 72 * 60 * 60 * 1000) }
})

Find all escalation logs for an issue:

db.escalationLogs.find({
  issueId: ObjectId("507f1f77bcf86cd799439011")
}).sort({ callSentAt: -1 })

Count calls sent today:

db.escalationLogs.countDocuments({
  callSentAt: {
    $gte: new Date().setHours(0, 0, 0, 0)
  }
})

Find issues with most escalation calls:

db.escalationLogs.aggregate([
  { $group: { _id: "$issueId", callCount: { $sum: 1 } } },
  { $sort: { callCount: -1 } },
  { $limit: 10 }
])
*/

// ============================================================================
// EXAMPLE 6: Monitoring & Metrics
// ============================================================================

/*
KEY METRICS TO TRACK:

1. ESCALATION RATE
   - Issues escalated per day
   - Trend over time
   
2. CALL SUCCESS RATE
   - Successful calls / Total attempts
   - Twilio API errors
   
3. RESPONSE TIME
   - Time from escalation to admin action
   - Time from call to issue viewed
   
4. CALL COUNT
   - Calls per issue (should be 1-2 per day max)
   - Total calls per day
   
5. HIGH-SEVERITY BACKLOG
   - Unviewed issues with severity >= 8
   - Hours unaddressed
*/

// ============================================================================
// EXAMPLE 7: Twilio Call Details
// ============================================================================

/*
When a call is placed, Twilio creates it with:

{
  sid: "CA1234567890abcdef",           // Unique call identifier
  dateCreated: "2026-02-20T14:23:45Z",
  dateSent: "2026-02-20T14:23:46Z",
  accountSid: "ACxxxxxxxxxxxxxxxx",
  from: "+1234567890",                 // TWILIO_PHONE_NUMBER
  to: "+0987654321",                   // ADMIN_PHONE_NUMBER
  phoneNumberSid: "PNxxxxxxxxxxxxxxxx",
  status: "queued" | "ringing" | "in-progress" | "completed" | "failed" | "noanswer",
  startTime: "2026-02-20T14:23:46Z",
  endTime: "2026-02-20T14:25:12Z",
  duration: 86,                         // seconds
  price: "-0.04",                       // cost per call
  priceUnit: "USD",
  direction: "outbound",
  answeredBy: "human" | "machine",
  uri: "/2010-04-01/Accounts/AC.../Calls/CA..."
}

The TwiML (call script) plays:
1. TTS message with issue details
2. Wait 1 second
3. Instructions to press 1
4. Collect digit input
5. Handle response or timeout
*/

// ============================================================================
// EXAMPLE 8: Error Scenarios & Recovery
// ============================================================================

/*
SCENARIO 1: Twilio Error
Error: "Invalid parameter To: Invalid phone number format"
Solution: Check ADMIN_PHONE_NUMBER format (must be +1234567890)

SCENARIO 2: Account Suspended
Error: "Account suspended due to insufficient balance"
Solution: Add credit to Twilio account

SCENARIO 3: Network Timeout
Error: "ECONNREFUSED: Connection refused"
Solution: Check MongoDB connection, retry on next cron cycle

SCENARIO 4: Invalid Issue
Error: "Issue not found"
Solution: Issue was deleted, check logs, remove from queue

RECOVERY MECHANISM:
- Automatic retry on next cron cycle (every hour or 5 min)
- Capped at 2 calls per day
- Failed calls logged with error details
- Admin notified if too many failures
*/

// ============================================================================
// EXAMPLE 9: Configuration Options
// ============================================================================

// These can be added to .env for customization:

/*
MAX_CALLS_PER_DAY=2
REMINDER_COOLDOWN_HOURS=12
ESCALATION_THRESHOLD_HOURS=72
SEVERITY_THRESHOLD=8
VOICE_TIMEOUT_SECONDS=30
RETRY_FAILED_CALLS=true
LOG_CALLS_TO_FILE=true
*/

// ============================================================================
// EXAMPLE 10: Integration with Admin Dashboard
// ============================================================================

/*
Frontend component to display escalation status:

// React component
function IssueEscalationStatus({ issueId, issue }) {
  const [history, setHistory] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/issues/${issueId}/escalation-history`)
      .then(r => r.json())
      .then(data => setHistory(data.data));
  }, [issueId]);

  return (
    <div className="escalation-status">
      <h3>Escalation Status</h3>
      {issue.severityScore >= 8 && !issue.viewedByAdmin ? (
        <div className="alert alert-danger">
          ⚠️ HIGH PRIORITY: Issue is eligible for escalation
          <p>Severity: {issue.severityScore}/10</p>
          <p>Unaddressed for: {hoursSinceCreation(issue.createdAt)} hours</p>
          <button onClick={markAsViewed}>Mark as Viewed</button>
        </div>
      ) : null}

      {history && (
        <div className="call-history">
          <h4>Escalation History ({history.totalCalls} calls)</h4>
          {history.calls.map(call => (
            <div key={call.callSid} className="call-record">
              <p>Status: {call.callStatus}</p>
              <p>Sent: {new Date(call.callSentAt).toLocaleString()}</p>
              <p>SID: {call.callSid}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
*/

// ============================================================================
// EXAMPLE 11: Performance Optimization
// ============================================================================

/*
OPTIMIZATION STRATEGIES:

1. INDEXES
   Compound index on: severityScore, status, viewedByAdmin, createdAt
   Reduces query time from ~200ms to ~10ms for 1M+ issues

2. CRON FREQUENCY
   Production: Hourly (good balance between responsiveness & load)
   Demo: Every 5 minutes (for quick testing)

3. BATCH OPERATIONS
   Process multiple escalations in single batch
   Collect call results before logging

4. CONNECTION POOLING
   MongoDB connection reused across requests
   Default pool size: 10 connections

5. ARCHIVAL
   Archive escalationLogs older than 90 days
   TTL index: callSentAt, expireAfterSeconds: 7776000
*/

module.exports = {};
