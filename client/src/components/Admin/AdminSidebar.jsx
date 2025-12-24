j// client/src/components/Admin/AdminSidebar.jsx
import React from 'react';
import { 
  Home, 
  Users, 
  FileText, 
  CheckCircle, 
  Settings, 
  BarChart2,
  Shield,
  Flag,
  MessageSquare,
  Bell
} from 'react-feather';
import './AdminSidebar.css';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { id: 'users', icon: <Users size={20} />, label: 'Users', badge: '1.2K' },
    { id: 'posts', icon: <FileText size={20} />, label: 'Posts', badge: '245' },
    { id: 'verification', icon: <CheckCircle size={20} />, label: 'Verification', badge: '12' },
    { id: 'reports', icon: <Flag size={20} />, label: 'Reports', badge: '5' },
    { id: 'messages', icon: <MessageSquare size={20} />, label: 'Messages' },
    { id: 'notifications', icon: <Bell size={20} />, label: 'Notifications' },
    { id: 'analytics', icon: <BarChart2 size={20} />, label: 'Analytics' },
    { id: 'security', icon: <Shield size={20} />, label: 'Security' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-logo">
          <div className="admin-logo-icon">👑</div>
          <h3>Admin Panel</h3>
        </div>
        <div className="admin-badge">
          <Shield size={14} />
          <span>Super Admin</span>
        </div>
      </div>

      <div className="admin-menu">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`admin-menu-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <div className="menu-item-icon">
              {item.icon}
            </div>
            <span className="menu-item-label">{item.label}</span>
            {item.badge && (
              <span className="menu-item-badge">{item.badge}</span>
            )}
          </button>
        ))}
      </div>

      <div className="admin-footer">
        <div className="admin-status">
          <div className="status-indicator online"></div>
          <span>Admin Online</span>
        </div>
        <p className="admin-help">Need help? Contact support</p>
      </div>
    </div>
  );
};

export default AdminSidebar;