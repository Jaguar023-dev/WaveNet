import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { User, Camera, Edit, MapPin, Briefcase, GraduationCap, Link as LinkIcon, MoreVertical } from 'react-feather';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useSelector(state => state.auth);
  const [profileUser, setProfileUser] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // In a real app, fetch user profile by ID
    // For now, use current user
    setProfileUser(currentUser);
  }, [id, currentUser]);

  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'about', label: 'About' },
    { id: 'friends', label: 'Friends' },
    { id: 'photos', label: 'Photos' },
    { id: 'videos', label: 'Videos' },
  ];

  if (!profileUser) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  const isOwnProfile = profileUser._id === currentUser._id;

  return (
    <div className="profile-container">
      {/* Cover Photo */}
      <div className="cover-photo">
        <div className="cover-overlay">
          {isOwnProfile && (
            <button className="cover-edit-btn">
              <Camera size={20} />
              <span>Edit Cover Photo</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-container">
          <img
            src={profileUser.profile?.profilePicture?.url || '/default-avatar.png'}
            alt={profileUser.username}
            className="profile-avatar"
          />
          {isOwnProfile && (
            <button className="avatar-edit-btn">
              <Camera size={16} />
            </button>
          )}
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{profileUser.username}</h1>
          <p className="profile-bio">{profileUser.profile?.bio || 'No bio yet'}</p>
          <div className="profile-stats">
            <div className="stat">
              <strong>245</strong>
              <span>Posts</span>
            </div>
            <div className="stat">
              <strong>1.2K</strong>
              <span>Friends</span>
            </div>
            <div className="stat">
              <strong>45</strong>
              <span>Following</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          {isOwnProfile ? (
            <>
              <button className="btn-primary" onClick={() => setIsEditing(true)}>
                <Edit size={18} />
                <span>Edit Profile</span>
              </button>
              <button className="btn-secondary">
                <MoreVertical size={18} />
              </button>
            </>
          ) : (
            <>
              <button className="btn-primary">Add Friend</button>
              <button className="btn-secondary">Message</button>
              <button className="btn-icon">
                <MoreVertical size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="profile-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        <div className="profile-sidebar">
          {/* About Card */}
          <div className="about-card">
            <h3>About</h3>
            <div className="about-info">
              {profileUser.profile?.work?.length > 0 && (
                <div className="about-item">
                  <Briefcase size={18} />
                  <span>{profileUser.profile.work[0].position} at {profileUser.profile.work[0].company}</span>
                </div>
              )}
              {profileUser.profile?.education?.length > 0 && (
                <div className="about-item">
                  <GraduationCap size={18} />
                  <span>Studied at {profileUser.profile.education[0].school}</span>
                </div>
              )}
              {profileUser.profile?.location && (
                <div className="about-item">
                  <MapPin size={18} />
                  <span>Lives in {profileUser.profile.location}</span>
                </div>
              )}
              {profileUser.profile?.website && (
                <div className="about-item">
                  <LinkIcon size={18} />
                  <a href={profileUser.profile.website} target="_blank" rel="noopener noreferrer">
                    {profileUser.profile.website}
                  </a>
                </div>
              )}
            </div>
            {isOwnProfile && (
              <button className="edit-about-btn">
                <Edit size={16} />
                Edit Details
              </button>
            )}
          </div>

          {/* Friends Preview */}
          <div className="friends-card">
            <div className="card-header">
              <h3>Friends</h3>
              <a href={`/friends/${profileUser._id}`}>See all</a>
            </div>
            <div className="friends-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="friend-item">
                  <div className="friend-avatar"></div>
                  <span className="friend-name">Friend {i}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="profile-main">
          {/* Create Post */}
          {isOwnProfile && (
            <div className="create-post-card">
              <img
                src={currentUser.profile?.profilePicture?.url || '/default-avatar.png'}
                alt={currentUser.username}
                className="post-avatar"
              />
              <input
                type="text"
                placeholder="What's on your mind?"
                className="post-input"
              />
            </div>
          )}

          {/* Posts */}
          <div className="posts-container">
            <p className="no-posts">No posts to show yet</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;