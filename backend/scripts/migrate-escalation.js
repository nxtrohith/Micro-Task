/**
 * Database Migration Helper for Escalation System
 * 
 * This script adds escalation fields to your existing issues collection
 * and creates necessary indexes for optimal performance.
 * 
 * IMPORTANT: Back up your database before running!
 * 
 * Usage:
 * node backend/scripts/migrate-escalation.js
 */

require('dotenv').config();
const { connectDB, getDB } = require('../config/db');

async function runMigration() {
  console.log('='.repeat(60));
  console.log('ESCALATION SYSTEM DATABASE MIGRATION');
  console.log('='.repeat(60));

  try {
    // Connect to MongoDB
    await connectDB();
    const db = getDB();

    console.log('\n[1/4] Checking issues collection...');
    const issuesCollection = await db.listCollections().toArray();
    const hasIssues = issuesCollection.some(c => c.name === 'issues');

    if (!hasIssues) {
      console.warn('⚠️  Issues collection not found. Creating...');
      await db.createCollection('issues');
    } else {
      console.log('✓ Issues collection exists');
    }

    console.log('\n[2/4] Adding escalation fields to existing issues...');
    const result = await db.collection('issues').updateMany(
      {
        // Only update documents that don't already have the fields
        $or: [
          { viewedByAdmin: { $exists: false } },
          { escalationActive: { $exists: false } },
          { lastReminderSent: { $exists: false } }
        ]
      },
      {
        $set: {
          viewedByAdmin: false,
          escalationActive: false,
          lastReminderSent: null
        }
      }
    );

    console.log(`✓ Updated ${result.modifiedCount} documents`);
    console.log(`  - Matched: ${result.matchedCount} documents`);

    console.log('\n[3/4] Creating indexes for issues collection...');

    // Single field indexes
    await db.collection('issues').createIndex({ viewedByAdmin: 1 });
    console.log('✓ Created index: { viewedByAdmin: 1 }');

    await db.collection('issues').createIndex({ escalationActive: 1 });
    console.log('✓ Created index: { escalationActive: 1 }');

    await db.collection('issues').createIndex({ lastReminderSent: 1 });
    console.log('✓ Created index: { lastReminderSent: 1 }');

    // Compound index for escalation queries (optimizes checkForEscalations)
    await db.collection('issues').createIndex(
      {
        severityScore: -1,
        status: 1,
        viewedByAdmin: 1,
        createdAt: 1
      },
      { name: 'escalation_query_index' }
    );
    console.log('✓ Created compound index for escalation queries');

    console.log('\n[4/4] Creating escalationLogs collection and indexes...');

    // Create escalationLogs collection if it doesn't exist
    const logCollections = await db.listCollections().toArray();
    const hasLogs = logCollections.some(c => c.name === 'escalationLogs');

    if (!hasLogs) {
      await db.createCollection('escalationLogs');
      console.log('✓ Created escalationLogs collection');
    } else {
      console.log('✓ escalationLogs collection already exists');
    }

    // Create indexes on escalationLogs
    await db.collection('escalationLogs').createIndex({ issueId: 1, callSentAt: -1 });
    console.log('✓ Created index: { issueId: 1, callSentAt: -1 }');

    await db.collection('escalationLogs').createIndex({ callSentAt: 1 });
    console.log('✓ Created index: { callSentAt: 1 }');

    await db.collection('escalationLogs').createIndex(
      { callSentAt: 1 },
      { expireAfterSeconds: 7776000 } // Auto-delete after 90 days
    );
    console.log('✓ Created TTL index: callSentAt (90-day retention)');

    console.log('\n' + '='.repeat(60));
    console.log('✅ MIGRATION COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));

    console.log('\n📋 Next Steps:');
    console.log('1. Verify .env has Twilio credentials');
    console.log('2. Start server: npm run dev');
    console.log('3. Test with: curl http://localhost:3000/api/admin/test-escalation');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED');
    console.error('Error:', error.message);
    console.error('\nPlease ensure:');
    console.error('- MongoDB is running');
    console.error('- MONGO_URI in .env is correct');
    console.error('- You have database write permissions');
    process.exit(1);
  }
}

// Run migration
runMigration();
