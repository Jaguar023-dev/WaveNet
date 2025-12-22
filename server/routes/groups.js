// server/routes/groups.js
const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const { protect } = require('../middleware/auth');
const { check } = require('express-validator');

// @route   POST /api/groups
// @desc    Create a new group
// @access  Private
router.post('/', protect, [
  check('name', 'Group name is required').not().isEmpty(),
  check('description', 'Description must be at least 10 characters').isLength({ min: 10 }),
  check('privacy', 'Privacy must be public or private').isIn(['public', 'private'])
], async (req, res) => {
  try {
    const { name, description, privacy, coverImage } = req.body;
    
    const group = new Group({
      name,
      description,
      privacy: privacy || 'public',
      coverImage,
      createdBy: req.user.id,
      admins: [req.user.id],
      members: [req.user.id]
    });

    await group.save();
    res.status(201).json(group);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/groups
// @desc    Get all groups (with pagination)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const groups = await Group.find()
      .populate('createdBy', 'username profilePicture')
      .populate('members', 'username profilePicture')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Group.countDocuments();
    
    res.json({
      groups,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/groups/:id
// @desc    Get group by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('createdBy', 'username profilePicture firstName lastName')
      .populate('admins', 'username profilePicture firstName lastName')
      .populate('members', 'username profilePicture firstName lastName')
      .populate('pendingRequests', 'username profilePicture firstName lastName');
    
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    res.json(group);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/groups/:id
// @desc    Update group
// @access  Private (Admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    // Check if user is admin
    if (!group.admins.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Not authorized to update this group' });
    }
    
    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'createdBy' && key !== 'createdAt') {
        group[key] = updates[key];
      }
    });
    
    await group.save();
    res.json(group);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/groups/:id
// @desc    Delete group
// @access  Private (Creator or Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    // Check if user is creator or admin
    if (group.createdBy.toString() !== req.user.id && !group.admins.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Not authorized to delete this group' });
    }
    
    await group.remove();
    res.json({ msg: 'Group removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/groups/:id/join
// @desc    Join a group or request to join
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    // Check if already a member
    if (group.members.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already a member of this group' });
    }
    
    // Check if already requested
    if (group.pendingRequests.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Join request already sent' });
    }
    
    if (group.privacy === 'public') {
      // Auto-join for public groups
      group.members.push(req.user.id);
      await group.save();
      return res.json({ msg: 'Successfully joined the group' });
    } else {
      // Request to join for private groups
      group.pendingRequests.push(req.user.id);
      await group.save();
      return res.json({ msg: 'Join request sent to group admins' });
    }
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/groups/:id/leave
// @desc    Leave a group
// @access  Private
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    // Check if user is a member
    if (!group.members.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Not a member of this group' });
    }
    
    // Remove from members
    group.members = group.members.filter(memberId => 
      memberId.toString() !== req.user.id
    );
    
    // Remove from admins if they were an admin
    group.admins = group.admins.filter(adminId => 
      adminId.toString() !== req.user.id
    );
    
    await group.save();
    res.json({ msg: 'Successfully left the group' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/groups/:id/members/:userId
// @desc    Approve/Reject join request or remove member
// @access  Private (Admin only)
router.put('/:id/members/:userId', protect, async (req, res) => {
  try {
    const { action } = req.body; // 'approve', 'reject', or 'remove'
    
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    // Check if user is admin
    if (!group.admins.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    const targetUserId = req.params.userId;
    
    if (action === 'approve') {
      // Approve join request
      if (!group.pendingRequests.includes(targetUserId)) {
        return res.status(400).json({ msg: 'No pending request from this user' });
      }
      
      group.pendingRequests = group.pendingRequests.filter(id => 
        id.toString() !== targetUserId
      );
      group.members.push(targetUserId);
      
    } else if (action === 'reject') {
      // Reject join request
      group.pendingRequests = group.pendingRequests.filter(id => 
        id.toString() !== targetUserId
      );
      
    } else if (action === 'remove') {
      // Remove existing member
      if (!group.members.includes(targetUserId)) {
        return res.status(400).json({ msg: 'User is not a member' });
      }
      
      group.members = group.members.filter(id => 
        id.toString() !== targetUserId
      );
      
      // Also remove from admins if they were an admin
      group.admins = group.admins.filter(id => 
        id.toString() !== targetUserId
      );
    } else {
      return res.status(400).json({ msg: 'Invalid action' });
    }
    
    await group.save();
    res.json({ msg: `User ${action}ed successfully` });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/groups/:id/posts
// @desc    Create a post in group
// @access  Private (Members only)
router.post('/:id/posts', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    // Check if user is a member
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Only members can post in this group' });
    }
    
    // You'll need to implement post creation here
    // This would typically create a post and link it to the group
    res.json({ msg: 'Post created in group', groupId: group._id });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/groups/:id/posts
// @desc    Get posts from a group
// @access  Private (Members only for private groups)
router.get('/:id/posts', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ msg: 'Group not found' });
    }
    
    // For private groups, check membership
    if (group.privacy === 'private' && !group.members.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Not authorized to view posts in this private group' });
    }
    
    // You'll need to implement post fetching here
    // This would typically fetch posts linked to this group
    res.json({ 
      msg: 'Group posts would be fetched here',
      group: { 
        id: group._id, 
        name: group.name,
        privacy: group.privacy 
      }
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Group not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;