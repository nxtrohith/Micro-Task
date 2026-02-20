/**
 * ESCALATION SYSTEM - ARCHITECTURE & FLOW DIAGRAMS
 * 
 * Visual reference for understanding the system components
 */

// ============================================================================
// SYSTEM ARCHITECTURE
// ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────┐
│                         GATED COMMUNITY PLATFORM                    │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌─────────────────────────────┐
│   Frontend Dashboard     │         │   User Mobile App           │
│                          │         │                             │
│  - Admin views issues    │         │  - Report new issues        │
│  - See call history      │         │  - Upload images            │
│  - Mark as viewed        │         │  - Add severity rating      │
└──────────────┬───────────┘         └─────────────┬───────────────┘
               │                                    │
               └────────────────┬───────────────────┘
                                │
                    ┌───────────▼──────────┐
                    │    Express Server    │
                    │   (Node.js Backend)  │
                    └───────────┬──────────┘
                                │
                    ┌───────────┴──────────────┬─────────────┐
                    │                          │             │
        ┌───────────▼──────────┐   ┌───────────▼────────┐   │
        │  Issue Routes API    │   │ Admin Routes API   │   │
        │                      │   │                    │   │
        │ POST /api/issues     │   │ /mark-viewed       │   │
        │ GET /api/issues/:id  │   │ /escalation-history│   │
        │ PATCH /api/issues/:id│   │ /reset-escalation  │   │
        └──────────┬───────────┘   │ /dashboard/summary │   │
                   │               └────────────────────┘   │
                   │                                        │
                ┌──▼─────────────────────────────┐         │
                │  MongoDB Database              │         │
                │                                │         │
                │  issues collection             │         │
                │  - status                      │         │
                │  - severityScore               │         │
                │  - viewedByAdmin ← (NEW)       │         │
                │  - escalationActive ← (NEW)    │         │
                │  - lastReminderSent ← (NEW)    │         │
                │                                │         │
                │  escalationLogs collection     │         │
                │  - callSid                     │         │
                │  - callStatus                  │         │
                │  - callSentAt                  │         │
                └────────────────────────────────┘         │
                                                           │
                                    ┌──────────────────────▼──────────┐
                                    │  ESCALATION SERVICE             │
                                    │  (escalationService.js)         │
                                    │                                 │
                                    │  checkForEscalations()          │
                                    │  - Query eligible issues        │
                                    │  - Check call count             │
                                    │  - Trigger voice calls          │
                                    │  - Log attempts                 │
                                    │                                 │
                                    │  triggerVoiceCall()             │
                                    │  - Create TwiML script          │
                                    │  - Call Twilio API              │
                                    │  - Handle response              │
                                    │                                 │
                                    │  Supporting functions:          │
                                    │  - markIssueAsViewed()          │
                                    │  - getEscalationHistory()       │
                                    │  - resetEscalation()            │
                                    └──────────────┬───────────────────┘
                                                   │
                                    ┌──────────────▼──────────┐
                                    │  CRON JOB               │
                                    │  (escalationCron.js)    │
                                    │                         │
                                    │  Production:            │
                                    │  Every hour: 0 * * * *  │
                                    │                         │
                                    │  Demo:                  │
                                    │  Every 5 min: */5 * *   │
                                    │                         │
                                    │  Triggers:              │
                                    │  checkForEscalations()  │
                                    └──────────────┬──────────┘
                                                   │
                                    ┌──────────────▼──────────────┐
                                    │  TWILIO VOICE API           │
                                    │                             │
                                    │  Outbound calls to admin    │
                                    │  - TTS message generation   │
                                    │  - Call placement           │
                                    │  - Status tracking          │
                                    │                             │
                                    │  ADMIN_PHONE receives call! │
                                    └─────────────────────────────┘
*/

// ============================================================================
// ESCALATION FLOW - DETAILED SEQUENCE
// ============================================================================

