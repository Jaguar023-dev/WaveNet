import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Send, Paperclip, Smile, Video, Phone, MoreVertical, Search } from 'react-feather';
import useSocket from '../../hooks/useSocket';
import api from '../../utils/api';
import './Messenger.css';

const Messenger = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});

  const socket = useSocket();
  const messagesEndRef = useRef(null);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchConversations();
    
    if (socket) {
      socket.on('receive-message', handleNewMessage);
      socket.on('user-typing', handleUserTyping);
      socket.on('message-read', handleMessageRead);
      
      return () => {
        socket.off('receive-message');
        socket.off('user-typing');
        socket.off('message-read');
      };
    }
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data);
      if (response.data.length > 0 && !activeConversation) {
        setActiveConversation(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/messages/${conversationId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleNewMessage = (data) => {
    if (data.conversation === activeConversation?._id) {
      setMessages(prev => [...prev, data.message]);
      
      // Update conversation in list
      setConversations(prev => 
        prev.map(conv => 
          conv._id === data.conversation 
            ? { ...conv, lastMessage: data.message, updatedAt: new Date() }
            : conv
        )
      );
    }
  };

  const handleUserTyping = (data) => {
    setTypingUsers(prev => ({
      ...prev,
      [data.conversationId]: data.userId
    }));
    
    // Clear typing indicator after 2 seconds
    setTimeout(() => {
      setTypingUsers(prev => {
        const updated = { ...prev };
        delete updated[data.conversationId];
        return updated;
      });
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const messageData = {
      conversation: activeConversation._id,
      content: { text: newMessage },
      type: 'text'
    };

    try {
      // Emit typing stop
      socket.emit('typing-stop', {
        conversationId: activeConversation._id,
        userId: user._id
      });

      // Send message
      socket.emit('send-message', {
        roomId: activeConversation._id,
        message: messageData,
        sender: user
      });

      // Clear input
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (socket && activeConversation) {
      socket.emit('typing', {
        conversationId: activeConversation._id,
        userId: user._id
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="messenger-container">
      {/* Sidebar */}
      <div className="conversations-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <button className="new-chat-btn">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
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
        </div>
        
        <div className="conversations-list">
          {conversations.map(conversation => (
            <div
              key={conversation._id}
              className={`conversation-item ${activeConversation?._id === conversation._id ? 'active' : ''}`}
              onClick={() => {
                setActiveConversation(conversation);
                fetchMessages(conversation._id);
              }}
            >
              <div className="conversation-avatar">
                {conversation.type === 'direct' ? (
                  <img
                    src={conversation.participants[0]?.profilePicture || '/default-avatar.png'}
                    alt="Avatar"
                    className="avatar-img"
                  />
                ) : (
                  <div className="group-avatar">
                    <span>{conversation.name?.charAt(0)}</span>
                  </div>
                )}
              </div>
              
              <div className="conversation-info">
                <div className="conversation-header">
                  <h4 className="conversation-name">
                    {conversation.type === 'direct' 
                      ? conversation.participants[0]?.username
                      : conversation.name}
                  </h4>
                  <span className="conversation-time">
                    {formatTime(conversation.updatedAt)}
                  </span>
                </div>
                
                <p className="conversation-preview">
                  {conversation.lastMessage?.content?.text || 'No messages yet'}
                </p>
                
                {typingUsers[conversation._id] && (
                  <div className="typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                )}
              </div>
            </div>
          ))}
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
                  {activeConversation.type === 'direct' ? (
                    <img
                      src={activeConversation.participants[0]?.profilePicture || '/default-avatar.png'}
                      alt="Avatar"
                    />
                  ) : (
                    <div className="group-avatar-large">
                      <span>{activeConversation.name?.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="chat-user-details">
                  <h3 className="chat-user-name">
                    {activeConversation.type === 'direct'
                      ? activeConversation.participants[0]?.username
                      : activeConversation.name}
                  </h3>
                  <p className="chat-user-status">
                    {typingUsers[activeConversation._id]
                      ? 'typing...'
                      : 'Online'}
                  </p>
                </div>
              </div>
              
              <div className="chat-actions">
                <button className="chat-action-btn">
                  <Phone size={20} />
                </button>
                <button className="chat-action-btn">
                  <Video size={20} />
                </button>
                <button className="chat-action-btn">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="messages-container">
              {messages.map((message, index) => (
                <div
                  key={message._id || index}
                  className={`message ${message.sender._id === user._id ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    {message.content.text && (
                      <p className="message-text">{message.content.text}</p>
                    )}
                    
                    {message.content.media?.map((media, i) => (
                      <div key={i} className="message-media">
                        {media.type === 'image' ? (
                          <img src={media.url} alt="Media" className="media-img" />
                        ) : media.type === 'video' ? (
                          <video src={media.url} controls className="media-video" />
                        ) : (
                          <a href={media.url} download className="media-file">
                            📎 {media.name}
                          </a>
                        )}
                      </div>
                    ))}
                    
                    <span className="message-time">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {typingUsers[activeConversation._id] && (
                <div className="typing-indicator-message">
                  <div className="typing-dots">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form className="message-input-container" onSubmit={handleSendMessage}>
              <button type="button" className="input-action-btn">
                <Paperclip size={20} />
              </button>
              
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder="Type a message..."
                className="message-input"
              />
              
              <button type="button" className="input-action-btn">
                <Smile size={20} />
              </button>
              
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="send-btn"
              >
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <div className="welcome-illustration">
              <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3>Your Messages</h3>
            <p>Send private messages to a friend or group.</p>
            <button className="start-chat-btn">Start a Conversation</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messenger;