// client/src/pages/Profile/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Camera, 
  Edit, 
  MapPin, 
  Briefcase, 
  Award as GraduationCap, 
  Link as LinkIcon, 
  MoreVertical,
  Users,
  UserPlus,
  Globe,
  Lock,
  Archive,
  Activity,
  Copy,
  Flag,
  Settings,
  X,
  Check,
  Upload,
  Image as ImageIcon,
  Video,
  MessageCircle,
  Heart,
  Share2,
  Bookmark,
  CheckCircle // ADD THIS IMPORT
} from 'react-feather';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector(state => state.auth);
  const [profileUser, setProfileUser] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showProfilePicMenu, setShowProfilePicMenu] = useState(false);
  const [showCoverPhotoMenu, setShowCoverPhotoMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [posts, setPosts] = useState([]);
  
  const profilePicInputRef = useRef(null);
  const coverPhotoInputRef = useRef(null);

  useEffect(() => {
    // In a real app, fetch user profile by ID
    // For now, use current user
    setProfileUser(currentUser);
    
    // Simulate fetching posts
    setPosts([
      { id: 1, content: "Just had an amazing day! 😊", likes: 24, comments: 5, shares: 2, time: "2 hours ago" },
      { id: 2, content: "Working on a new project! #coding", likes: 42, comments: 12, shares: 3, time: "1 day ago" },
      { id: 3, content: "Beautiful sunset today 🌅", likes: 89, comments: 8, shares: 15, time: "3 days ago" },
    ]);
  }, [id, currentUser]);

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const previewUrl = URL.createObjectURL(file);
      setProfileUser(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          profilePicture: { url: previewUrl }
        }
      }));
      
      console.log('Profile picture updated:', file.name);
      setShowProfilePicMenu(false);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCoverPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const previewUrl = URL.createObjectURL(file);
      setProfileUser(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          coverPhoto: { url: previewUrl }
        }
      }));
      
      console.log('Cover photo updated:', file.name);
      setShowCoverPhotoMenu(false);
    } catch (error) {
      console.error('Error uploading cover photo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const editMenuOptions = [
    { icon: <Edit size={18} />, label: 'Edit Profile', action: () => navigate('/settings') },
    { icon: <Flag size={18} />, label: 'Advertise', action: () => console.log('Advertise') },
    { icon: <Globe size={18} />, label: 'Profile Status', action: () => console.log('Profile Status') },
    { icon: <Archive size={18} />, label: 'Archive', action: () => console.log('Archive') },
    { icon: <Activity size={18} />, label: 'Activity Log', action: () => console.log('Activity Log') },
    { icon: <Copy size={18} />, label: 'Copy Link to Profile', action: () => {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }},
    { icon: <Settings size={18} />, label: 'Settings', action: () => navigate('/settings') },
  ];

  const tabs = [
    { id: 'posts', label: 'Posts', count: posts.length },
    { id: 'about', label: 'About' },
    { id: 'friends', label: 'Friends', count: '1.2K' },
    { id: 'photos', label: 'Photos', count: '245' },
    { id: 'videos', label: 'Videos', count: '45' },
  ];

  const privacyOptions = [
    { value: 'public', icon: <Globe size={16} />, label: 'Public' },
    { value: 'friends', icon: <Users size={16} />, label: 'Friends' },
    { value: 'onlyme', icon: <Lock size={16} />, label: 'Only me' },
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
      <div 
        className="cover-photo"
        style={{ 
          backgroundImage: profileUser.profile?.coverPhoto?.url 
            ? `url(${profileUser.profile.coverPhoto.url})` 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div className="cover-overlay">
          {isOwnProfile && (
            <button 
              className="cover-edit-btn"
              onClick={() => setShowCoverPhotoMenu(true)}
            >
              <Camera size={20} />
              <span>Edit Cover Photo</span>
            </button>
          )}
        </div>
        
        {/* Cover Photo Upload Menu */}
        {showCoverPhotoMenu && (
          <div className="upload-menu cover-upload-menu">
            <div className="upload-menu-header">
              <h4>Update Cover Photo</h4>
              <button 
                className="close-menu-btn"
                onClick={() => setShowCoverPhotoMenu(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="upload-options">
              <button 
                className="upload-option"
                onClick={() => coverPhotoInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload size={24} />
                <span>Upload Photo</span>
                <p>Choose a photo from your device</p>
              </button>
              <button 
                className="upload-option"
                onClick={() => {
                  // In real app, open camera
                  console.log('Open camera for cover photo');
                }}
                disabled={isUploading}
              >
                <Camera size={24} />
                <span>Take Photo</span>
                <p>Use your camera to take a new photo</p>
              </button>
            </div>
            {isUploading && (
              <div className="uploading-overlay">
                <div className="uploading-spinner"></div>
                <p>Uploading...</p>
              </div>
            )}
          </div>
        )}
        
        <input
          ref={coverPhotoInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverPhotoUpload}
          className="hidden-file-input"
        />
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
            <button 
              className="avatar-edit-btn"
              onClick={() => setShowProfilePicMenu(true)}
            >
              <Camera size={16} />
            </button>
          )}
        </div>

        {/* Profile Picture Upload Menu */}
        {showProfilePicMenu && (
          <div className="upload-menu profile-pic-upload-menu">
            <div className="upload-menu-header">
              <h4>Update Profile Picture</h4>
              <button 
                className="close-menu-btn"
                onClick={() => setShowProfilePicMenu(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="upload-options">
              <button 
                className="upload-option"
                onClick={() => profilePicInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload size={24} />
                <span>Upload Photo</span>
                <p>Choose a photo from your device</p>
              </button>
              <button 
                className="upload-option"
                onClick={() => {
                  // In real app, open camera
                  console.log('Open camera for profile picture');
                }}
                disabled={isUploading}
              >
                <Camera size={24} />
                <span>Take Photo</span>
                <p>Use your camera to take a new photo</p>
              </button>
              <button 
                className="upload-option remove"
                onClick={() => {
                  setProfileUser(prev => ({
                    ...prev,
                    profile: {
                      ...prev.profile,
                      profilePicture: { url: '/default-avatar.png' }
                    }
                  }));
                  setShowProfilePicMenu(false);
                }}
                disabled={isUploading}
              >
                <X size={24} />
                <span>Remove Current Photo</span>
                <p>Revert to default avatar</p>
              </button>
            </div>
            {isUploading && (
              <div className="uploading-overlay">
                <div className="uploading-spinner"></div>
                <p>Uploading...</p>
              </div>
            )}
          </div>
        )}
        
        <input
          ref={profilePicInputRef}
          type="file"
          accept="image/*"
          onChange={handleProfilePicUpload}
          className="hidden-file-input"
        />

        <div className="profile-info">
          <h1 className="profile-name">
            {profileUser.username}
            {profileUser.isVerified && (
              <span className="verified-badge" title="Verified Account">
                <CheckCircle size={20} />
                <span className="verified-text">Verified</span>
              </span>
            )}
          </h1>
          <p className="profile-bio">{profileUser.profile?.bio || 'No bio yet'}</p>
          <div className="profile-stats">
            <div className="stat">
              <strong>{posts.length}</strong>
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
              <button className="btn-primary" onClick={() => navigate('/settings')}>
                <Edit size={18} />
                <span>Edit Profile</span>
              </button>
              <div className="menu-container">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowEditMenu(!showEditMenu)}
                >
                  <MoreVertical size={18} />
                </button>
                
                {/* Edit Menu Dropdown */}
                {showEditMenu && (
                  <div className="edit-dropdown-menu">
                    {editMenuOptions.map((option, index) => (
                      <button
                        key={index}
                        className="edit-menu-item"
                        onClick={() => {
                          option.action();
                          setShowEditMenu(false);
                        }}
                      >
                        {option.icon}
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button className="btn-primary">
                <UserPlus size={18} />
                <span>Add Friend</span>
              </button>
              <button className="btn-secondary">
                <MessageCircle size={18} />
                <span>Message</span>
              </button>
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
            {tab.count && <span className="tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        <div className="profile-sidebar">
          {/* Intro Card */}
          <div className="intro-card">
            <h3>Intro</h3>
            <div className="intro-info">
              {profileUser.profile?.bio ? (
                <p className="intro-bio">{profileUser.profile.bio}</p>
              ) : (
                <p className="no-intro">No intro added yet</p>
              )}
              
              {profileUser.profile?.work?.length > 0 && (
                <div className="intro-item">
                  <Briefcase size={18} />
                  <span>{profileUser.profile.work[0].position} at {profileUser.profile.work[0].company}</span>
                </div>
              )}
              {profileUser.profile?.education?.length > 0 && (
                <div className="intro-item">
                  <GraduationCap size={18} />
                  <span>Studied at {profileUser.profile.education[0].school}</span>
                </div>
              )}
              {profileUser.profile?.location && (
                <div className="intro-item">
                  <MapPin size={18} />
                  <span>Lives in {profileUser.profile.location}</span>
                </div>
              )}
              {profileUser.profile?.website && (
                <div className="intro-item">
                  <LinkIcon size={18} />
                  <a href={profileUser.profile.website} target="_blank" rel="noopener noreferrer">
                    {profileUser.profile.website}
                  </a>
                </div>
              )}
            </div>
            {isOwnProfile && (
              <button className="edit-intro-btn">
                <Edit size={16} />
                Edit Intro
              </button>
            )}
          </div>

          {/* Photos Card */}
          <div className="photos-card">
            <div className="card-header">
              <h3>Photos</h3>
              <a href={`/photos/${profileUser._id}`}>See all</a>
            </div>
            <div className="photos-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="photo-item">
                  <div className="photo-placeholder">
                    <ImageIcon size={24} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Friends Card */}
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
              <div className="post-options">
                <button className="post-option">
                  <ImageIcon size={20} />
                  <span>Photo/Video</span>
                </button>
                <button className="post-option">
                  <Video size={20} />
                  <span>Live Video</span>
                </button>
                <button className="post-option">
                  <Flag size={20} />
                  <span>Feeling/Activity</span>
                </button>
              </div>
            </div>
          )}

          {/* Posts Feed */}
          <div className="posts-feed">
            {posts.length > 0 ? (
              posts.map(post => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <img
                      src={profileUser.profile?.profilePicture?.url || '/default-avatar.png'}
                      alt={profileUser.username}
                      className="post-author-avatar"
                    />
                    <div className="post-author-info">
                      <div className="post-author-header">
                        <h4>{profileUser.username}</h4>
                        {profileUser.isVerified && (
                          <span className="post-verified-badge" title="Verified Account">
                            <CheckCircle size={14} />
                          </span>
                        )}
                      </div>
                      <div className="post-meta">
                        <span>{post.time}</span>
                        <span className="privacy-badge">
                          <Globe size={12} />
                          Public
                        </span>
                      </div>
                    </div>
                    <button className="post-more-btn">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                  
                  <div className="post-content">
                    <p>{post.content}</p>
                  </div>
                  
                  <div className="post-stats">
                    <span>{post.likes} likes</span>
                    <span>{post.comments} comments</span>
                    <span>{post.shares} shares</span>
                  </div>
                  
                  <div className="post-actions">
                    <button className="post-action-btn">
                      <Heart size={20} />
                      <span>Like</span>
                    </button>
                    <button className="post-action-btn">
                      <MessageCircle size={20} />
                      <span>Comment</span>
                    </button>
                    <button className="post-action-btn">
                      <Share2 size={20} />
                      <span>Share</span>
                    </button>
                    <button className="post-action-btn">
                      <Bookmark size={20} />
                      <span>Save</span>
                    </button>
                    </div>
                   </div>
              ))
            ) : (
              <div className="no-posts">
                <div className="no-posts-icon">
                  <ImageIcon size={48} />
                </div>
                <h3>No posts yet</h3>
                <p>When you share photos or write posts, they'll appear here.</p>
                {isOwnProfile && (
                  <button className="create-first-post">
                    Create your first post
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;