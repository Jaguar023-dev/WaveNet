// client/src/components/Feed/Feed.jsx
import React, { useState, useEffect } from 'react';
import Post from '../Post/Post';
import CreatePost from '../Post/CreatePost';
import PostService from '../../services/PostService';
import './Feed.css';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  
  useEffect(() => {
    loadPosts();
    
    // Listen for post creation events
    window.onPostCreated = (newPost) => {
      setPosts(prev => [newPost, ...prev]);
      setShowCreatePost(false);
    };
    
    window.refreshFeed = () => {
      loadPosts();
    };
    
    window.onPostDeleted = (postId) => {
      setPosts(prev => prev.filter(p => p.id !== postId));
    };
  }, []);
  
  const loadPosts = () => {
    setLoading(true);
    const currentUser = PostService.getCurrentUser();
    const feedPosts = PostService.getFeedPosts(currentUser.id, 20);
    setPosts(feedPosts);
    setLoading(false);
  };
  
  const handleCreatePost = () => {
    setShowCreatePost(true);
  };
  
  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreatePost(false);
  };
  
  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };
  
  if (loading) {
    return (
      <div className="feed-container">
        <div className="feed-loading">
          <div className="spinner"></div>
          <p>Loading posts...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="feed-container">
      {/* Create Post Button */}
      <div className="create-post-button-container">
        <button className="create-post-button" onClick={handleCreatePost}>
          <div className="create-post-button-content">
            <span className="create-post-icon">📝</span>
            <span className="create-post-text">What's on your mind?</span>
          </div>
        </button>
      </div>
      
      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="create-post-modal">
          <div className="create-post-modal-content">
            <CreatePost onPostCreated={handlePostCreated} />
            <button 
              className="close-modal-btn"
              onClick={() => setShowCreatePost(false)}
            >
              ✕
            </button>
          </div>
          <div 
            className="create-post-modal-overlay"
            onClick={() => setShowCreatePost(false)}
          />
        </div>
      )}
      
      {/* Posts List */}
      <div className="posts-list">
        {posts.length === 0 ? (
          <div className="no-posts">
            <h3>No posts yet</h3>
            <p>Be the first to create a post!</p>
            <button 
              className="create-first-post-btn"
              onClick={handleCreatePost}
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          posts.map(post => (
            <Post 
              key={post.id} 
              post={post}
              isReshare={post.isReshare}
              originalPost={post.originalPost}
            />
          ))
        )}
      </div>
      
      {/* Clear Data Button (for testing) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="dev-tools">
          <button 
            className="clear-data-btn"
            onClick={() => {
              if (window.confirm('Clear all posts and reset to initial state?')) {
                PostService.clearAllData();
                window.location.reload();
              }
            }}
          >
            🧹 Clear All Data
          </button>
          <button 
            className="refresh-feed-btn"
            onClick={loadPosts}
          >
            🔄 Refresh Feed
          </button>
        </div>
      )}
    </div>
  );
};

export default Feed;