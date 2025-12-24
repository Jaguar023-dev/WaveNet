// client/src/pages/Admin/Dashboard.jsx - Add verification section
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import './Dashboard.css';
import { 
  Users, FileText, CheckCircle, XCircle, Clock, 
  BarChart, Shield, MessageSquare, TrendingUp 
} from 'react-feather';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminHeader from '../../components/Admin/AdminHeader';

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [stats, setStats] = useState(null);
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      window.location.href = '/';
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, verificationsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/verification/requests/pending?limit=5')
      ]);
      
      setStats(statsRes.data);
      setRecentVerifications(verificationsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <AdminHeader />
      
      <div className="admin-content">
        <AdminSidebar />
        
        <main className="dashboard-main">
          <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <p>Welcome back, {user?.username}! Here's what's happening with your community.</p>
          </div>

          {/* Stats Grid */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats?.totalUsers?.toLocaleString() || '0'}</h3>
                <p>Total Users</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FileText size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats?.totalPosts?.toLocaleString() || '0'}</h3>
                <p>Total Posts</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <MessageSquare size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats?.totalMessages?.toLocaleString() || '0'}</h3>
                <p>Messages Today</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <CheckCircle size={24} />
              </div>
              <div className="stat-info">
                <h3>{stats?.verifiedUsers?.toLocaleString() || '0'}</h3>
                <p>Verified Users</p>
              </div>
            </div>
          </div>

          {/* Verification Requests Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <Shield size={20} /> 
                Verification Requests
                <span className="badge">{recentVerifications.length}</span>
              </h2>
              <Link to="/admin/verification" className="view-all">
                View All →
              </Link>
            </div>
            
            {recentVerifications.length === 0 ? (
              <div className="empty-state">
                <p>No pending verification requests</p>
              </div>
            ) : (
              <div className="requests-list">
                {recentVerifications.map((req) => (
                  <div key={req._id} className="request-item">
                    <div className="request-user">
                      <img 
                        src={req.profile?.profilePicture?.url || '/default-avatar.png'} 
                        alt={req.username}
                        className="user-avatar"
                      />
                      <div>
                        <strong>{req.username}</strong>
                        <p className="request-category">
                          {req.verification?.verificationRequest?.category}
                        </p>
                      </div>
                    </div>
                    <div className="request-meta">
                      <span className="request-date">
                        {new Date(req.verification?.verificationRequest?.submittedAt).toLocaleDateString()}
                      </span>
                      <Link 
                        to={`/admin/verification/review/${req._id}`}
                        className="review-link"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2><TrendingUp size={20} /> Recent Activity</h2>
            </div>
            
            <div className="activity-list">
              {/* Add recent activities here */}
              <div className="activity-item">
                <div className="activity-icon success">
                  <CheckCircle size={16} />
                </div>
                <div className="activity-content">
                  <p><strong>John Doe</strong> account was verified</p>
                  <span className="activity-time">2 hours ago</span>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon warning">
                  <Clock size={16} />
                </div>
                <div className="activity-content">
                  <p><strong>Jane Smith</strong> reported a post</p>
                  <span className="activity-time">5 hours ago</span>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon danger">
                  <XCircle size={16} />
                </div>
                <div className="activity-content">
                  <p><strong>Spam Account</strong> was banned</p>
                  <span className="activity-time">1 day ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            
            <div className="quick-actions">
              <Link to="/admin/verification" className="action-card">
                <div className="action-icon">
                  <Shield size={24} />
                </div>
                <div className="action-info">
                  <h4>Manage Verification</h4>
                  <p>Review pending verification requests</p>
                </div>
              </Link>
              
              <Link to="/admin/users" className="action-card">
                <div className="action-icon">
                  <Users size={24} />
                </div>
                <div className="action-info">
                  <h4>User Management</h4>
                  <p>View and manage all users</p>
                </div>
              </Link>
              
              <Link to="/admin/reports" className="action-card">
                <div className="action-icon">
                  <FileText size={24} />
                </div>
                <div className="action-info">
                  <h4>Content Reports</h4>
                  <p>Review reported content</p>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;