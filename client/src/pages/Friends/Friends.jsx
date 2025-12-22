import React, { useState } from 'react';
import { Users, UserPlus, Search, UserCheck, UserX, Mail } from 'react-feather';
import './Friends.css';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'all', label: 'All Friends', count: 124 },
    { id: 'requests', label: 'Friend Requests', count: 3 },
    { id: 'suggestions', label: 'Suggestions', count: 45 },
    { id: 'birthdays', label: 'Birthdays', count: 2 },
  ];

  // Mock data
  const friends = [
    { id: 1, name: 'Alex Johnson', mutual: 24, online: true },
    { id: 2, name: 'Sam Wilson', mutual: 18, online: false },
    { id: 3, name: 'Taylor Swift', mutual: 32, online: true },
    { id: 4, name: 'Chris Evans', mutual: 12, online: false },
    { id: 5, name: 'Emma Watson', mutual: 28, online: true },
    { id: 6, name: 'John Doe', mutual: 15, online: false },
  ];

  const requests = [
    { id: 1, name: 'Mike Ross', mutual: 8 },
    { id: 2, name: 'Harvey Specter', mutual: 12 },
    { id: 3, name: 'Donna Paulsen', mutual: 5 },
  ];

  return (
    <div className="friends-container">
      <div className="friends-header">
        <h1>
          <Users size={32} />
          <span>Friends</span>
        </h1>
        
        <div className="friends-search">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="friends-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`friends-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.label}</span>
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="friends-content">
        {activeTab === 'all' && (
          <div className="friends-grid">
            {friends.map(friend => (
              <div key={friend.id} className="friend-card">
                <div className="friend-avatar">
                  <div className={`status-indicator ${friend.online ? 'online' : 'offline'}`} />
                </div>
                <div className="friend-info">
                  <h3 className="friend-name">{friend.name}</h3>
                  <p className="friend-mutual">{friend.mutual} mutual friends</p>
                </div>
                <div className="friend-actions">
                  <button className="btn-primary">
                    <Mail size={16} />
                    Message
                  </button>
                  <button className="btn-secondary">
                    <UserX size={16} />
                    Unfriend
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="requests-container">
            {requests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-avatar"></div>
                <div className="request-info">
                  <h3>{request.name}</h3>
                  <p>{request.mutual} mutual friends</p>
                  <div className="request-actions">
                    <button className="btn-primary">
                      <UserCheck size={16} />
                      Confirm
                    </button>
                    <button className="btn-secondary">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="suggestions-container">
            <p>Friend suggestions will appear here</p>
          </div>
        )}

        {activeTab === 'birthdays' && (
          <div className="birthdays-container">
            <p>Upcoming birthdays will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;