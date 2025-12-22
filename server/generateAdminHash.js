// server/generateAdminHash.js
const bcrypt = require('bcryptjs');

const password = 'Derrick9786';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  
  console.log('=== ADMIN CREDENTIALS ===');
  console.log('Email: trustynewsnetworkkenya@gmail.com');
  console.log('Password: Derrick9786');
  console.log('Bcrypt Hash:', hash);
  console.log('=========================');
  
  // Copy this hash to your HARDCODED_ADMIN.password in auth.js
});