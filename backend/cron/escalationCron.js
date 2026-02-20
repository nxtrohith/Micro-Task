const cron = require("node-cron");
const { checkForEscalations } = require("../escalationService");

function initializeEscalationCron() {
  console.log("[CRON] Escalation cron started (runs every 1 minute)");

  const job = cron.schedule("* * * * *", async () => {
    console.log("[CRON] Running escalation check...");
    await checkForEscalations();
  });

  return {
    job,
    stop: () => {
      job.stop();
      console.log("[CRON] Escalation cron stopped");
    },
  };
}

module.exports = { initializeEscalationCron };