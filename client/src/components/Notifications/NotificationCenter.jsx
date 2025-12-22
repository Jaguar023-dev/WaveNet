import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, Check, X } from 'react-feather';
import { markNotificationAsRead, markAllAsRead } from '../../store/slices/notificationSlice';
import api from '../../utils/api';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    // Poll for new notifications
    const interval = setInterval(() => {
      fetchNotificationCount();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friend_request':
        return '👤';
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'share':
        return '🔄';
      case 'mention':
        return '@';
      default:
        return '🔔';
    }
  };

  const getNotificationMessage = (notification) => {
    const { type, from, post } = notification;
    const fromName = from?.username || 'Someone';
    
    switch (type) {
      case 'friend_request':
        return `${fromName} sent you a friend request`;
      case 'like':
        return `${fromName} liked your post`;
      case 'comment':
        return `${fromName} commented on your post`;
      case 'share':
        return `${fromName} shared your post`;
      case 'mention':
        return `${fromName} mentioned you in a post`;
      default:
        return 'New notification';
    }
  };

  return (
    <div className="notification-center">
      <button
        className="notification-icon"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button
                  className="mark-all-read"
                  onClick={handleMarkAllAsRead}
                >
                  <Check size={16} />
                  Mark all as read
                </button>
              )}
              <button
                className="close-notifications"
                onClick={() => setIsOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleMarkAsRead(notification._id)}
                >
                  <div className="notification-icon">
                    <span className="notification-type-icon">
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>
                  
                  <div className="notification-content">
                    <p className="notification-message">
                      {getNotificationMessage(notification)}
                    </p>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  {!notification.read && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
