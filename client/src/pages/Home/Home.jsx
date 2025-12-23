// client/src/pages/Home/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFeed, clearPosts } from '../../store/slices/postSlice';
import CreatePost from '../../components/Post/CreatePost';
import Post from '../../components/Post/Post';
import StoryCarousel from '../../components/Story/StoryCarousel';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './Home.css';

const Home = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const dispatch = useDispatch();
  const { feed, loading, error } = useSelector(state => state.posts);
  const { user } = useSelector(state => state.auth);
  const feedRef = useRef(null);

  // Fetch initial feed
  useEffect(() => {
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
    dispatch(clearPosts());
    loadFeed(1);
  };

  return (
    <div className="home-container">
      {/* User Profile and Create Post */}
      <div className="create-post-section">
        <div className="user-profile-row">
          <img 
            src={user?.profile?.profilePicture?.url || '/default-avatar.png'} 
            alt={user?.username}
            className="profile-pic-small"
          />
          <button 
            className="whats-on-mind"
            onClick={() => setShowCreatePost(true)}
          >
            What's on your mind, {user?.username}?
          </button>
          <button className="photo-btn">
            <i className="fi fi-sr-add-image"></i>
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
            >
              Retry
            </button>
          </div>
        ) : feed.length === 0 ? (
          <div className="empty-feed">
            <div className="empty-illustration">
              <i className="fi fi-ts-newspaper"></i>
            </div>
            <h3>No posts yet</h3>
            <p>Start following people or join groups to see posts in your feed.</p>
            <button className="explore-btn">Explore WaveNet</button>
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

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Post</h3>
              <button 
                className="close-modal"
                onClick={() => setShowCreatePost(false)}
              >
                <i className="fi fi-rr-cross-small"></i>
              </button>
            </div>
            <CreatePost onPostCreated={handlePostCreated} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;