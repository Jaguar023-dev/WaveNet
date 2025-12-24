const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');  // Fixed: destructure protect
const { upload } = require('../middleware/upload');  // Fixed: destructure upload
const { sendNotification } = require('../utils/helpers');

// Get verification status
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)  // Changed: req.user.userId → req.user.id
      .select('isVerified verificationType verificationRequest verifiedSince username email profile');
    
    res.json({
      isVerified: user.isVerified,
      verificationType: user.verificationType,
      verificationRequest: user.verificationRequest,
      verifiedSince: user.verifiedSince
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit verification request
router.post('/request', protect, upload.single('document'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);  // Changed: req.user.userId → req.user.id
    
    // Check if already verified
    if (user.isVerified) {  // Changed: user.verification.isVerified → user.isVerified
      return res.status(400).json({ message: 'Account is already verified' });
    }
    
    // Check if pending request exists
    if (user.verificationRequest && user.verificationRequest.status === 'pending') {  // Changed: user.verification.verificationRequest → user.verificationRequest
      return res.status(400).json({ message: 'Verification request already pending' });
    }
    
    const { category, justification, website, followersCount } = req.body;
    
    // Update verification request
    user.verificationRequest = {  // Changed: user.verification.verificationRequest → user.verificationRequest
      status: 'pending',
      submittedAt: new Date(),
      category,
      justification,
      website: website || '',
      followersCount: followersCount ? parseInt(followersCount) : 0,
      supportingDocuments: req.file ? [{
        documentType: 'identity',
        url: `/uploads/verification/${req.file.filename}`,
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
router.get('/requests/pending', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {  // Changed: req.user.user.role → req.user.role
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const pendingRequests = await User.find({
      'verificationRequest.status': 'pending'  // Changed: 'verification.verificationRequest.status' → 'verificationRequest.status'
    })
    .select('username email profile isVerified verificationType verificationRequest createdAt')
    .sort({ 'verificationRequest.submittedAt': -1 });  // Changed: 'verification.verificationRequest.submittedAt' → 'verificationRequest.submittedAt'
    
    res.json(pendingRequests);
  } catch (error) {
    console.error('Pending requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve verification request (Admin only)
router.post('/:userId/approve', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {  // Changed: req.user.user.role → req.user.role
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.verificationRequest || user.verificationRequest.status !== 'pending') {  // Changed: user.verification.verificationRequest → user.verificationRequest
      return res.status(400).json({ message: 'No pending verification request' });
    }
    
    // Approve verification
    user.isVerified = true;  // Changed: user.verification.isVerified → user.isVerified
    user.verifiedSince = new Date();
    user.verificationType = user.verificationRequest.category;  // Changed: user.verification.verificationRequest.category → user.verificationRequest.category
    user.verificationRequest.status = 'approved';
    user.verificationRequest.reviewedAt = new Date();
    user.verificationRequest.reviewedBy = req.user.id;  // Changed: req.user.userId → req.user.id
    
    await user.save();
    
    // Send notification to user
    await Notification.create({
      recipient: user._id,
      type: 'verification_approved',
      title: 'Congratulations! You\'re Now Verified',
      message: 'Your WaveNet account has been verified. The blue verification badge will now appear next to your name.',
      data: {
        verifiedSince: user.verifiedSince,
        verifiedBy: req.user.id  // Changed: req.user.userId → req.user.id
      }
    });
    
    // Create notification for admin
    await Notification.create({
      recipient: req.user.id,  // Changed: req.user.userId → req.user.id
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
router.post('/:userId/reject', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {  // Changed: req.user.user.role → req.user.role
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
    
    if (!user.verificationRequest || user.verificationRequest.status !== 'pending') {  // Changed: user.verification.verificationRequest → user.verificationRequest
      return res.status(400).json({ message: 'No pending verification request' });
    }
    
    // Reject verification
    user.verificationRequest.status = 'rejected';  // Changed: user.verification.verificationRequest → user.verificationRequest
    user.verificationRequest.rejectionReason = rejectionReason;
    user.verificationRequest.reviewedAt = new Date();
    user.verificationRequest.reviewedBy = req.user.id;  // Changed: req.user.userId → req.user.id
    
    await user.save();
    
    // Send notification to user
    await Notification.create({
      recipient: user._id,
      type: 'verification_rejected',
      title: 'Verification Request Denied',
      message: `Your verification request has been denied: ${rejectionReason}`,
      data: {
        rejectionReason,
        reviewedBy: req.user.id,  // Changed: req.user.userId → req.user.id
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
router.get('/stats', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {  // Changed: req.user.user.role → req.user.role
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const totalRequests = await User.countDocuments({
      'verificationRequest.status': { $ne: 'not_requested' }  // Changed: 'verification.verificationRequest.status' → 'verificationRequest.status'
    });
    
    const pendingRequests = await User.countDocuments({
      'verificationRequest.status': 'pending'  // Changed: 'verification.verificationRequest.status' → 'verificationRequest.status'
    });
    
    const approvedRequests = await User.countDocuments({
      isVerified: true  // Changed: 'verification.isVerified' → isVerified
    });
    
    const rejectedRequests = await User.countDocuments({
      'verificationRequest.status': 'rejected'  // Changed: 'verification.verificationRequest.status' → 'verificationRequest.status'
    });
    
    // Category breakdown
    const categories = await User.aggregate([
      { $match: { isVerified: true } },  // Changed: 'verification.isVerified' → isVerified
      { $group: { 
        _id: '$verificationType',  // Changed: '$verification.verificationType' → '$verificationType'
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