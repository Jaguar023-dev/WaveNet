// server/migrations/addVerificationField.js
const mongoose = require('mongoose');
const User = require('../models/User');

async function migrateVerificationField() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const result = await User.updateMany(
    { 'verification': { $exists: false } },
    { 
      $set: { 
        'verification': {
          isVerified: false,
          verifiedSince: null,
          verificationType: null,
          verificationRequest: {
            status: 'not_requested',
            submittedAt: null,
            reviewedAt: null,
            reviewedBy: null,
            rejectionReason: null,
            supportingDocuments: [],
            justification: null,
            category: null,
            website: null,
            followersCount: 0
          }
        }
      } 
    }
  );
  
  console.log(`Updated ${result.modifiedCount} users with verification field`);
  process.exit(0);
}

migrateVerificationField().catch(console.error);