/*
STEP 1: ISSUE CREATED
  User → POST /api/issues
         {
           title: "Elevator Broken",
           description: "...",
           severity: 9,
           status: "reported"
         }
         ↓
     MongoDB stores:
     {
       _id: ObjectId,
       status: "reported",
       severityScore: 9,
       viewedByAdmin: false          ← NEW
       escalationActive: false        ← NEW
       lastReminderSent: null         ← NEW
       createdAt: 2026-02-20T10:00Z
     }

STEP 2: TIME PASSES (72+ HOURS)
  ┌─────────────────────────────┐
  │  Current Time: >72h later    │
  │  Status: still "reported"    │
  │  Admin viewed: NO            │
  │  Eligible: YES ✓             │
  └──────────────┬──────────────┘
                 │

STEP 3: CRON JOB TRIGGERS
  2026-02-20 14:00:00 UTC
  [CRON] Escalation check triggered
         ↓
     execute: checkForEscalations()

STEP 4: DATABASE QUERY
     db.issues.find({
       severityScore: { $gte: 8 },
       status: "reported",
       viewedByAdmin: { $ne: true },
       createdAt: {
         $lte: 72 hours ago
       }
     })
     ↓
     Result: 1 issue found (our elevator issue)

STEP 5: CHECK CALL LIMITS
     getCallCountToday(issueId)
     ↓
     Calls today: 0 (< 2 limit) ✓
     Last reminder: null        ✓
     Eligible for call: YES

STEP 6: GENERATE MESSAGE
     generateVoiceMessage(issue)
     ↓
     Message: "Issue number 507f...
               regarding Elevator
               has not been reviewed
               and is marked as highly severe."

STEP 7: CREATE TWIML & CALL TWILIO
     client.calls.create({
       url: data:application/xml,<?xml...>,
       to: "+0987654321",
       from: "+1234567890"
     })
     ↓
     Response: {
       sid: "CA1234567890abcdef",
       status: "queued"
     }

STEP 8: LOG CALL ATTEMPT
     db.escalationLogs.insertOne({
       issueId: ObjectId,
       callSid: "CA1234567890abcdef",
       callStatus: "queued",
       message: "Issue number 507f...",
       severity: 9,
       callSentAt: 2026-02-20T14:00:01Z,
       adminPhone: "+0987654321"
     })

STEP 9: UPDATE ISSUE METADATA
     db.issues.updateOne(
       { _id: issueId },
       {
         $set: {
           lastReminderSent: 2026-02-20T14:00:01Z,
           escalationActive: true
         }
       }
     )

STEP 10: ADMIN RECEIVES CALL
        [PHONE RINGS] 📞
        ↓
        TTS Voice plays:
        "Issue number 507f1f77...
         regarding Elevator Breakdown
         has not been reviewed and is
         marked as highly severe.
         Please take action immediately.
         Press 1 to acknowledge or
         hang up to ignore."
        ↓
        Admin presses 1 (or hangs up)
        ↓
        Call duration: 45 seconds
        ↓
        Twilio updates call status: "completed"

STEP 11: ADMIN TAKES ACTION
        Via dashboard or API:
        POST /api/admin/issues/507f.../mark-viewed
        ↓
        markIssueAsViewed(issueId)
        ↓
        db.issues.updateOne(
          { _id: issueId },
          { $set: { viewedByAdmin: true } }
        )

STEP 12: ESCALATION STOPS
        Next cron cycle, checkForEscalations():
        ✓ severityScore >= 8 ✓
        ✓ status == "reported" ✓
        ✗ viewedByAdmin != false   ← FAILED
        
        Issue NOT escalated (NO MORE CALLS)
        
        [ESCALATION] Issue marked as viewed
        [ESCALATION] No more calls for issue
*/

// ============================================================================
// CALL COUNT MANAGEMENT
// ============================================================================

/*
DAILY CALL TRACKING:

Day 1 (2026-02-20):
  14:00 - Call 1 sent ✓
         callsToday = 1
         lastReminderSent = 2026-02-20T14:00Z

  18:00 - Another cron cycle
         getCallCountToday() = 1 (< 2 limit) ✓
         But: now - lastReminderSent = 4 hours (< 12 hour cooldown)
         ✗ Cooldown active - SKIP call

  23:00 - Another cron cycle
         getCallCountToday() = 1 (< 2 limit) ✓
         But: now - lastReminderSent = 9 hours (< 12 hour cooldown)
         ✗ Cooldown active - SKIP call

Day 2 (2026-02-21):
  02:00 - Another cron cycle
         now - lastReminderSent = 12 hours ✓
         getCallCountToday() = 0 (new day)
         Call 2 sent ✓
         callsToday = 1 (new day counter)
         lastReminderSent = 2026-02-21T02:00Z

  06:00 - Another cron cycle
         getCallCountToday() = 1 (< 2 limit) ✓
         But: now - lastReminderSent = 4 hours (< 12 hour cooldown)
         ✗ Cooldown active - SKIP call

  14:00 - Another cron cycle
         getCallCountToday() = 1 (< 2 limit) ✓
         But: now - lastReminderSent = 12 hours ✓
         Call 3 sent ✓
         callsToday = 2
         lastReminderSent = 2026-02-21T14:00Z

  18:00 - Another cron cycle
         getCallCountToday() = 2 (>= 2 limit)
         ✗ Max calls today reached - SKIP call

Day 3 onwards:
  Until admin marks as viewed or status changes,
  system continues checking with same logic
  Max 2 calls every 12 hours (every 24+ hours practically)
*/

// ============================================================================
// ADMIN DASHBOARD VIEW
// ============================================================================

