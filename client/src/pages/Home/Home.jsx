// client/src/pages/Home/Home.jsx
import React, { useState, lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Image } from 'react-feather';
import Feed from '../../components/Feed/Feed';
import StoryCarousel from '../../components/Story/StoryCarousel';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './Home.css';

// Lazy load CreatePost to avoid duplication
const CreatePost = lazy(() => import('../../components/Post/CreatePost'));

const Home = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth || {});
  const { feed, loading } = useSelector(state => state.posts || {});

  // Handle profile click
  const handleProfileClick = () => {
    if (user?._id) {
      navigate(`/profile/${user._id}`);
    }
  };

  const handlePostCreated = (newPost) => {
    console.log('New post created:', newPost);
    setShowCreatePost(false);
    
    // Refresh feed by reloading the page or triggering a refresh
    if (window.refreshFeed) {
      window.refreshFeed();
    }
  };

  return (
    <div className="home-container">
      {/* User Profile and Create Post Button */}
      <div className="create-post-section">
        <div className="user-profile-row">
          {/* Clickable Profile Picture */}
          <div 
            className="profile-pic-container"
            onClick={handleProfileClick}
            title="Go to your profile"
          >
            <img 
              src={user?.profile?.profilePicture?.url || user?.profilePicture || '/default-avatar.png'} 
              alt={user?.username}
              className="profile-pic-small"
            />
            <div className="profile-click-overlay">
              <span>Profile</span>
            </div>
          </div>
          
          <button 
            className="whats-on-mind"
            onClick={() => setShowCreatePost(true)}
            type="button"
          >
            What's on your mind, {user?.username || 'User'}?
          </button>
          <button 
            className="photo-btn"
            onClick={() => setShowCreatePost(true)}
            type="button"
          >
            <Image size={20} />
          </button>
        </div>
      </div>

      {/* Stories */}
      <div className="stories-section">
        <StoryCarousel user={user} />
      </div>

      {/* Stories Separator */}
      <div className="stories-separator"></div>

      {/* Feed Component */}
      <div className="feed-section">
        <Feed />
      </div>

      {/* Create Post Modal - Only shows when clicked */}
      {showCreatePost && (
        <div className="modal-overlay" onClick={() => setShowCreatePost(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <Suspense fallback={<div className="modal-loading">Loading create post...</div>}>
              <CreatePost 
                onPostCreated={handlePostCreated}
                onClose={() => setShowCreatePost(false)}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;