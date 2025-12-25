import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { 
  Send, Paperclip, Smile, Video, Phone, MoreVertical, Search, 
  Image as ImageIcon, Mic, X, Camera, MapPin, File, Calendar,
  Check, CheckCheck, Trash2, Edit2, Heart, ThumbsUp
} from 'react-feather';
import MessageService from '../../services/MessageService';
import './Messenger.css';

const Messenger = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showReactions, setShowReactions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const { user } = useSelector(state => state.auth || {});
  const currentUser = user || MessageService.getCurrentUser();

  // Available emojis for reactions - use string emojis
  const reactionEmojis = [
    { emoji: '❤️', label: 'Heart' },
    { emoji: '👍', label: 'Like' },
    { emoji: '😂', label: 'Laugh' },
    { emoji: '😮', label: 'Wow' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😠', label: 'Angry' }
  ];

  useEffect(() => {
    loadConversations();
    updateOnlineStatus();
    
    // Set up interval to check for new messages
    const interval = setInterval(() => {
      if (activeConversation) {
        loadMessages(activeConversation.id);
        checkTypingUsers();
      }
      updateOnlineUsers();
    }, 2000);

    return () => clearInterval(interval);
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeConversation) {
      MessageService.markAsRead(activeConversation.id, currentUser.id);
    }
  }, [activeConversation, currentUser.id]);

  const loadConversations = () => {
    const convs = MessageService.getConversations();
    setConversations(convs);
    
    // If no active conversation, set the first one
    if (convs.length > 0 && !activeConversation) {
      setActiveConversation(convs[0]);
    }
  };

  const loadMessages = (conversationId) => {
    const msgs = MessageService.getMessages(conversationId);
    setMessages(msgs);
  };

  const checkTypingUsers = () => {
    if (!activeConversation) return;
    const typing = MessageService.getTypingUsers(activeConversation.id);
    setTypingUsers(typing);
  };

  const updateOnlineStatus = () => {
    MessageService.updateUserStatus(currentUser.id, true);
  };

  const updateOnlineUsers = () => {
    const users = MessageService.getAllUsers();
    const online = users.filter(user => user.isOnline);
    setOnlineUsers(online);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const messageData = {
      sender: {
        id: currentUser.id,
        username: currentUser.username,
        profilePicture: currentUser.profilePicture
      },
      content: { text: newMessage },
      type: 'text'
    };

    MessageService.sendMessage(activeConversation.id, messageData);
    
    // Clear typing status
    MessageService.setTypingStatus(activeConversation.id, currentUser.id, false);
    
    // Update messages and conversations
    loadMessages(activeConversation.id);
    loadConversations();
    
    // Clear input
    setNewMessage('');
    messageInputRef.current?.focus();
  };

  const handleTyping = () => {
    if (activeConversation) {
      MessageService.setTypingStatus(activeConversation.id, currentUser.id, true);
    }
  };

  const handleStartNewChat = () => {
    const friends = MessageService.getFriends();
    if (friends.length === 0) {
      alert('Add some friends first to start chatting!');
      return;
    }
    
    // For now, start chat with first friend
    const firstFriend = friends[0];
    const conversation = MessageService.getOrCreateConversation(
      currentUser.id,
      firstFriend.id
    );
    
    if (conversation) {
      setActiveConversation(conversation);
      loadConversations();
    }
  };

  const handleReaction = (messageId, emoji) => {
    if (!activeConversation) return;
    
    MessageService.addReaction(
      messageId,
      activeConversation.id,
      currentUser.id,
      emoji
    );
    
    loadMessages(activeConversation.id);
    setShowReactions(false);
  };

  const handleDeleteMessage = (messageId) => {
    if (!activeConversation || !window.confirm('Delete this message?')) return;
    
    MessageService.deleteMessage(messageId, activeConversation.id);
    loadMessages(activeConversation.id);
    setSelectedMessage(null);
  };

  const handleEditMessage = (messageId, newText) => {
    if (!activeConversation || !newText.trim()) return;
    
    MessageService.editMessage(messageId, activeConversation.id, { text: newText });
    loadMessages(activeConversation.id);
    setEditingMessage(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return messageDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageStatusIcon = (status, isSender) => {
    if (!isSender) return null;
    
    switch (status) {
      case 'sent':
        return <Check size={14} />;
      case 'delivered':
        return <CheckCheck size={14} />;
      case 'read':
        return <CheckCheck size={14} className="read" />;
      default:
        return null;
    }
  };

  const getOtherParticipant = () => {
    if (!activeConversation) return null;
    return activeConversation.participants?.find(p => p.id !== currentUser.id);
  };

  const otherParticipant = getOtherParticipant();
  const isTyping = typingUsers.length > 0;

  return (
    <div className="messenger-container">
      {/* Sidebar */}
      <div className="conversations-sidebar">
        <div className="sidebar-header">
          <div className="header-left">
            <h2>Chats</h2>
            <div className="online-indicator">
              <div className="online-dot"></div>
              <span>{onlineUsers.length} online</span>
            </div>
          </div>
          <div className="header-right">
            <button 
              className="new-chat-btn"
              onClick={handleStartNewChat}
              title="New message"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button className="more-btn" title="More options">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
        
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="conversations-list">
          {conversations.length === 0 ? (
            <div className="empty-conversations">
              <div className="empty-illustration">💬</div>
              <p>No conversations yet</p>
              <button 
                className="start-chat-sidebar-btn"
                onClick={handleStartNewChat}
              >
                Start your first chat
              </button>
            </div>
          ) : (
            conversations.map(conversation => (
              <div
                key={conversation.id}
                className={`conversation-item ${activeConversation?.id === conversation.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveConversation(conversation);
                  loadMessages(conversation.id);
                  MessageService.markAsRead(conversation.id, currentUser.id);
                  loadConversations();
                }}
              >
                <div className="conversation-avatar">
                  <div className="avatar-wrapper">
                    <img
                      src={conversation.otherParticipant?.profilePicture || '/default-avatar.png'}
                      alt={conversation.otherParticipant?.username}
                      className="avatar-img"
                    />
                    {onlineUsers.some(u => u.id === conversation.otherParticipant?.id) && (
                      <div className="online-badge"></div>
                    )}
                  </div>
                </div>
                
                <div className="conversation-info">
                  <div className="conversation-header">
                    <h4 className="conversation-name">
                      {conversation.otherParticipant?.username || 'Unknown'}
                    </h4>
                    <span className="conversation-time">
                      {conversation.lastMessage ? formatTime(conversation.lastMessage.createdAt) : ''}
                    </span>
                  </div>
                  
                  <div className="conversation-preview">
                    <p className="preview-text">
                      {conversation.lastMessage?.content?.text || 'Say hello!'}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="unread-badge">{conversation.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="chat-avatar">
                  <div className="avatar-wrapper">
                    <img
                      src={otherParticipant?.profilePicture || '/default-avatar.png'}
                      alt={otherParticipant?.username}
                    />
                    {onlineUsers.some(u => u.id === otherParticipant?.id) && (
                      <div className="online-badge-large"></div>
                    )}
                  </div>
                </div>
                <div className="chat-user-details">
                  <h3 className="chat-user-name">
                    {otherParticipant?.username || 'Unknown'}
                  </h3>
                  <p className="chat-user-status">
                    {isTyping ? (
                      <span className="typing-text">typing...</span>
                    ) : onlineUsers.some(u => u.id === otherParticipant?.id) ? (
                      <span className="online-text">Online</span>
                    ) : (
                      <span className="offline-text">Offline</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="chat-actions">
                <button className="chat-action-btn" title="Voice call">
                  <Phone size={20} />
                </button>
                <button className="chat-action-btn" title="Video call">
                  <Video size={20} />
                </button>
                <button className="chat-action-btn" title="More options">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <div className="welcome-message">
                    <img
                      src={otherParticipant?.profilePicture || '/default-avatar.png'}
                      alt={otherParticipant?.username}
                      className="welcome-avatar"
                    />
                    <h3>{otherParticipant?.username}</h3>
                    <p>This is the beginning of your chat with {otherParticipant?.username}</p>
                    <p className="welcome-tip">Say hello! 👋</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const isSender = message.sender.id === currentUser.id;
                    const isSystem = message.sender.id === 'system';
                    const prevMessage = messages[index - 1];
                    const showDate = !prevMessage || 
                      new Date(message.createdAt).getDate() !== 
                      new Date(prevMessage.createdAt).getDate();
                    
                    return (
                      <React.Fragment key={message.id}>
                        {showDate && (
                          <div className="date-separator">
                            <span>{new Date(message.createdAt).toLocaleDateString('en-US', { 
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                          </div>
                        )}
                        
                        <div
                          className={`message-wrapper ${isSender ? 'sent' : 'received'} ${isSystem ? 'system' : ''}`}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            if (!isSystem) setSelectedMessage(message);
                          }}
                        >
                          {!isSender && !isSystem && (
                            <img
                              src={message.sender.profilePicture || '/default-avatar.png'}
                              alt={message.sender.username}
                              className="message-avatar"
                            />
                          )}
                          
                          <div className="message-content-wrapper">
                            {!isSender && !isSystem && (
                              <div className="message-sender">
                                {message.sender.username}
                              </div>
                            )}
                            
                            <div className={`message-bubble ${isSystem ? 'system-bubble' : ''}`}>
                              {editingMessage?.id === message.id ? (
                                <div className="edit-message-container">
                                  <input
                                    type="text"
                                    defaultValue={message.content.text}
                                    className="edit-input"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleEditMessage(message.id, e.target.value);
                                      } else if (e.key === 'Escape') {
                                        setEditingMessage(null);
                                      }
                                    }}
                                    onBlur={(e) => {
                                      if (e.target.value !== message.content.text) {
                                        handleEditMessage(message.id, e.target.value);
                                      } else {
                                        setEditingMessage(null);
                                      }
                                    }}
                                  />
                                  <button 
                                    className="edit-cancel-btn"
                                    onClick={() => setEditingMessage(null)}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  {message.content.text && (
                                    <p className="message-text">{message.content.text}</p>
                                  )}
                                  
                                  {message.edited && (
                                    <span className="edited-indicator">(edited)</span>
                                  )}
                                  
                                  <div className="message-footer">
                                    <span className="message-time">
                                      {formatTime(message.createdAt)}
                                    </span>
                                    {getMessageStatusIcon(message.status, isSender)}
                                  </div>
                                </>
                              )}
                            </div>
                            
                            {message.reactions && message.reactions.length > 0 && (
                              <div className="message-reactions">
                                {message.reactions.map((reaction, idx) => (
                                  <span key={idx} className="reaction">
                                    {reaction.emoji}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {isSender && !isSystem && (
                            <div className="message-actions">
                              <button 
                                className="message-action-btn"
                                onClick={() => setEditingMessage(message)}
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                className="message-action-btn"
                                onClick={() => handleDeleteMessage(message.id)}
                                title="Delete"
                              >
                                                     
                                <Trash2 size={14} />
                              </button>
                              <button 
                                className="message-action-btn"
                                onClick={() => setShowReactions(true)}
                                title="React"
                              >
                                <Heart size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="typing-indicator-message">
                      <div className="typing-dots">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Selected Message Menu */}
            {selectedMessage && (
              <div className="selected-message-menu">
                <div className="menu-content">
                  <button 
                    className="menu-item"
                    onClick={() => {
                      setEditingMessage(selectedMessage);
                      setSelectedMessage(null);
                    }}
                  >
                    <Edit2 size={16} />
                    <span>Edit</span>
                  </button>
                  <button 
                    className="menu-item"
                    onClick={() => {
                      handleDeleteMessage(selectedMessage.id);
                      setSelectedMessage(null);
                    }}
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                  <button 
                    className="menu-item"
                    onClick={() => {
                      setShowReactions(true);
                      setSelectedMessage(null);
                    }}
                  >
                    <Heart size={16} />
                    <span>React</span>
                  </button>
                  <button 
                    className="menu-item"
                    onClick={() => setSelectedMessage(null)}
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </div>
                <div 
                  className="menu-overlay"
                  onClick={() => setSelectedMessage(null)}
                />
              </div>
            )}

            {/* Reactions Picker */}
            {showReactions && (
              <div className="reactions-picker">
                <div className="reactions-grid">
                  {reactionEmojis.map(reaction => (
                    <button
                      key={reaction.emoji}
                      className="reaction-option"
                      onClick={() => {
                        if (selectedMessage) {
                          handleReaction(selectedMessage.id, reaction.emoji);
                        }
                      }}
                      title={reaction.label}
                    >
                      {reaction.component || reaction.emoji}
                    </button>
                  ))}
                </div>
                <div 
                  className="reactions-overlay"
                  onClick={() => setShowReactions(false)}
                />
              </div>
            )}

            {/* Message Input */}
            <form className="message-input-container" onSubmit={handleSendMessage}>
              <div className="input-actions-left">
                <div className="attachment-menu-container">
                  <button 
                    type="button" 
                    className="input-action-btn"
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    title="Attach"
                  >
                    <Paperclip size={20} />
                  </button>
                  
                  {showAttachmentMenu && (
                    <div className="attachment-menu">
                      <button type="button" className="attachment-option">
                        <ImageIcon size={18} />
                        <span>Photo & Video</span>
                      </button>
                      <button type="button" className="attachment-option">
                        <Camera size={18} />
                        <span>Camera</span>
                      </button>
                      <button type="button" className="attachment-option">
                        <File size={18} />
                        <span>Document</span>
                      </button>
                      <button type="button" className="attachment-option">
                        <MapPin size={18} />
                        <span>Location</span>
                      </button>
                      <button type="button" className="attachment-option">
                        <Calendar size={18} />
                        <span>Event</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <button 
                  type="button" 
                  className="input-action-btn"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Emoji"
                >
                  <Smile size={20} />
                </button>
              </div>
              
              <input
                ref={messageInputRef}
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder="Type a message..."
                className="message-input"
              />
              
              <div className="input-actions-right">
                {newMessage.trim() ? (
                  <button
                    type="submit"
                    className="send-btn"
                    title="Send"
                  >
                    <Send size={20} />
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="voice-btn"
                    onClick={() => setIsRecording(!isRecording)}
                    title="Voice message"
                  >
                    <Mic size={20} />
                    {isRecording && <div className="recording-indicator"></div>}
                  </button>
                )}
              </div>
              
              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="emoji-picker">
                  <div className="emoji-grid">
                    {['😀', '😂', '🥰', '😎', '🤩', '😜', '👍', '❤️', '🎉', '🔥'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        className="emoji-option"
                        onClick={() => {
                          setNewMessage(prev => prev + emoji);
                          messageInputRef.current?.focus();
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div 
                    className="emoji-overlay"
                    onClick={() => setShowEmojiPicker(false)}
                  />
                </div>
              )}
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <div className="welcome-illustration">
              <div className="message-bubble-large">💬</div>
            </div>
            <h3>WaveNet Messenger</h3>
            <p>Send and receive messages without keeping your phone online.</p>
            <p>Use WaveNet on up to 4 linked devices.</p>
            <button 
              className="start-chat-btn"
              onClick={handleStartNewChat}
            >
              Start a Conversation
            </button>
            <div className="messenger-features">
              <div className="feature">
                <div className="feature-icon">🔒</div>
                <div className="feature-text">
                  <strong>End-to-end encrypted</strong>
                  <span>Your personal messages are secured</span>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">⚡</div>
                <div className="feature-text">
                  <strong>Fast and reliable</strong>
                  <span>Messages deliver instantly</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messenger;