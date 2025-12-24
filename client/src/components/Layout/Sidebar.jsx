// client/src/components/Layout/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Users, 
  Calendar, 
  Video, 
  BookOpen, 
  Flag, 
  ShoppingBag,
  Heart,
  Clock,
  ChevronDown,
  Settings,
  HelpCircle,
  Shield,
  CheckCircle // ADDED: For verified badge
} from 'react-feather';

const Sidebar = ({ user }) => {
  const menuItems = [
    { icon: <User size={24} />, label: 'Profile', path: `/profile/${user?._id}` },
    { icon: <Users size={24} />, label: 'Friends', path: '/friends', badge: '3 new' },
    { icon: <Users size={24} />, label: 'Groups', path: '/groups', badge: '12 new' },
    { icon: <Video size={24} />, label: 'Watch', path: '/watch', badge: '9+' },
    { icon: <ShoppingBag size={24} />, label: 'Marketplace', path: '/marketplace' },
    { icon: <BookOpen size={24} />, label: 'Pages', path: '/pages' },
    { icon: <Calendar size={24} />, label: 'Events', path: '/events' },
    { icon: <Clock size={24} />, label: 'Memories', path: '/memories' },
    { icon: <Flag size={24} />, label: 'Saved', path: '/saved' },
  ];

  const shortcuts = [
    { name: 'Web Dev Community', image: '💻' },
    { name: 'Tech News', image: '📱' },
    { name: 'Startup Founders', image: '🚀' },
    { name: 'React Developers', image: '⚛️' },
    { name: 'Design Resources', image: '🎨' },
  ];

  return (
    <div className="left-sidebar">
      <div className="sidebar-section">
        <div className="user-card">
          <img 
            src={user?.profile?.profilePicture?.url || '/default-avatar.png'} 
            alt={user?.username}
            className="sidebar-avatar"
          />
          <div className="user-info">
            <h4 className="user-name">
              {user?.username}
              {/* ADDED: Verified badge next to username */}
              {user?.isVerified && (
                <span className="sidebar-verified-badge" title="Verified Account">
                  <CheckCircle size={14} />
                </span>
              )}
            </h4>
            <p className="user-bio">{user?.profile?.bio || 'Welcome to WaveNet!'}</p>
          </div>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.path} 
              className="menu-item"
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
              {item.badge && (
                <span className="menu-badge">{item.badge}</span>
              )}
            </Link>
          ))}
          
          {/* ADDED: Verification menu item */}
          {user?.isVerified ? (
            <div className="menu-item verified-item" title="You are verified">
              <span className="menu-icon">
                <CheckCircle size={24} />
              </span>
              <span className="menu-label">Verified Account</span>
              <span className="verified-badge-menu">✓</span>
            </div>
          ) : (
            <Link to="/verification" className="menu-item verification-item">
              <span className="menu-icon">
                <Shield size={24} />
              </span>
              <span className="menu-label">Get Verified</span>
              <span className="verification-badge">New</span>
            </Link>
          )}
          
          {/* ADMIN PANEL LINK - Only show for admins */}
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Link to="/admin" className="menu-item admin-item">
              <span className="menu-icon">
                <Shield size={24} />
              </span>
              <span className="menu-label">Admin Panel</span>
              <span className="admin-badge">Admin</span>
            </Link>
          )}
          
          <button className="menu-item see-more">
            <span className="menu-icon">
              <ChevronDown size={24} />
            </span>
            <span className="menu-label">See More</span>
          </button>
        </nav>
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <h3 className="section-title">Your Shortcuts</h3>
          <button className="edit-btn">Edit</button>
        </div>
        
        <div className="shortcuts-list">
          {shortcuts.map((shortcut, index) => (
            <Link key={index} to="#" className="shortcut-item">
              <span className="shortcut-icon">{shortcut.image}</span>
              <span className="shortcut-name">{shortcut.name}</span>
            </Link>
          ))}
          
          {/* ADDED: Verification shortcut for non-verified users */}
          {!user?.isVerified && (
            <Link to="/verification" className="shortcut-item verification-shortcut">
              <span className="shortcut-icon">✅</span>
              <span className="shortcut-name">Get Verified</span>
              <span className="shortcut-badge">New</span>
            </Link>
          )}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <h3 className="section-title">Help & Support</h3>
        </div>
        
        <div className="help-links">
          <Link to="/settings" className="help-link">
            <Settings size={18} />
            <span>Settings & Privacy</span>
          </Link>
          <Link to="/help" className="help-link">
            <HelpCircle size={18} />
            <span>Help Center</span>
          </Link>
          <Link to="/feedback" className="help-link">
            <Heart size={18} />
            <span>Send Feedback</span>
          </Link>
          
          {/* ADDED: Verification help link */}
          <Link to="/verification/help" className="help-link verification-help">
            <CheckCircle size={18} />
            <span>Verification Help</span>
          </Link>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="footer-links">
          <a href="/privacy">Privacy</a>
          <span>·</span>
          <a href="/terms">Terms</a>
          <span>·</span>
          <a href="/advertising">Advertising</a>
          <span>·</span>
          <a href="/cookies">Cookies</a>
          {/* ADDED: Verification link in footer */}
          <span>·</span>
          <a href="/verification">Verification</a>
        </div>
        <p className="copyright">WaveNet © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default Sidebar;