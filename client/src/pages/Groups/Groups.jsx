import React, { useState } from 'react';
import { Users, Plus, Search, Globe, Lock, Users as GroupIcon } from 'react-feather';
import './Groups.css';

const Groups = () => {
  const [activeTab, setActiveTab] = useState('your');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'your', label: 'Your Groups' },
    { id: 'discover', label: 'Discover' },
    { id: 'invites', label: 'Invites', count: 3 },
  ];

  const groups = [
    { id: 1, name: 'React Developers', members: 2450, privacy: 'public', category: 'Technology' },
    { id: 2, name: 'Web Design Community', members: 1800, privacy: 'public', category: 'Design' },
    { id: 3, name: 'Startup Founders', members: 950, privacy: 'private', category: 'Business' },
    { id: 4, name: 'Music Lovers', members: 3200, privacy: 'public', category: 'Music' },
    { id: 5, name: 'Photography Enthusiasts', members: 1500, privacy: 'public', category: 'Art' },
    { id: 6, name: 'Book Club', members: 800, privacy: 'private', category: 'Education' },
  ];

  return (
    <div className="groups-container">
      <div className="groups-header">
        <h1>
          <Users size={32} />
          <span>Groups</span>
        </h1>
        
        <div className="groups-actions">
          <div className="groups-search">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button className="create-group-btn">
            <Plus size={20} />
            <span>Create Group</span>
          </button>
        </div>
      </div>

      <div className="groups-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`groups-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.label}</span>
            {tab.count && <span className="tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      <div className="groups-content">
        {activeTab === 'your' && (
          <div className="groups-grid">
            {groups.map(group => (
              <div key={group.id} className="group-card">
                <div className="group-cover"></div>
                <div className="group-info">
                  <h3 className="group-name">{group.name}</h3>
                  <div className="group-meta">
                    <span className="group-privacy">
                      {group.privacy === 'public' ? <Globe size={14} /> : <Lock size={14} />}
                      {group.privacy}
                    </span>
                    <span className="group-members">
                      <GroupIcon size={14} />
                      {group.members.toLocaleString()} members
                    </span>
                  </div>
                  <p className="group-category">{group.category}</p>
                  <div className="group-actions">
                    <button className="btn-primary">Visit Group</button>
                    <button className="btn-secondary">Leave Group</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'discover' && (
          <div className="discover-container">
            <h2>Discover New Groups</h2>
            <div className="categories-grid">
              {['Technology', 'Business', 'Music', 'Art', 'Sports', 'Education'].map(category => (
                <div key={category} className="category-card">
                  <h3>{category}</h3>
                  <p>Explore {category.toLowerCase()} groups</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'invites' && (
          <div className="invites-container">
            <h2>Group Invites</h2>
            <p>You have 3 pending group invites</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;