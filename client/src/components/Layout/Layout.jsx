// client/src/components/Layout/Layout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import './Layout.css';

const Layout = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { icon: 'fi fi-ts-settings', label: 'Settings & Privacy', path: '/settings' },
    { icon: 'fi fi-ts-headset-help', label: 'Help & Support', path: '/help' },
    { icon: 'fi fi-ts-user-add', label: 'Add Account', path: '/add-account' },
  ];

  const gridItems = [
    { icon: 'fi fi-ts-calendar-star', label: 'Events' },
    { icon: 'fi fi-ts-birthday-cake', label: 'Birthdays' },
    { icon: 'fi fi-ts-newspaper', label: 'Pages' },
    { icon: 'fi fi-ts-clock-rotate-left', label: 'Memories' },
    { icon: 'fi fi-ts-friends', label: 'Friends' },
    { icon: 'fi fi-ts-envelope', label: 'Messages' },
    { icon: 'fi fi-ts-store', label: 'Marketplace' },
    { icon: 'fi fi-ts-badge-check', label: 'Verification' },
  ];

  return (
    <div className="facebook-layout">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-container">
          {/* Back Button (only shows on non-home pages) */}
          <button className="back-btn" onClick={() => navigate(-1)}>
            <i className="fi fi-rr-angle-double-left"></i>
          </button>

          {/* Logo */}
          <div className="logo">
            <div className="logo-icon">🌊</div>
            <h1 className="logo-text">WaveNet</h1>
          </div>

          {/* Right Actions */}
          <div className="header-actions">
            <button className="action-btn add-story-btn">
              <i className="fi fi-tr-add"></i>
            </button>
            
            <button className="action-btn search-btn">
              <i className="fi fi-tr-search"></i>
            </button>
            
            {/* Menu Button */}
            <div className="menu-container">
              <button 
                className="action-btn menu-btn"
                onClick={() => setShowMenu(!showMenu)}
              >
                <i className="fi fi-rr-menu-burger"></i>
              </button>
              
              {/* Dropdown Menu */}
              {showMenu && (
                <div className="dropdown-menu">
                  <div className="menu-header">
                    <h3>Menu</h3>
                    <button 
                      className="close-menu"
                      onClick={() => setShowMenu(false)}
                    >
                      ✕
                    </button>
                  </div>
                  
                  {/* User Profile */}
                  <div className="menu-user">
                    <img 
                      src={user?.profile?.profilePicture?.url || '/default-avatar.png'} 
                      alt={user?.username}
                      className="menu-avatar"
                    />
                    <div className="menu-user-info">
                      <h4>{user?.username}</h4>
                      <p>See your profile</p>
                    </div>
                  </div>
                  
                  {/* Vertical Items */}
                  <div className="menu-vertical">
                    {menuItems.map((item, index) => (
                      <Link 
                        key={index} 
                        to={item.path} 
                        className="menu-item"
                        onClick={() => setShowMenu(false)}
                      >
                        <i className={item.icon}></i>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                    
                    <button className="menu-item logout-btn" onClick={handleLogout}>
                      <i className="fi fi-ts-log-out"></i>
                      <span>Log Out</span>
                    </button>
                  </div>
                  
                  {/* Grid Items (2x2 layout) */}
                  <div className="menu-grid">
                    {gridItems.map((item, index) => (
                      <button key={index} className="grid-item">
                        <i className={item.icon}></i>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="main-nav">
        <div className="nav-container">
          <Link to="/" className="nav-item">
            <i className="fi fi-rr-home"></i>
            <span className="nav-label">Home</span>
            <span className="notification-badge">20+</span>
          </Link>
          
          <Link to="/friends" className="nav-item">
            <i className="fi fi-tr-followers"></i>
            <span className="nav-label">Friends</span>
          </Link>
          
          <Link to="/messenger" className="nav-item">
            <i className="fi fi-brands-facebook-messenger-circle"></i>
            <span className="nav-label">Messenger</span>
            <span className="notification-badge">5</span>
          </Link>
          
          <Link to="/notifications" className="nav-item">
            <i className="fi fi-ts-bell-notification-social-media"></i>
            <span className="nav-label">Notifications</span>
            <span className="notification-badge">3</span>
          </Link>
          
          <Link to="/marketplace" className="nav-item">
            <i className="fi fi-ts-marketplace-alt"></i>
            <span className="nav-label">Marketplace</span>
          </Link>
        </div>
      </nav>

      {/* Separator Line */}
      <div className="nav-separator"></div>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;