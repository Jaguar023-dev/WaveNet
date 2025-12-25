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
  CheckCircle,
  Plus,
  Home,
  Mail,
  Search,
  User,
  Video as VideoIcon,
  Award,
  Heart as HeartIcon,
  Briefcase as WorkIcon,
  GraduationCap as SchoolIcon,
  Users as FriendsIcon,
  Globe as WorldIcon,
  Bell,
  Send,
  Music,
  Coffee,
  Plane,
  Baby,
  Trophy,
  Clock,
  Feather,
  Zap
} from 'react-feather';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector(state => state.auth);
  const [profileUser, setProfileUser] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showProfilePicMenu, setShowProfilePicMenu] = useState(false);
  const [showCoverPhotoMenu, setShowCoverPhotoMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);

  const profilePicInputRef = useRef(null);
  const coverPhotoInputRef = useRef(null);

  // Local storage keys
  const PROFILE_PHOTO_KEY = `profile_photo_${currentUser?._id || 'default'}`;
  const COVER_PHOTO_KEY = `cover_photo_${currentUser?._id || 'default'}`;

  // Mock friends data
  const mockFriends = [
    { id: 1, name: 'Alex Johnson', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', mutual: 15 },
    { id: 2, name: 'Sarah Miller', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', mutual: 8 },
    { id: 3, name: 'Mike Wilson', avatar: 'https://randomuser.me/api/portraits/men/67.jpg', mutual: 12 },
    { id: 4, name: 'Emma Davis', avatar: 'https://randomuser.me/api/portraits/women/22.jpg', mutual: 6 },
    { id: 5, name: 'Chris Brown', avatar: 'https://randomuser.me/api/portraits/men/89.jpg', mutual: 9 },
    { id: 6, name: 'Lisa Taylor', avatar: 'https://randomuser.me/api/portraits/women/33.jpg', mutual: 7 },
  ];

  // Mock photos
  const mockPhotos = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff',
    'https://images.unsplash.com/photo-1439853949127-fa647821eba0',
  ];

  // Mock videos
  const mockVideos = [
    { id: 1, title: 'Vacation Trip', views: '1.2K', thumbnail: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b' },
    { id: 2, title: 'Concert Night', views: '2.4K', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819' },
    { id: 3, title: 'Birthday Party', views: '890', thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622' },
    { id: 4, title: 'Workout Session', views: '1.5K', thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b' },
  ];

  // Mock posts
  const mockPosts = [
    { id: 1, content: "Just had an amazing day at the beach! 🌊☀️ #vacation", likes: 245, comments: 32, shares: 15, time: "2 hours ago" },
    { id: 2, content: "Working on a new project! Can't wait to share it with everyone. #coding #webdev", likes: 142, comments: 28, shares: 8, time: "1 day ago" },
    { id: 3, content: "Beautiful sunset today 🌅 Nature always finds a way to amaze me.", likes: 389, comments: 45, shares: 23, time: "3 days ago" },
  ];

  // Load profile and cover photos from local storage
  const loadPhotosFromLocalStorage = () => {
    const savedProfilePhoto = localStorage.getItem(PROFILE_PHOTO_KEY);
    const savedCoverPhoto = localStorage.getItem(COVER_PHOTO_KEY);
    
    return {
      profilePhoto: savedProfilePhoto,
      coverPhoto: savedCoverPhoto
    };
  };

  // Save photo to local storage
  const savePhotoToLocalStorage = (key, photoUrl) => {
    try {
      localStorage.setItem(key, photoUrl);
      return true;
    } catch (error) {
      console.error('Error saving to local storage:', error);
      // If local storage is full, clear some old items
      if (error.name === 'QuotaExceededError') {
        alert('Storage is full. Clearing old photos...');
        clearOldPhotos();
        // Try again
        localStorage.setItem(key, photoUrl);
      }
      return false;
    }
  };

  // Clear old photos from local storage
  const clearOldPhotos = () => {
    // Keep only the last 5 profile photos and 5 cover photos
    const keys = Object.keys(localStorage);
    const profilePhotoKeys = keys.filter(key => key.startsWith('profile_photo_')).sort();
    const coverPhotoKeys = keys.filter(key => key.startsWith('cover_photo_')).sort();
    
    // Remove old entries, keep only last 5
    if (profilePhotoKeys.length > 5) {
      profilePhotoKeys.slice(0, -5).forEach(key => localStorage.removeItem(key));
    }
    if (coverPhotoKeys.length > 5) {
      coverPhotoKeys.slice(0, -5).forEach(key => localStorage.removeItem(key));
    }
  };

  // Handle profile picture upload with local storage
  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB for local storage)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large! Please select an image under 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      // Create file reader to convert to base64
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64String = reader.result;
        
        // Save to local storage
        const saved = savePhotoToLocalStorage(PROFILE_PHOTO_KEY, base64String);
        
        if (saved) {
          // Update state with new photo
          setProfileUser(prev => ({
            ...prev,
            profile: {
              ...prev.profile,
              profilePicture: { url: base64String }
            }
          }));
          
          console.log('Profile picture saved to local storage');
          setShowProfilePicMenu(false);
        }
      };
      
      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle cover photo upload with local storage
  const handleCoverPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB for local storage)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large! Please select an image under 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      // Create file reader to convert to base64
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64String = reader.result;
        
        // Save to local storage
        const saved = savePhotoToLocalStorage(COVER_PHOTO_KEY, base64String);
        
        if (saved) {
          // Update state with new photo
          setProfileUser(prev => ({
            ...prev,
            profile: {
              ...prev.profile,
              coverPhoto: { url: base64String }
            }
          }));
          
          console.log('Cover photo saved to local storage');
          setShowCoverPhotoMenu(false);
        }
      };
      
      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Error uploading cover photo:', error);
      alert('Failed to upload cover photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Remove profile photo from local storage
  const removeProfilePhoto = () => {
    localStorage.removeItem(PROFILE_PHOTO_KEY);
    setProfileUser(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        profilePicture: { url: '/default-avatar.png' }
      }
    }));
    setShowProfilePicMenu(false);
  };

  // Remove cover photo from local storage
  const removeCoverPhoto = () => {
    localStorage.removeItem(COVER_PHOTO_KEY);
    setProfileUser(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        coverPhoto: { url: null }
      }
    }));
    setShowCoverPhotoMenu(false);
  };

  useEffect(() => {
    // Load photos from local storage
    const { profilePhoto, coverPhoto } = loadPhotosFromLocalStorage();
    
    // Initialize profile user with data from local storage
    const initialUser = {
      ...currentUser,
      profile: {
        ...currentUser.profile,
        profilePicture: { 
          url: profilePhoto || currentUser.profile?.profilePicture?.url || '/default-avatar.png' 
        },
        coverPhoto: { 
          url: coverPhoto || currentUser.profile?.coverPhoto?.url || null 
        }
      }
    };
    
    setProfileUser(initialUser);
    setFriends(mockFriends);
    setPhotos(mockPhotos);
    setVideos(mockVideos);
    setPosts(mockPosts);
  }, [id, currentUser]);

  const isOwnProfile = profileUser?._id === currentUser?._id;

  const moreMenuOptions = [
    { icon: <Search size={18} />, label: 'Search Profile', action: () => console.log('Search profile') },
    { icon: <Copy size={18} />, label: 'Copy Link to Profile', action: () => {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }},
    { icon: <Send size={18} />, label: 'Share Profile as Message', action: () => console.log('Share as message') },
    { icon: <Globe size={18} />, label: 'Profile Status', action: () => console.log('Profile Status') },
    { icon: <Archive size={18} />, label: 'Archive', action: () => console.log('Archive') },
    { icon: <Activity size={18} />, label: 'Activity Log', action: () => console.log('Activity Log') },
    { icon: <Settings size={18} />, label: 'Settings', action: () => navigate('/settings') },
  ];

  const tabs = [
    { id: 'posts', label: 'Posts', count: posts.length },
    { id: 'photos', label: 'Photos', count: photos.length },
    { id: 'videos', label: 'Videos', count: videos.length },
  ];

  const lifeEventOptions = [
    { icon: <WorkIcon size={18} />, label: 'Work & Employment', color: '#4267B2' },
    { icon: <SchoolIcon size={18} />, label: 'Education', color: '#45BD62' },
    { icon: <HeartIcon size={18} />, label: 'Family & Relationships', color: '#FF5555' },
    { icon: <Home size={18} />, label: 'Home & Living', color: '#FF9900' },
    { icon: <Plane size={18} />, label: 'Travel', color: '#8B9DC3' },
    { icon: <Trophy size={18} />, label: 'Milestone & Achievements', color: '#FFCC00' },
    { icon: <Baby size={18} />, label: 'Health & Wellness', color: '#6B8E23' },
    { icon: <Clock size={18} />, label: 'Remembrance', color: '#808080' },
    { icon: <Coffee size={18} />, label: 'Interests & Activities', color: '#A52A2A' },
    { icon: <Feather size={18} />, label: 'Create Your Own', color: '#9C27B0' },
  ];

  const publicDetails = [
    { icon: <Home size={18} />, label: 'Home Town', value: profileUser?.profile?.hometown || 'Not specified' },
    { icon: <MapPin size={18} />, label: 'Current City', value: profileUser?.profile?.location || 'Not specified' },
    { icon: <Briefcase size={18} />, label: 'Workplace', value: profileUser?.profile?.work?.[0]?.company || 'Not specified' },
    { icon: <GraduationCap size={18} />, label: 'Education', value: profileUser?.profile?.education?.[0]?.school || 'Not specified' },
  ];

  if (!profileUser) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* 1. Cover Photo Section */}
      <div 
        className="cover-photo-section"
        style={{ 
          backgroundImage: profileUser.profile?.coverPhoto?.url 
            ? `url(${profileUser.profile.coverPhoto.url})` 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        {isOwnProfile && (
          <button 
            className="cover-photo-edit"
            onClick={() => setShowCoverPhotoMenu(true)}
          >
            <Camera size={20} />
            <span>Edit cover photo</span>
          </button>
        )}
      </div>

      {/* Cover Photo Upload Menu */}
      {showCoverPhotoMenu && (
        <div className="upload-menu-overlay">
          <div className="upload-menu">
            <div className="upload-menu-header">
              <h3>Update Cover Photo</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCoverPhotoMenu(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="upload-options">
              <button 
                className="upload-option-btn"
                onClick={() => coverPhotoInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload size={24} />
                <div className="upload-option-text">
                  <strong>Upload Photo</strong>
                  <p>Choose a photo from your device</p>
                </div>
              </button>
              <button 
                className="upload-option-btn"
                onClick={() => {
                  // In real app, open camera
                  coverPhotoInputRef.current?.click();
                }}
                disabled={isUploading}
              >
                <Camera size={24} />
                <div className="upload-option-text">
                  <strong>Take Photo</strong>
                  <p>Use your camera to take a new photo</p>
                </div>
              </button>
              {profileUser.profile?.coverPhoto?.url && (
                <button 
                  className="upload-option-btn remove"
                  onClick={removeCoverPhoto}
                  disabled={isUploading}
                >
                  <X size={24} />
                  <div className="upload-option-text">
                    <strong>Remove Cover Photo</strong>
                    <p>Remove current cover photo</p>
                  </div>
                </button>
              )}
            </div>
            {isUploading && (
              <div className="uploading-overlay">
                <div className="uploading-spinner"></div>
                <p>Uploading to local storage...</p>
              </div>
            )}
          </div>
        </div>
      )}

      <input
        ref={coverPhotoInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverPhotoUpload}
        className="hidden-file-input"
        capture="environment"
      />

      {/* 2. Profile Picture Section */}
      <div className="profile-header-section">
        <div className="profile-picture-container">
          <img
            src={profileUser.profile?.profilePicture?.url || '/default-avatar.png'}
            alt={profileUser.username}
            className="profile-picture"
          />
          {isOwnProfile && (
            <button 
              className="profile-picture-edit"
              onClick={() => setShowProfilePicMenu(true)}
            >
              <Camera size={16} />
            </button>
          )}
        </div>

        {/* Profile Picture Upload Menu */}
        {showProfilePicMenu && (
          <div className="upload-menu-overlay">
            <div className="upload-menu">
              <div className="upload-menu-header">
                <h3>Update Profile Picture</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowProfilePicMenu(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="upload-options">
                <button 
                  className="upload-option-btn"
                  onClick={() => profilePicInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload size={24} />
                  <div className="upload-option-text">
                    <strong>Upload Photo</strong>
                    <p>Choose a photo from your device</p>
                  </div>
                </button>
                <button 
                  className="upload-option-btn"
                  onClick={() => {
                    // In real app, open camera
                    profilePicInputRef.current?.click();
                  }}
                  disabled={isUploading}
                >
                  <Camera size={24} />
                  <div className="upload-option-text">
                    <strong>Take Photo</strong>
                    <p>Use your camera to take a new photo</p>
                  </div>
                </button>
                <button 
                  className="upload-option-btn remove"
                  onClick={removeProfilePhoto}
                  disabled={isUploading}
                >
                  <X size={24} />
                  <div className="upload-option-text">
                    <strong>Remove Current Photo</strong>
                    <p>Revert to default avatar</p>
                  </div>
                </button>
              </div>
              {isUploading && (
                <div className="uploading-overlay">
                  <div className="uploading-spinner"></div>
                  <p>Uploading to local storage...</p>
                </div>
              )}
            </div>
          </div>
        )}

        <input
          ref={profilePicInputRef}
          type="file"
          accept="image/*"
          onChange={handleProfilePicUpload}
          className="hidden-file-input"
          capture="environment"
        />

        {/* 3. User Name */}
        <div className="profile-name-section">
          <h1 className="profile-name">{profileUser.username}</h1>
          {profileUser.isVerified && (
            <span className="verified-badge">
              <CheckCircle size={16} />
              <span>Verified</span>
            </span>
          )}
        </div>

        {/* 4. Friends/Followers Stats */}
        <div className="profile-stats-section">
          <div className="stat-item">
            <Users size={16} />
            <div>
              <strong>1.2K</strong>
              <span>Friends</span>
            </div>
          </div>
          <div className="stat-item">
            <User size={16} />
            <div>
              <strong>2.4K</strong>
              <span>Followers</span>
            </div>
          </div>
          <div className="stat-item">
            <UserPlus size={16} />
            <div>
              <strong>456</strong>
              <span>Following</span>
            </div>
          </div>
        </div>

        {/* 5. Bio */}
        <div className="profile-bio-section">
          <p>{profileUser.profile?.bio || 'No bio added yet.'}</p>
        </div>

        <hr className="section-divider" />

         