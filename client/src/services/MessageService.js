// client/src/services/MessageService.js

const STORAGE_KEYS = {
  CONVERSATIONS: 'wavenet_conversations',
  MESSAGES: 'wavenet_messages',
  USERS: 'wavenet_users',
  FRIENDSHIPS: 'wavenet_friendships'
};

class MessageService {
  constructor() {
    this.initDefaultData();
  }

  initDefaultData() {
    // Initialize conversations if none exist
    if (!localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify([]));
    }
    
    // Initialize messages if none exist
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify({}));
    }
    
    // Initialize friendships if none exist
    if (!localStorage.getItem(STORAGE_KEYS.FRIENDSHIPS)) {
      localStorage.setItem(STORAGE_KEYS.FRIENDSHIPS, JSON.stringify([]));
    }
  }

  // Get current user
  getCurrentUser() {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    const currentUserId = localStorage.getItem('current_user') || 'user_1';
    return users.find(user => user.id === currentUserId) || {
      id: 'user_1',
      username: 'You',
      profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
      isOnline: true,
      lastSeen: new Date().toISOString()
    };
  }

  // Get all users
  getAllUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  }

  // Get user by ID
  getUserById(userId) {
    const users = this.getAllUsers();
    return users.find(user => user.id === userId);
  }

  // Get friends of current user
  getFriends() {
    const friendships = JSON.parse(localStorage.getItem(STORAGE_KEYS.FRIENDSHIPS)) || [];
    const currentUser = this.getCurrentUser();
    
    return friendships
      .filter(friendship => 
        (friendship.user1Id === currentUser.id || friendship.user2Id === currentUser.id) &&
        friendship.status === 'accepted'
      )
      .map(friendship => {
        const friendId = friendship.user1Id === currentUser.id ? friendship.user2Id : friendship.user1Id;
        return this.getUserById(friendId);
      })
      .filter(Boolean);
  }

  // Create or get conversation
  getOrCreateConversation(user1Id, user2Id) {
    const conversations = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) || [];
    
    // Check if conversation already exists
    let conversation = conversations.find(conv => 
      conv.type === 'direct' &&
      conv.participants.some(p => p.id === user1Id) &&
      conv.participants.some(p => p.id === user2Id)
    );
    
    // Create new conversation if doesn't exist
    if (!conversation) {
      const user1 = this.getUserById(user1Id);
      const user2 = this.getUserById(user2Id);
      
      if (!user1 || !user2) return null;
      
      conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'direct',
        participants: [
          { id: user1.id, username: user1.username, profilePicture: user1.profilePicture },
          { id: user2.id, username: user2.username, profilePicture: user2.profilePicture }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessage: null,
        unreadCount: 0
      };
      
      conversations.push(conversation);
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
      
      // Initialize messages for this conversation
      this.initializeConversationMessages(conversation.id);
    }
    
    return conversation;
  }

  // Initialize empty messages array for conversation
  initializeConversationMessages(conversationId) {
    const messagesData = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES)) || {};
    if (!messagesData[conversationId]) {
      messagesData[conversationId] = [];
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messagesData));
    }
  }

  // Get all conversations for current user
  getConversations() {
    const conversations = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) || [];
    const currentUser = this.getCurrentUser();
    
    return conversations
      .filter(conversation => 
        conversation.participants.some(p => p.id === currentUser.id)
      )
      .map(conversation => ({
        ...conversation,
        otherParticipant: conversation.participants.find(p => p.id !== currentUser.id),
        lastMessage: this.getLastMessage(conversation.id)
      }))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  // Get messages for a conversation
  getMessages(conversationId, limit = 50) {
    const messagesData = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES)) || {};
    const messages = messagesData[conversationId] || [];
    
    return messages
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(-limit);
  }

  // Get last message of a conversation
  getLastMessage(conversationId) {
    const messagesData = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES)) || {};
    const messages = messagesData[conversationId] || [];
    
    if (messages.length === 0) return null;
    
    const lastMessage = messages[messages.length - 1];
    return {
      content: lastMessage.content,
      createdAt: lastMessage.createdAt,
      sender: lastMessage.sender
    };
  }

  // Send a message
  sendMessage(conversationId, messageData) {
    const messagesData = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES)) || {};
    const conversations = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) || [];
    
    // Create message object
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      sender: messageData.sender,
      content: messageData.content,
      type: messageData.type || 'text',
      status: 'sent', // sent, delivered, read
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reactions: []
    };
    
    // Add message to conversation
    if (!messagesData[conversationId]) {
      messagesData[conversationId] = [];
    }
    messagesData[conversationId].push(message);
    
    // Update conversation
    const conversationIndex = conversations.findIndex(conv => conv.id === conversationId);
    if (conversationIndex !== -1) {
      conversations[conversationIndex] = {
        ...conversations[conversationIndex],
        updatedAt: new Date().toISOString(),
        lastMessage: {
          content: message.content,
          createdAt: message.createdAt,
          sender: message.sender
        }
      };
    }
    
    // Save to storage
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messagesData));
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    
    return message;
  }

  // Mark messages as read
  markAsRead(conversationId, userId) {
    const messagesData = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES)) || {};
    const messages = messagesData[conversationId] || [];
    
    const updatedMessages = messages.map(msg => {
      if (msg.sender.id !== userId && msg.status !== 'read') {
        return { ...msg, status: 'read' };
      }
      return msg;
    });
    
    messagesData[conversationId] = updatedMessages;
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messagesData));
    
    // Reset unread count
    const conversations = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) || [];
    const conversationIndex = conversations.findIndex(conv => conv.id === conversationId);
    if (conversationIndex !== -1) {
      conversations[conversationIndex].unreadCount = 0;
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    }
  }

  // Add reaction to message
  addReaction(messageId, conversationId, userId, reaction) {
    const messagesData = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES)) || {};
    const messages = messagesData[conversationId] || [];
    
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex !== -1) {
      const existingReactionIndex = messages[messageIndex].reactions.findIndex(
        r => r.userId === userId
      );
      
      if (existingReactionIndex !== -1) {
        // Update existing reaction
        messages[messageIndex].reactions[existingReactionIndex].emoji = reaction;
      } else {
        // Add new reaction
        messages[messageIndex].reactions.push({
          userId,
          emoji: reaction,
          timestamp: new Date().toISOString()
        });
      }
      
      messagesData[conversationId] = messages;
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messagesData));
    }
  }

  // Delete a message
  deleteMessage(messageId, conversationId) {
    const messagesData = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES)) || {};
    const messages = messagesData[conversationId] || [];
    
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    messagesData[conversationId] = updatedMessages;
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messagesData));
  }

  // Edit a message
  editMessage(messageId, conversationId, newContent) {
    const messagesData = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES)) || {};
    const messages = messagesData[conversationId] || [];
    
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex !== -1) {
      messages[messageIndex] = {
        ...messages[messageIndex],
        content: newContent,
        updatedAt: new Date().toISOString(),
        edited: true
      };
      
      messagesData[conversationId] = messages;
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messagesData));
    }
  }

  // Create auto-message when friendship is accepted
  createFriendshipMessage(user1Id, user2Id) {
    const user1 = this.getUserById(user1Id);
    const user2 = this.getUserById(user2Id);
    
    if (!user1 || !user2) return;
    
    // Create conversation if it doesn't exist
    const conversation = this.getOrCreateConversation(user1Id, user2Id);
    if (!conversation) return;
    
    // Send auto-welcome message
    const welcomeMessage = {
      sender: {
        id: 'system',
        username: 'WaveNet',
        profilePicture: '/wavenet-logo.png'
      },
      content: {
        text: `You're now friends on WaveNet! Start chatting with ${user2.username}.`
      },
      type: 'system'
    };
    
    this.sendMessage(conversation.id, welcomeMessage);
  }

  // Search conversations and messages
  searchMessages(query) {
    const conversations = this.getConversations();
    const currentUser = this.getCurrentUser();
    const results = [];
    
    conversations.forEach(conversation => {
      const messages = this.getMessages(conversation.id);
      
      const matchingMessages = messages.filter(msg => 
        msg.content.text && msg.content.text.toLowerCase().includes(query.toLowerCase())
      );
      
      if (matchingMessages.length > 0) {
        results.push({
          conversation,
          messages: matchingMessages
        });
      }
    });
    
    return results;
  }

  // Update user online status
  updateUserStatus(userId, isOnline = true) {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        isOnline,
        lastSeen: isOnline ? null : new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  }

  // Get typing users
  getTypingUsers(conversationId) {
    const typingData = JSON.parse(localStorage.getItem('typing_users')) || {};
    return typingData[conversationId] || [];
  }

  // Set typing status
  setTypingStatus(conversationId, userId, isTyping = true) {
    const typingData = JSON.parse(localStorage.getItem('typing_users')) || {};
    
    if (!typingData[conversationId]) {
      typingData[conversationId] = [];
    }
    
    if (isTyping) {
      if (!typingData[conversationId].includes(userId)) {
        typingData[conversationId].push(userId);
      }
    } else {
      typingData[conversationId] = typingData[conversationId].filter(id => id !== userId);
    }
    
    localStorage.setItem('typing_users', JSON.stringify(typingData));
    
    // Auto-remove typing status after 2 seconds
    if (isTyping) {
      setTimeout(() => {
        this.setTypingStatus(conversationId, userId, false);
      }, 2000);
    }
  }

  // Clear all data (for testing)
  clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('typing_users');
    this.initDefaultData();
  }
}

export default new MessageService();