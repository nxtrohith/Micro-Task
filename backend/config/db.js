const { MongoClient } = require('mongodb');

let db;

async function connectDB() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db();
  console.log('Connected to MongoDB');

  // Ensure indexes for authentication
  await db.collection('users').createIndex({ clerkUserId: 1 }, { unique: true });
  await db.collection('users').createIndex({ email: 1 }, { unique: true });

  // Ensure indexes for issues collection (including escalation)
  await db.collection('issues').createIndex({ status: 1 });
  await db.collection('issues').createIndex({ severityScore: -1 });
  await db.collection('issues').createIndex({ createdAt: -1 });
  await db.collection('issues').createIndex({ viewedByAdmin: 1 });
  
  // Compound index for escalation query optimization
  await db.collection('issues').createIndex(
    {
      severityScore: -1,
      status: 1,
      viewedByAdmin: 1,
      createdAt: 1
    },
    { name: 'escalation_query_index' }
  );

  console.log('Database indexes created');
  return db;
}

function getDB() {
  if (!db) throw new Error('Database not connected. Call connectDB() first.');
  return db;
}

module.exports = { connectDB, getDB };
