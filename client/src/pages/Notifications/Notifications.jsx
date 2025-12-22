import React, { useState } from 'react';
import { Bell, Check, X, Heart, MessageCircle, Users, Share2, UserPlus } from 'react-feather';
import './Notifications.css';

const Notifications = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'mentions', label: 'Mentions' },
    { id: 'reactions', label: 'Reactions' },
  ];

  const notifications = [
    { 
      id: 1, 
      type: 'like', 
      user: 'Alex Johnson', 
      action: 'liked your post', 
      time: '2 min ago', 
      read: false,
      icon: <Heart size={20} />,
      color: '#ef4444'
    },
    { 
      id: 2, 
      type: 'comment', 
      user: 'Sam Wilson', 
      action: 'commented on your post', 
      time: '1 hour ago', 
      read: false,
      icon: <MessageCircle size={20} />,
      color: '#3b82f6'
    },
    { 
      id: 3, 
      type: 'friend', 
      user: 'Taylor Swift', 
      action: 'sent you a friend request', 
      time: '3 hours ago', 
      read: true,
      icon: <UserPlus size={20} />,
      color: '#10b981'
    },
    { 
      id: 4, 
      type: 'share', 
      user: 'Chris Evans', 
      action: 'shared your post', 
      time: '5 hours ago', 
      read: true,
      icon: <Share2 size={20} />,
      color: '#8b5cf6'
    },
    { 
      id: 5, 
      type: 'group', 
      user: 'Emma Watson', 
      action: 'added you to a group', 
      time: '1 day ago', 
      read: true,
      icon: <Users size={20} />,
      color: '#f59e0b'
    },
  ];

  const handleMarkAsRead = (id) => {
    console.log('Mark as read:', id);
  };

  const handleMarkAllAsRead = () => {
    console.log('Mark all as read');
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1>
          <Bell size={32} />
          <span>Notifications</span>
          <span className="badge">3</span>
        </h1>
        
        <div className="notifications-actions">
          <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
            <Check size={18} />
            <span>Mark all as read</span>
          </button>
        </div>
      </div>

      <div className="notifications-filters">
        {filters.map(filter => (
          <button
            key={filter.id}
            className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="notifications-list">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
            <div className="notification-icon" style={{ color: notification.color }}>
              {notification.icon}
            </div>
            
            <div className="notification-content">
              <p className="notification-text">
                <strong>{notification.user}</strong> {notification.action}
              </p>
              <span className="notification-time">{notification.time}</span>
            </div>
            
            <div className="notification-actions">
              {!notification.read && (
                <button 
                  className="mark-read-btn"
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <Check size={16} />
                </button>
              )}
              <button className="dismiss-btn">
                <X size={16} />
              </button>
            </div>
            
            {!notification.read && <div className="unread-indicator"></div>}
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="empty-notifications">
          <Bell size={48} />
          <h3>No notifications</h3>
          <p>When you get notifications, they'll appear here.</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;