// server/routes/messages.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'username profilePicture firstName lastName isOnline lastSeen')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    // Format conversation data
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== req.user.id
      );
      
      const conversationObj = conv.toObject();
      conversationObj.otherParticipant = otherParticipant;
      conversationObj.unreadCount = conv.unreadCount[req.user.id] || 0;
      
      return conversationObj;
    });

    res.json(formattedConversations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/messages/conversations/:userId
// @desc    Get or create conversation with specific user
// @access  Private
router.get('/conversations/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, userId] },
      isGroup: false
    })
    .populate('participants', 'username profilePicture firstName lastName isOnline lastSeen')
    .populate('lastMessage');
    
    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user.id, userId],
        isGroup: false,
        createdBy: req.user.id
      });
      
      await conversation.save();
      
      // Populate after save
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'username profilePicture firstName lastName isOnline lastSeen');
    }
    
    // Mark messages as read for current user
    await Message.updateMany(
      {
        conversation: conversation._id,
        sender: { $ne: req.user.id },
        readBy: { $ne: req.user.id }
      },
      { $addToSet: { readBy: req.user.id } }
    );
    
    // Reset unread count for this user
    conversation.unreadCount.set(req.user.id, 0);
    await conversation.save();
    
    res.json(conversation);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/messages/conversations/:conversationId/messages
// @desc    Get messages in a conversation
// @access  Private
router.get('/conversations/:conversationId/messages', protect, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Check if user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }
    
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Not authorized to view this conversation' });
    }
    
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'username profilePicture firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Message.countDocuments({ conversation: conversationId });
    
    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user.id },
        readBy: { $ne: req.user.id }
      },
      { $addToSet: { readBy: req.user.id } }
    );
    
    // Reset unread count
    conversation.unreadCount.set(req.user.id, 0);
    await conversation.save();
    
    res.json({
      messages: messages.reverse(), // Return in chronological order
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Conversation not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/messages/conversations/:conversationId/messages
// @desc    Send a message
// @access  Private
router.post('/conversations/:conversationId/messages', protect, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text', mediaUrl } = req.body;
    
    // Check if conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }
    
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Not authorized to send messages in this conversation' });
    }
    
    // Create message
    const message = new Message({
      conversation: conversationId,
      sender: req.user.id,
      content,
      type,
      mediaUrl
    });
    
    await message.save();
    
    // Update conversation last message and timestamp
    conversation.lastMessage = message._id;
    conversation.updatedAt = Date.now();
    
    // Increment unread count for other participants
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user.id) {
        const currentCount = conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(participantId.toString(), currentCount + 1);
      }
    });
    
    await conversation.save();
    
    // Populate sender info
    await message.populate('sender', 'username profilePicture firstName lastName');
    
    res.status(201).json(message);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Conversation not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message (only for sender)
// @access  Private
router.delete('/:messageId', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }
    
    // Check if user is the sender
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this message' });
    }
    
    await message.remove();
    
    // Update conversation last message if needed
    const conversation = await Conversation.findById(message.conversation);
    if (conversation && conversation.lastMessage.toString() === message._id.toString()) {
      // Find the most recent message
      const lastMessage = await Message.findOne({ conversation: message.conversation })
        .sort({ createdAt: -1 });
      
      conversation.lastMessage = lastMessage ? lastMessage._id : null;
      await conversation.save();
    }
    
    res.json({ msg: 'Message deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Message not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/messages/:messageId/read
// @desc    Mark message as read
// @access  Private
router.put('/:messageId/read', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }
    
    // Check if user is participant in conversation
    const conversation = await Conversation.findById(message.conversation);
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Mark as read
    if (!message.readBy.includes(req.user.id)) {
      message.readBy.push(req.user.id);
      await message.save();
      
      // Update unread count in conversation
      const currentCount = conversation.unreadCount.get(req.user.id) || 0;
      if (currentCount > 0) {
        conversation.unreadCount.set(req.user.id, currentCount - 1);
        await conversation.save();
      }
    }
    
    res.json(message);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Message not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;