import React, { useState } from 'react';
import { Play, TrendingUp, Clock, Film, Music, Gamepad, TrendingUp as TrendingIcon } from 'react-feather';
import './Watch.css';

const Watch = () => {
  const [activeTab, setActiveTab] = useState('for-you');

  const tabs = [
    { id: 'for-you', label: 'For You' },
    { id: 'live', label: 'Live' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'saved', label: 'Saved' },
  ];

  const categories = [
    { id: 'entertainment', label: 'Entertainment', icon: <Film size={20} /> },
    { id: 'music', label: 'Music', icon: <Music size={20} /> },
    { id: 'gaming', label: 'Gaming', icon: <Gamepad size={20} /> },
    { id: 'trending', label: 'Trending', icon: <TrendingIcon size={20} /> },
  ];

  const videos = [
    { id: 1, title: 'Amazing React Tutorial', views: '245K', time: '15:32', category: 'Technology' },
    { id: 2, title: 'Music Festival Highlights', views: '1.2M', time: '8:45', category: 'Music' },
    { id: 3, title: 'Gaming Tournament Finals', views: '850K', time: '22:15', category: 'Gaming' },
    { id: 4, title: 'Travel Vlog: Japan', views: '560K', time: '12:30', category: 'Travel' },
    { id: 5, title: 'Cooking Masterclass', views: '320K', time: '18:20', category: 'Food' },
    { id: 6, title: 'Workout Routine', views: '420K', time: '10:45', category: 'Fitness' },
  ];

  return (
    <div className="watch-container">
      <div className="watch-header">
        <h1>
          <Play size={32} />
          <span>Watch</span>
        </h1>
        
        <div className="watch-stats">
          <div className="stat">
            <TrendingUp size={20} />
            <span>245 trending videos</span>
          </div>
          <div className="stat">
            <Clock size={20} />
            <span>45 min watch time</span>
          </div>
        </div>
      </div>

      <div className="watch-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`watch-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="categories-bar">
        {categories.map(category => (
          <button key={category.id} className="category-btn">
            {category.icon}
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      <div className="watch-content">
        <div className="videos-grid">
          {videos.map(video => (
            <div key={video.id} className="video-card">
              <div className="video-thumbnail">
                <div className="play-overlay">
                  <Play size={24} />
                </div>
                <span className="video-duration">{video.time}</span>
              </div>
              <div className="video-info">
                <h3 className="video-title">{video.title}</h3>
                <div className="video-meta">
                  <span className="video-views">{video.views} views</span>
                  <span className="video-category">{video.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="watch-sidebar">
          <div className="live-now">
            <h3>Live Now</h3>
            <div className="live-streams">
              <div className="live-stream">
                <div className="live-indicator"></div>
                <span>Music Concert Live</span>
              </div>
              <div className="live-stream">
                <div className="live-indicator"></div>
                <span>Gaming Tournament</span>
              </div>
            </div>
          </div>

          <div className="subscriptions">
            <h3>Subscriptions</h3>
            <div className="subscription-list">
              {['Tech Channel', 'Music Network', 'Gaming Pro', 'Travel Vlogs'].map(channel => (
                <div key={channel} className="subscription-item">
                  <div className="channel-avatar"></div>
                  <span>{channel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;