// client/src/pages/Admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminHeader from '../../components/Admin/AdminHeader';
import DashboardStats from '../../components/Admin/DashboardStats';
import './Admin/Dashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin' && user.role !== 'super_admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="admin-access-denied">
        <div className="access-denied-content">
          <div className="access-denied-icon">🚫</div>
          <h2>Access Denied</h2>
          <p>You need administrator privileges to access this page.</p>
          <button 
            className="back-to-home"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <DashboardStats />
            
            <div className="admin-main-content">
              {/* Recent Activity */}
              <div className="activity-card">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {[
                    { user: 'John Doe', action: 'requested verification', time: '5 min ago' },
                    { user: 'Jane Smith', action: 'posted a new video', time: '15 min ago' },
                    { user: 'Mike Johnson', action: 'reported a post', time: '1 hour ago' },
                    { user: 'Sarah Wilson', action: 'joined WaveNet', time: '2 hours ago' },
                    { user: 'Alex Brown', action: 'updated profile', time: '3 hours ago' },
                  ].map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-avatar">
                        {activity.user.charAt(0)}
                      </div>
                      <div className="activity-details">
                        <p>
                          <strong>{activity.user}</strong> {activity.action}
                        </p>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-card">
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                  <button className="action-btn">
                    <div className="action-icon">👤</div>
                    <span>Add New User</span>
                  </button>
                  <button className="action-btn">
                    <div className="action-icon">✅</div>
                    <span>Review Verification</span>
                  </button>
                  <button className="action-btn">
                    <div className="action-icon">📊</div>
                    <span>View Analytics</span>
                  </button>
                  <button className="action-btn">
                    <div className="action-icon">⚙️</div>
                    <span>System Settings</span>
                  </button>
                  <button className="action-btn">
                    <div className="action-icon">📝</div>
                    <span>Create Announcement</span>
                  </button>
                  <button className="action-btn">
                    <div className="action-icon">🔒</div>
                    <span>Security Check</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      case 'users':
        return <div className="tab-content">Users Management - Coming Soon</div>;
      case 'posts':
        return <div className="tab-content">Posts Management - Coming Soon</div>;
      case 'verification':
        return <div className="tab-content">Verification Requests - Coming Soon</div>;
      case 'reports':
        return <div className="tab-content">Reports Management - Coming Soon</div>;
      case 'messages':
        return <div className="tab-content">Admin Messages - Coming Soon</div>;
      case 'notifications':
        return <div className="tab-content">Notifications - Coming Soon</div>;
      case 'analytics':
        return <div className="tab-content">Analytics - Coming Soon</div>;
      case 'security':
        return <div className="tab-content">Security - Coming Soon</div>;
      case 'settings':
        return <div className="tab-content">Settings - Coming Soon</div>;
      default:
        return <div className="tab-content">Select a tab</div>;
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="admin-content">
        <AdminHeader />
        <div className="admin-content-wrapper">
          <div className="admin-welcome">
            <h1>Welcome back, {user.username}!</h1>
            <p>Here's what's happening with your platform today.</p>
            <div className="admin-badges">
              <span className="admin-badge">
                👑 Super Admin
              </span>
              <span className="verified-badge">
                ✅ Verified
              </span>
              <span className="online-badge">
                ● Online
              </span>
            </div>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;