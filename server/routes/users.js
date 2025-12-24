// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');  // Changed: destructure upload
const { validateUserUpdate } = require('../utils/validators');
const mongoose = require('mongoose');


// @route   GET /api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', protect, async (req, res) => {  // Changed: auth → protect
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('friends', 'username profilePicture firstName lastName')
      .populate('pendingFriendRequests', 'username profilePicture firstName lastName')
      .populate('sentFriendRequests', 'username profilePicture firstName lastName');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {  // Changed: auth → protect
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email -phone')
      .populate('friends', 'username profilePicture firstName lastName');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if the requesting user is friends with this user
    const isFriend = user.friends.some(friend => 
      friend._id.toString() === req.user.id
    );
    
    const userData = user.toObject();
    userData.isFriend = isFriend;
    userData.isSelf = req.user.id === req.params.id;
    
    res.json(userData);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', [protect, upload.single('profilePicture')], async (req, res) => {  // Changed: auth → protect
  const { errors, isValid } = validateUserUpdate(req.body);
  
  if (!isValid) {
    return res.status(400).json({ errors });
  }
  
  try {
    // Check if user is updating their own profile
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this profile' });
    }
    
    const updates = { ...req.body };
    
    // Handle profile picture upload
    if (req.file) {
      updates.profilePicture = {
        url: `/uploads/${req.file.filename}`,
        publicId: req.file.filename
      };
    }
    
    // Handle cover photo upload
    if (req.body.coverPhoto) {
      updates.coverPhoto = {
        url: req.body.coverPhoto,
        publicId: req.body.coverPhotoPublicId || ''
      };
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/', protect, async (req, res) => {  // Changed: auth → protect
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const searchQuery = q ? {
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    } : {};
    
    const users = await User.find(searchQuery)
      .select('username firstName lastName profilePicture bio friends')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(searchQuery);
    
    res.json({
      users,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/users/:id/friend-request
// @desc    Send friend request
// @access  Private
router.post('/:id/friend-request', protect, async (req, res) => {  // Changed: auth → protect
  try {
    // Check if user is trying to add themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ msg: 'Cannot send friend request to yourself' });
    }
    
    const [user, targetUser] = await Promise.all([
      User.findById(req.user.id),
      User.findById(req.params.id)
    ]);
    
    if (!targetUser) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if already friends
    if (user.friends.includes(targetUser._id)) {
      return res.status(400).json({ msg: 'Already friends with this user' });
    }
    
    // Check if request already sent
    if (user.sentFriendRequests.includes(targetUser._id)) {
      return res.status(400).json({ msg: 'Friend request already sent' });
    }
    
    // Check if request already received
    if (user.pendingFriendRequests.includes(targetUser._id)) {
      return res.status(400).json({ msg: 'This user has already sent you a friend request' });
    }
    
    // Add to sent requests and pending requests
    user.sentFriendRequests.push(targetUser._id);
    targetUser.pendingFriendRequests.push(user._id);
    
    await Promise.all([user.save(), targetUser.save()]);
    
    // Create notification for target user
    // You'll need to implement your notification system here
    
    res.json({ msg: 'Friend request sent successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/friend-request/:requestId
// @desc    Accept/Reject friend request
// @access  Private
router.put('/friend-request/:requestId', protect, async (req, res) => {  // Changed: auth → protect
  try {
    const { action } = req.body; // 'accept' or 'reject'
    
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ msg: 'Invalid action' });
    }
    
    const [user, sender] = await Promise.all([
      User.findById(req.user.id),
      User.findById(req.params.requestId)
    ]);
    
    if (!sender) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if request exists
    if (!user.pendingFriendRequests.includes(sender._id)) {
      return res.status(400).json({ msg: 'Friend request not found' });
    }
    
    // Remove from pending requests
    user.pendingFriendRequests = user.pendingFriendRequests.filter(
      id => id.toString() !== sender._id.toString()
    );
    
    // Remove from sender's sent requests
    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      id => id.toString() !== user._id.toString()
    );
    
    if (action === 'accept') {
      // Add to friends list for both users
      user.friends.push(sender._id);
      sender.friends.push(user._id);
    }
    
    await Promise.all([user.save(), sender.save()]);
    
    res.json({ 
      msg: `Friend request ${action}ed successfully`,
      friend: action === 'accept' ? sender : null
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/users/friend/:friendId
// @desc    Remove friend
// @access  Private
router.delete('/friend/:friendId', protect, async (req, res) => {  // Changed: auth → protect
  try {
    const [user, friend] = await Promise.all([
      User.findById(req.user.id),
      User.findById(req.params.friendId)
    ]);
    
    if (!friend) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Remove from friends list
    user.friends = user.friends.filter(
      id => id.toString() !== friend._id.toString()
    );
    
    friend.friends = friend.friends.filter(
      id => id.toString() !== user._id.toString()
    );
    
    await Promise.all([user.save(), friend.save()]);
    
    res.json({ msg: 'Friend removed successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/:id/friends
// @desc    Get user's friends
// @access  Private
router.get('/:id/friends', protect, async (req, res) => {  // Changed: auth → protect
  try {
    const user = await User.findById(req.params.id)
      .select('friends')
      .populate('friends', 'username firstName lastName profilePicture bio');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user.friends);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/:id/mutual-friends
// @desc    Get mutual friends between current user and target user
// @access  Private
router.get('/:id/mutual-friends', protect, async (req, res) => {  // Changed: auth → protect
  try {
    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.user.id).select('friends'),
      User.findById(req.params.id).select('friends')
    ]);
    
    if (!targetUser) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Find mutual friends
    const mutualFriends = await User.find({
      _id: { 
        $in: currentUser.friends.filter(friendId => 
          targetUser.friends.includes(friendId)
        )
      }
    }).select('username firstName lastName profilePicture');
    
    res.json(mutualFriends);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/online-status
// @desc    Update user's online status
// @access  Private
router.put('/online-status', protect, async (req, res) => {  // Changed: auth → protect
  try {
    const { isOnline, lastSeen } = req.body;
    
    const updateData = {};
    if (isOnline !== undefined) updateData.isOnline = isOnline;
    if (lastSeen) updateData.lastSeen = lastSeen;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    // Emit socket event for real-time updates
    // You'll need to implement socket.io broadcasting here
    
    res.json({ 
      isOnline: user.isOnline,
      lastSeen: user.lastSeen 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/suggestions
// @desc    Get friend suggestions (users you may know)
// @access  Private
router.get('/suggestions', protect, async (req, res) => {  // Changed: auth → protect
  try {
    const user = await User.findById(req.user.id).select('friends');
    
    // Find users who are not already friends and not self
    const suggestions = await User.find({
      _id: { 
        $ne: req.user.id,
        $nin: user.friends 
      }
    })
    .select('username firstName lastName profilePicture bio friends')
    .limit(10)
    .sort({ createdAt: -1 });
    
    // Calculate mutual friend count for each suggestion
    const suggestionsWithMutual = await Promise.all(
      suggestions.map(async (suggestion) => {
        const mutualCount = await User.countDocuments({
          _id: { 
            $in: user.friends.filter(friendId => 
              suggestion.friends.includes(friendId)
            )
          }
        });
        
        const suggestionObj = suggestion.toObject();
        suggestionObj.mutualFriends = mutualCount;
        return suggestionObj;
      })
    );
    
    // Sort by mutual friends (highest first)
    suggestionsWithMutual.sort((a, b) => b.mutualFriends - a.mutualFriends);
    
    res.json(suggestionsWithMutual);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/stats/:id
// @desc    Get user statistics
// @access  Private
router.get('/stats/:id', protect, async (req, res) => {  // Changed: auth → protect
  try {
    const stats = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },  // Fixed: new keyword
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'author',
          as: 'posts'
        }
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'author',
          as: 'comments'
        }
      },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'user',
          as: 'likes'
        }
      },
      {
        $project: {
          postCount: { $size: '$posts' },
          commentCount: { $size: '$comments' },
          likeCount: { $size: '$likes' },
          friendCount: { $size: '$friends' }
        }
      }
    ]);
    
    if (!stats.length) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(stats[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;