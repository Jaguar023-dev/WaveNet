// client/src/components/Layout/Layout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { 
  Home, 
  Users, 
  MessageCircle, 
  Bell, 
  ShoppingBag,
  Menu,
  X,
  ChevronLeft,
  Plus,
  Search,
  Settings,
  HelpCircle,
  UserPlus,
  LogOut,
  Calendar,
  MapPin,
  Clock,
  Flag,
  CheckCircle
} from 'react-feather';
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
    { icon: <Settings size={20} />, label: 'Settings & Privacy', path: '/settings' },
    { icon: <HelpCircle size={20} />, label: 'Help & Support', path: '/help' },
    { icon: <UserPlus size={20} />, label: 'Add Account', path: '/add-account' },
  ];

  const gridItems = [
    { icon: <Calendar size={20} />, label: 'Events', path: '/events' },
    { icon: '🎂', label: 'Birthdays', path: '/birthdays' },
    { icon: '📰', label: 'Pages', path: '/pages' },
    { icon: <Clock size={20} />, label: 'Memories', path: '/memories' },
    { icon: <Users size={20} />, label: 'Friends', path: '/friends' },
    { icon: <MessageCircle size={20} />, label: 'Messages', path: '/messenger' },
    { icon: <ShoppingBag size={20} />, label: 'Marketplace', path: '/marketplace' },
    { icon: <CheckCircle size={20} />, label: 'Verification', path: '/verification' },
  ];

  return (
    <div className="facebook-layout">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-container">
          {/* Back Button (only shows on non-home pages) */}
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft size={24} />
          </button>

          {/* Logo */}
          <div className="logo">
            <div className="logo-icon">🌊</div>
            <h1 className="logo-text">WaveNet</h1>
          </div>

          {/* Right Actions */}
          <div className="header-actions">
            <button className="action-btn add-story-btn">
              <Plus size={20} />
            </button>
            
            <button className="action-btn search-btn">
              <Search size={20} />
            </button>
            
            {/* Menu Button */}
            <div className="menu-container">
              <button 
                className="action-btn menu-btn"
                onClick={() => setShowMenu(!showMenu)}
              >
                <Menu size={20} />
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
                      <X size={20} />
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
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    ))}
                    
                    <button className="menu-item logout-btn" onClick={handleLogout}>
                      <LogOut size={20} />
                      <span>Log Out</span>
                    </button>
                  </div>
                  
                  {/* Grid Items (2x2 layout) */}
                  <div className="menu-grid">
                    {gridItems.map((item, index) => (
                      item.path ? (
                        <Link 
                          key={index} 
                          to={item.path} 
                          className="grid-item"
                          onClick={() => setShowMenu(false)}
                        >
                          {typeof item.icon === 'string' ? (
                            <span className="emoji-icon">{item.icon}</span>
                          ) : (
                            item.icon
                          )}
                          <span>{item.label}</span>
                        </Link>
                      ) : (
                        <button key={index} className="grid-item">
                          {typeof item.icon === 'string' ? (
                            <span className="emoji-icon">{item.icon}</span>
                          ) : (
                            item.icon
                          )}
                          <span>{item.label}</span>
                        </button>
                      )
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
            <Home size={24} />
            <span className="nav-label">Home</span>
            <span className="notification-badge">20+</span>
          </Link>
          
          <Link to="/friends" className="nav-item">
            <Users size={24} />
            <span className="nav-label">Friends</span>
          </Link>
          
          <Link to="/messenger" className="nav-item">
            <MessageCircle size={24} />
            <span className="nav-label">Messenger</span>
            <span className="notification-badge">5</span>
          </Link>
          
          <Link to="/notifications" className="nav-item">
            <Bell size={24} />
            <span className="nav-label">Notifications</span>
            <span className="notification-badge">3</span>
          </Link>
          
          <Link to="/marketplace" className="nav-item">
            <ShoppingBag size={24} />
            <span className="nav-label">Marketplace</span>
          </Link>
        </div>
      </nav>

      {/* Separator Line */}
      <div className="nav-separator"></div>

      {/* Main Content with Facebook-style centered feed */}
      <main className="main-content">
        <div className="content-container">
          <div className="feed-wrapper">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;