/*
GET /api/admin/escalation-dashboard/summary

Response:
{
  success: true,
  data: {
    unviewedHighSeverityCount: 3,
    
    unviewedIssues: [
      {
        _id: "507f1f77bcf86cd799439011",
        title: "Elevator Broken",
        severity: 9,
        status: "reported",
        createdAt: "2026-02-20T10:00Z",
        predictedIssueType: "Lift",
        hoursUnaddressed: 76
      },
      { ... },
      { ... }
    ],
    
    escalationCallsLast24h: 5,
    
    callsByIssue: {
      "507f1f77bcf86cd799439011": 2,
      "507f1f77bcf86cd799439012": 2,
      "507f1f77bcf86cd799439013": 1
    },
    
    recentEscalations: [
      {
        issueId: "507f1f77bcf86cd799439011",
        callSid: "CA1234567890abcdef",
        callStatus: "completed",
        callSentAt: "2026-02-21T14:00Z",
        message: "Issue number 507f... regarding Elevator..."
      },
      { ... },
      { ... }
    ]
  }
}

Display:
┌──────────────────────────────────────────┐
│     ESCALATION DASHBOARD                 │
├──────────────────────────────────────────┤
│                                          │
│  ⚠️  High Priority Issues: 3             │
│                                          │
│  Calls Today (24h): 5                    │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ UNVIEWED ISSUES                    │  │
│  ├────────────────────────────────────┤  │
│  │ 🔴 Elevator Broken (Sev: 9)        │  │
│  │    Unaddressed: 76 hours           │  │
│  │    Calls sent: 2                   │  │
│  │    [Mark as Viewed] [View History] │  │
│  ├────────────────────────────────────┤  │
│  │ 🔴 Power Outage (Sev: 8.5)         │  │
│  │    Unaddressed: 84 hours           │  │
│  │    Calls sent: 2                   │  │
│  │    [Mark as Viewed] [View History] │  │
│  ├────────────────────────────────────┤  │
│  │ 🟠 Water Leak (Sev: 8)             │  │
│  │    Unaddressed: 48 hours           │  │
│  │    Calls sent: 1                   │  │
│  │    [Mark as Viewed] [View History] │  │
│  └────────────────────────────────────┘  │
│                                          │
└──────────────────────────────────────────┘
*/

// ============================================================================
// ERROR HANDLING FLOW
// ============================================================================

/*
ERROR SCENARIO: Twilio API Error

checkForEscalations()
    ↓
triggerVoiceCall(issue)
    ↓
client.calls.create({...})
    ↓
❌ Error: "Authentication failed"
    ↓
catch (error) {
  console.error('[ESCALATION ERROR]', error)
  ↓
  return { success: false, error: "Authentication failed" }
}
    ↓
escalationResults.push({
  issueId: issue._id,
  status: 'failed',
  error: "Authentication failed"
})
    ↓
❌ Issue NOT updated (lastReminderSent not set)
❌ Call NOT logged
✓ Error logged in console
✓ Will retry on next cron cycle (1 hour or 5 min in demo)
    ↓
NEXT CYCLE: 1 hour later
    ↓
checkForEscalations() runs again
    ↓
Same issue passed the query again (still eligible)
    ↓
triggerVoiceCall() retried
    ↓
(If Twilio is fixed, call succeeds this time)
*/

// ============================================================================
// PERFORMANCE OPTIMIZATION
// ============================================================================

/*
QUERY OPTIMIZATION:

Without Index (SLOW):
  db.issues.find({
    severityScore: { $gte: 8 },
    status: "reported",
    viewedByAdmin: { $ne: true },
    createdAt: { $lte: Date }
  })
  
  Execution: ~200ms
  Records scanned: 1,000,000 all documents
  Records projected: ~100 matches
  Efficiency: 0.01%

With Compound Index (FAST):
  db.issues.createIndex({
    severityScore: -1,
    status: 1,
    viewedByAdmin: 1,
    createdAt: 1
  }, { name: 'escalation_query_index' })
  
  Execution: ~10ms
  Records scanned: ~100 (via index)
  Records projected: ~100 matches
  Efficiency: 100%
  
  ✓ 20x faster!
*/

// ============================================================================
// STATE MACHINE
// ============================================================================

/*
Issue Lifecycle with Escalation States:

                    ┌─────────────────────┐
                    │    Issue Created    │
                    │  (status: reported) │
                    │ (viewedByAdmin: F)  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┤
              │                │
         <72h │                │ >=72h OR
             │                │ adminViews
        ┌────▼────┐      ┌────▼─────────┐
        │NO CALL  │      │ELIGIBLE FOR  │
        │Required │      │ ESCALATION   │
        │         │      │              │
        └─────────┘      └────┬─────────┘
                              │
                    ┌─────────┼─────────┐
                    │                   │
              callCount       12-hour cooldown
                < 2           passed
                │                   │
           ┌────▼────┐        ┌────▼─────────┐
           │ SEND    │        │ SEND CALL    │
           │ CALL    │        │ (again)      │
           │         │        │              │
           └────┬────┘        └────┬─────────┘
                │                  │
                └──────────┬────────┘
                           │
                    Admin receives call
                           │
            ┌──────────────┬──────────────┐
            │              │              │
        Presses 1    Hangs up or    (no action)
        (optional)    ignored
            │              │              │
            └──────────────┴──────┬───────┘
                                 │
                        Admin views issue
                        (via dashboard
                         or API call)
                                 │
                        viewedByAdmin: true
                                 │
                    ┌────────────▼──────────┐
                    │  ESCALATION STOPS    │
                    │  (no more calls)     │
                    └──────────────────────┘
                                 │
         (Optional continuation path)
         Admin updates status to
         "in_progress" or "resolved"
                                 │
                    ┌────────────▼──────────┐
                    │  Issue Fully Resolved │
                    │                      │
                    └──────────────────────┘
*/

module.exports = {};
