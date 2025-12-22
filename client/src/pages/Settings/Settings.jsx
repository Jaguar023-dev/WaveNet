import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Lock, Bell, Eye, Shield, HelpCircle, LogOut } from 'react-feather';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    friendRequests: true,
    comments: true,
    mentions: true,
  });

  const tabs = [
    { id: 'account', label: 'Account', icon: <User size={20} /> },
    { id: 'privacy', label: 'Privacy', icon: <Lock size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'security', label: 'Security', icon: <Shield size={20} /> },
    { id: 'appearance', label: 'Appearance', icon: <Eye size={20} /> },
    { id: 'help', label: 'Help', icon: <HelpCircle size={20} /> },
  ];

  const handleToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLogout = () => {
    console.log('Logging out...');
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>
          <SettingsIcon size={32} />
          <span>Settings</span>
        </h1>
        <p className="settings-subtitle">Manage your account settings and preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
            
            <button className="settings-tab logout" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </nav>
        </div>

        <div className="settings-main">
          {activeTab === 'account' && (
            <div className="settings-section">
              <h2>Account Settings</h2>
              <div className="settings-form">
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" placeholder="Enter username" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="Enter email" />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea placeholder="Tell us about yourself" rows="4" />
                </div>
                <button className="save-btn">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy Settings</h2>
              <div className="privacy-options">
                <div className="privacy-option">
                  <h3>Profile Visibility</h3>
                  <select>
                    <option>Public</option>
                    <option>Friends Only</option>
                    <option>Private</option>
                  </select>
                </div>
                <div className="privacy-option">
                  <h3>Who can send you friend requests?</h3>
                  <select>
                    <option>Everyone</option>
                    <option>Friends of Friends</option>
                    <option>No one</option>
                  </select>
                </div>
                <div className="privacy-option">
                  <h3>Who can see your friends list?</h3>
                  <select>
                    <option>Public</option>
                    <option>Friends Only</option>
                    <option>Only Me</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              <div className="notification-options">
                <div className="notification-option">
                  <div>
                    <h3>Email Notifications</h3>
                    <p>Receive notifications via email</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.email}
                      onChange={() => handleToggle('email')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="notification-option">
                  <div>
                    <h3>Push Notifications</h3>
                    <p>Receive push notifications on your device</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.push}
                      onChange={() => handleToggle('push')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="notification-option">
                  <div>
                    <h3>Friend Requests</h3>
                    <p>Get notified about friend requests</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.friendRequests}
                      onChange={() => handleToggle('friendRequests')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="notification-option">
                  <div>
                    <h3>Comments</h3>
                    <p>Get notified about comments on your posts</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.comments}
                      onChange={() => handleToggle('comments')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              <div className="security-options">
                <button className="security-btn">Change Password</button>
                <button className="security-btn">Two-Factor Authentication</button>
                <button className="security-btn">Login Activity</button>
                <button className="security-btn">Connected Devices</button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h2>Appearance Settings</h2>
              <div className="appearance-options">
                <div className="theme-options">
                  <h3>Theme</h3>
                  <div className="theme-buttons">
                    <button className="theme-btn light">Light</button>
                    <button className="theme-btn dark">Dark</button>
                    <button className="theme-btn auto">Auto</button>
                  </div>
                </div>
                <div className="font-options">
                  <h3>Font Size</h3>
                  <select>
                    <option>Small</option>
                    <option>Medium</option>
                    <option>Large</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="settings-section">
              <h2>Help & Support</h2>
              <div className="help-options">
                <button className="help-btn">Help Center</button>
                <button className="help-btn">Contact Support</button>
                <button className="help-btn">Report a Problem</button>
                <button className="help-btn">Terms of Service</button>
                <button className="help-btn">Privacy Policy</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;