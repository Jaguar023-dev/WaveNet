// server/utils/seedAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wavenet');
    console.log('Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: 'admin@wavenet.com' },
        { username: 'WaveNet Support' }
      ] 
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      
      // Update existing admin to ensure correct role
      existingAdmin.role = 'super_admin';
      existingAdmin.isVerified = true;
      await existingAdmin.save();
      console.log('Admin user updated');
      
      mongoose.connection.close();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('WaveNet@support1411', 10);
    
    const adminUser = new User({
      username: 'WaveNet Support',
      email: 'admin@wavenet.com',
      password: hashedPassword,
      role: 'super_admin',
      isVerified: true,
      profile: {
        firstName: 'WaveNet',
        lastName: 'Support',
        bio: 'Official WaveNet Administrator',
        location: 'Global',
        website: 'https://wavenet.com',
        profilePicture: {
          url: '/admin-avatar.png' // You can add a special admin avatar
        }
      },
      privacySettings: {
        profileVisibility: 'private',
        postVisibility: 'private',
        showOnlineStatus: false,
        allowFriendRequests: false,
        allowMessages: 'friends'
      }
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Username: WaveNet Support');
    console.log('Email: admin@wavenet.com');
    console.log('Password: WaveNet@support1411');
    console.log('Role: super_admin');
    console.log('Verified: true');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

// Run the script
seedAdmin();