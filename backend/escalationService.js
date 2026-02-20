const twilio = require("twilio");
const { getDB } = require("./config/db");
const { ObjectId } = require("mongodb");

/* ===============================
   TWILIO INITIALIZATION (SAFE)
================================= */

let client = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  console.log("✅ Twilio client initialized");
} else {
  console.log("⚠ Twilio credentials missing. Running in DEMO mode.");
}

const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;
const ADMIN_PHONE = process.env.ADMIN_PHONE_NUMBER;

/* ===============================
   GENERATE MESSAGE
================================= */

function generateVoiceMessage(issue) {
  return `Issue number ${issue._id} has not been reviewed. Please check the issue immediately.`;
}

/* ===============================
   TRIGGER VOICE CALL
================================= */

async function triggerVoiceCall(issue) {
  try {
    if (!client) {
      console.log(`📞 [DEMO MODE] Would call admin for issue ${issue._id}`);
      return {
        success: true,
        sid: "DEMO_CALL",
        timestamp: new Date(),
      };
    }

    if (!TWILIO_PHONE || !ADMIN_PHONE) {
      throw new Error("Twilio phone numbers not configured");
    }

    const message = generateVoiceMessage(issue);

    const twiml = `
      <Response>
        <Say voice="alice">${message}</Say>
      </Response>
    `;

    const call = await client.calls.create({
      twiml: twiml,
      to: ADMIN_PHONE,
      from: TWILIO_PHONE,
    });

    console.log(`📞 Real call initiated with SID: ${call.sid}`);

    return {
      success: true,
      sid: call.sid,
      timestamp: new Date(),
    };

  } catch (error) {
    console.error("❌ Voice call failed:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/* ===============================
   MAIN ESCALATION CHECK
================================= */

async function checkForEscalations() {
  try {
    console.log(`\n[ESCALATION CHECK] ${new Date().toISOString()}`);

    const db = getDB();

    // RULE: status = reported AND older than 5 minutes AND not already escalated
    const escalationCriteria = {
      status: "reported",
      lastReminderSent: { $exists: false }, // prevent repeat calls
      createdAt: {
        $lte: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes
      },
    };

    const eligibleIssues = await db
      .collection("issues")
      .find(escalationCriteria)
      .toArray();

    console.log(`[ESCALATION] Found ${eligibleIssues.length} eligible issues`);

    for (const issue of eligibleIssues) {

      const callResult = await triggerVoiceCall(issue);

      if (callResult.success) {

        await db.collection("issues").updateOne(
          { _id: issue._id },
          {
            $set: {
              lastReminderSent: new Date(),
              escalationActive: true,
            },
          }
        );

        await db.collection("escalationLogs").insertOne({
          issueId: issue._id,
          callSid: callResult.sid,
          callSentAt: new Date(),
          status: issue.status,
        });

        console.log(`🚨 Escalation triggered for issue ${issue._id}`);
      }
    }

    console.log("[ESCALATION CHECK COMPLETE]");

  } catch (error) {
    console.error("❌ Escalation check failed:", error.message);
  }
}

module.exports = {
  checkForEscalations,
};