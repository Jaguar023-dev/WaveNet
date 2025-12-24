const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sendNotification } = require('../utils/helpers');

// Get verification status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('verification username email profile');
    
    res.json(user.verification);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit verification request
router.post('/request', auth, upload.single('document'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    // Check if already verified
    if (user.verification.isVerified) {
      return res.status(400).json({ message: 'Account is already verified' });
    }
    
    // Check if pending request exists
    if (user.verification.verificationRequest.status === 'pending') {
      return res.status(400).json({ message: 'Verification request already pending' });
    }
    
    const { category, justification, website, followersCount } = req.body;
    
    // Update verification request
    user.verification.verificationRequest = {
      status: 'pending',
      submittedAt: new Date(),
      category,
      justification,
      website: website || '',
      followersCount: followersCount ? parseInt(followersCount) : 0,
      supportingDocuments: req.file ? [{
        documentType: 'identity',
        url: req.file.path,
        publicId: req.file.filename
      }] : []
    };
    
    await user.save();
    
    // Send notification to admin
    const adminUsers = await User.find({ role: { $in: ['admin', 'super_admin'] } });
    for (const admin of adminUsers) {
      await Notification.create({
        recipient: admin._id,
        type: 'verification_request',
        title: 'New Verification Request',
        message: `${user.username} has submitted a verification request`,
        data: {
          userId: user._id,
          username: user.username,
          category,
          requestId: user._id.toString()
        }
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Verification request submitted successfully' 
    });
    
  } catch (error) {
    console.error('Verification request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all pending verification requests (Admin only)
router.get('/requests/pending', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const pendingRequests = await User.find({
      'verification.verificationRequest.status': 'pending'
    })
    .select('username email profile verification createdAt')
    .sort({ 'verification.verificationRequest.submittedAt': -1 });
    
    res.json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve verification request (Admin only)
router.post('/:userId/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.verification.verificationRequest.status !== 'pending') {
      return res.status(400).json({ message: 'No pending verification request' });
    }
    
    // Approve verification
    user.verification.isVerified = true;
    user.verification.verifiedSince = new Date();
    user.verification.verificationType = user.verification.verificationRequest.category;
    user.verification.verificationRequest.status = 'approved';
    user.verification.verificationRequest.reviewedAt = new Date();
    user.verification.verificationRequest.reviewedBy = req.user.userId;
    
    await user.save();
    
    // Send notification to user
    await Notification.create({
      recipient: user._id,
      type: 'verification_approved',
      title: 'Congratulations! You\'re Now Verified',
      message: 'Your WaveNet account has been verified. The blue verification badge will now appear next to your name.',
      data: {
        verifiedSince: user.verification.verifiedSince,
        verifiedBy: req.user.userId
      }
    });
    
    // Create notification for admin
    await Notification.create({
      recipient: req.user.userId,
      type: 'verification_approved_admin',
      title: 'Verification Request Approved',
      message: `You approved ${user.username}'s verification request`,
      data: {
        userId: user._id,
        username: user.username
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Verification request approved successfully' 
    });
    
  } catch (error) {
    console.error('Approve verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject verification request (Admin only)
router.post('/:userId/reject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { rejectionReason } = req.body;
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      return res.status(400).json({ 
        message: 'Rejection reason must be at least 10 characters' 
      });
    }
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.verification.verificationRequest.status !== 'pending') {
      return res.status(400).json({ message: 'No pending verification request' });
    }
    
    // Reject verification
    user.verification.verificationRequest.status = 'rejected';
    user.verification.verificationRequest.rejectionReason = rejectionReason;
    user.verification.verificationRequest.reviewedAt = new Date();
    user.verification.verificationRequest.reviewedBy = req.user.userId;
    
    await user.save();
    
    // Send notification to user
    await Notification.create({
      recipient: user._id,
      type: 'verification_rejected',
      title: 'Verification Request Denied',
      message: `Your verification request has been denied: ${rejectionReason}`,
      data: {
        rejectionReason,
        reviewedBy: req.user.userId,
        reviewedAt: new Date()
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Verification request rejected' 
    });
    
  } catch (error) {
    console.error('Reject verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get verification statistics (Admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const totalRequests = await User.countDocuments({
      'verification.verificationRequest.status': { $ne: 'not_requested' }
    });
    
    const pendingRequests = await User.countDocuments({
      'verification.verificationRequest.status': 'pending'
    });
    
    const approvedRequests = await User.countDocuments({
      'verification.isVerified': true
    });
    
    const rejectedRequests = await User.countDocuments({
      'verification.verificationRequest.status': 'rejected'
    });
    
    // Category breakdown
    const categories = await User.aggregate([
      { $match: { 'verification.isVerified': true } },
      { $group: { 
        _id: '$verification.verificationType', 
        count: { $sum: 1 } 
      }},
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      categories
    });
    
  } catch (error) {
    console.error('Verification stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;