// client/src/components/Admin/DashboardStats.jsx
import React from 'react';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Activity,
  DollarSign,
  Clock
} from 'react-feather';
import './DashboardStats.css';

const DashboardStats = () => {
  const stats = [
    {
      id: 'users',
      title: 'Total Users',
      value: '1,284',
      change: '+12.5%',
      trend: 'up',
      icon: <Users size={24} />,
      color: '#3b82f6'
    },
    {
      id: 'posts',
      title: 'Posts Today',
      value: '45',
      change: '+8.2%',
      trend: 'up',
      icon: <FileText size={24} />,
      color: '#10b981'
    },
    {
      id: 'growth',
      title: 'Growth Rate',
      value: '24.3%',
      change: '+3.1%',
      trend: 'up',
      icon: <TrendingUp size={24} />,
      color: '#8b5cf6'
    },
    {
      id: 'verified',
      title: 'Verified Users',
      value: '89',
      change: '+5',
      trend: 'up',
      icon: <CheckCircle size={24} />,
      color: '#f59e0b'
    },
    {
      id: 'reports',
      title: 'Active Reports',
      value: '12',
      change: '-2',
      trend: 'down',
      icon: <AlertCircle size={24} />,
      color: '#ef4444'
    },
    {
      id: 'activity',
      title: 'Active Users',
      value: '342',
      change: '+24',
      trend: 'up',
      icon: <Activity size={24} />,
      color: '#ec4899'
    },
    {
      id: 'revenue',
      title: 'Revenue',
      value: '$2,845',
      change: '+15.3%',
      trend: 'up',
      icon: <DollarSign size={24} />,
      color: '#14b8a6'
    },
    {
      id: 'response',
      title: 'Avg Response Time',
      value: '2.4m',
      change: '-0.5m',
      trend: 'down',
      icon: <Clock size={24} />,
      color: '#6366f1'
    }
  ];

  return (
    <div className="dashboard-stats">
      <div className="stats-header">
        <h3>Dashboard Overview</h3>
        <select className="time-period">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last quarter</option>
          <option>Last year</option>
        </select>
      </div>
      
      <div className="stats-grid">
        {stats.map(stat => (
          <div key={stat.id} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15` }}>
              <div style={{ color: stat.color }}>
                {stat.icon}
              </div>
            </div>
            <div className="stat-content">
              <span className="stat-title">{stat.title}</span>
              <div className="stat-value-row">
                <h3 className="stat-value">{stat.value}</h3>
                <span className={`stat-change ${stat.trend}`}>
                  {stat.change}
                </span>
              </div>
              <div className="stat-progress">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: stat.trend === 'up' ? '75%' : '25%',
                    backgroundColor: stat.color
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;