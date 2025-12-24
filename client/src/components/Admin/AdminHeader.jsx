// client/src/components/Admin/AdminHeader.jsx
import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronDown,
  User
} from 'react-feather';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import './AdminHeader.css';

const AdminHeader = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const notifications = [
    { id: 1, text: 'New verification request', time: '5 min ago', unread: true },
    { id: 2, text: 'User report submitted', time: '1 hour ago', unread: true },
    { id: 3, text: 'System update available', time: '2 hours ago', unread: false },
    { id: 4, text: 'New user registered', time: '1 day ago', unread: false },
  ];

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search users, posts, reports..."
            className="admin-search"
          />
        </div>
      </div>

      <div className="admin-header-right">
        <button 
          className="header-btn notification-btn"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell size={20} />
          <span className="notification-count">3</span>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
                <span className="mark-all">Mark all as read</span>
              </div>
              <div className="notification-list">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${notification.unread ? 'unread' : ''}`}
                  >
                    <div className="notification-dot"></div>
                    <div className="notification-content">
                      <p>{notification.text}</p>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="view-all-notifications">
                View all notifications
              </button>
            </div>
          )}
        </button>

        <button className="header-btn">
          <Settings size={20} />
        </button>

        <button className="header-btn">
          <HelpCircle size={20} />
        </button>

        <div className="user-menu-container">
          <button 
            className="user-profile-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="admin-avatar">
              {user?.profile?.profilePicture?.url ? (
                <img 
                  src={user.profile.profilePicture.url} 
                  alt={user.username}
                />
              ) : (
                <User size={20} />
              )}
            </div>
            <div className="user-info">
              <span className="username">{user?.username}</span>
              <span className="user-role">Super Admin</span>
            </div>
            <ChevronDown size={18} className={`chevron ${showUserMenu ? 'rotate' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <button className="dropdown-item">
                <User size={16} />
                <span>My Profile</span>
              </button>
              <button className="dropdown-item">
                <Settings size={16} />
                <span>Account Settings</span>
              </button>
              <div className="dropdown-divider"></div>
              <button 
                className="dropdown-item logout-item"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;