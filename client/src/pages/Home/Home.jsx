// client/src/pages/Home/Home.jsx
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Image } from 'react-feather';
import { fetchFeed, clearPosts } from '../../store/slices/postSlice';
import Post from '../../components/Post/Post';
import StoryCarousel from '../../components/Story/StoryCarousel';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './Home.css';

// Lazy load CreatePost to avoid duplication
const CreatePost = lazy(() => import('../../components/Post/CreatePost'));

const Home = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Add navigate hook
  const { feed, loading, error } = useSelector(state => state.posts);
  const { user } = useSelector(state => state.auth);
  const feedRef = useRef(null);

  // Fetch initial feed
  useEffect(() => {
    console.log('📡 Home: Fetching feed...');
    dispatch(clearPosts());
    loadFeed(1);
    
    // Set up infinite scroll
    const handleScroll = () => {
      if (!feedRef.current || loadingMore || !hasMore) return;
      
      const { scrollTop, scrollHeight, clientHeight } = feedRef.current;
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        loadMore();
      }
    };
    
    const feedElement = feedRef.current;
    if (feedElement) {
      feedElement.addEventListener('scroll', handleScroll);
      return () => feedElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const loadFeed = async (pageNum) => {
    try {
      setLoadingMore(true);
      const result = await dispatch(fetchFeed({ page: pageNum, limit: 10 })).unwrap();
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadFeed(page + 1);
    }
  };

  const handlePostCreated = () => {
    console.log('✅ Post created, refreshing feed...');
    dispatch(clearPosts());
    loadFeed(1);
    setShowCreatePost(false);
  };

  // Handle profile click
  const handleProfileClick = () => {
    if (user?._id) {
      console.log('👤 Navigating to profile:', user._id);
      navigate(`/profile/${user._id}`);
    } else {
      console.error('No user ID found');
    }
  };

  return (
    <div className="home-container">
      {/* DEBUG - Remove in production */}
      <div className="debug-info">
        <strong>Home Status:</strong>
        <div>User: {user?.username || 'Loading...'}</div>
        <div>Posts: {feed?.length || 0}</div>
        <div>Create Post Modal: {showCreatePost ? 'Open' : 'Closed'}</div>
      </div>
      
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
              src={user?.profile?.profilePicture?.url || '/default-avatar.png'} 
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
            What's on your mind, {user?.username}?
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

      {/* Posts Feed */}
      <div className="posts-feed" ref={feedRef}>
        {loading && page === 1 ? (
          <LoadingSpinner text="Loading posts..." />
        ) : error ? (
          <div className="error-message">
            <p>Error loading posts: {error}</p>
            <button 
              onClick={() => loadFeed(1)}
              className="retry-btn"
              type="button"
            >
              Retry
            </button>
          </div>
        ) : feed.length === 0 ? (
          <div className="empty-feed">
            <div className="empty-illustration">
              <div className="newspaper-icon">📰</div>
            </div>
            <h3>No posts yet</h3>
            <p>Start following people or join groups to see posts in your feed.</p>
            <button className="explore-btn" type="button">Explore WaveNet</button>
          </div>
        ) : (
          <>
            {feed.map(post => (
              <Post key={post._id} post={post} />
            ))}
            
            {loadingMore && (
              <div className="loading-more">
                <LoadingSpinner size="small" text="Loading more posts..." />
              </div>
            )}
            
            {!hasMore && feed.length > 0 && (
              <div className="end-of-feed">
                <p>You're all caught up! 🎉</p>
                <p className="text-sm">Check back later for new posts</p>
              </div>
            )}
          </>
        )}
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