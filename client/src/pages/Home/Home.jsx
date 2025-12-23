import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Home as HomeIcon, 
  Users, 
  Video as LiveVideo,  
  ShoppingBag, 
  Bell, 
  MessageCircle,
  Search,
  Filter,
  TrendingUp,
  FileText as Newspaper,  
  Calendar,
  MapPin,
  Camera,
  Smile as Feeling,  
  Image as Photo,  
  MoreHorizontal,
  Share2,
  Send,
  Bookmark,
  Flag
} from 'react-feather';
import CreatePost from '../../components/Post/CreatePost';
import Post from '../../components/Post/Post';
import StoryCarousel from '../../components/Story/StoryCarousel';
import Sidebar from '../../components/Layout/Sidebar';
import RightSidebar from '../../components/Layout/RightSidebar';
import NotificationCenter from '../../components/Notifications/NotificationCenter';
import { fetchFeed, clearPosts } from '../../store/slices/postSlice';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import './Home.css';

const Home = () => {
  const [activeTab, setActiveTab] = useState('home');
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
    // Refresh feed with new post
    dispatch(clearPosts());
    loadFeed(1);
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: <HomeIcon size={20} /> },
    { id: 'friends', label: 'Friends', icon: <Users size={20} /> },
    { id: 'watch', label: 'Watch', icon: <Video size={20} /> },
    { id: 'marketplace', label: 'Marketplace', icon: <Store size={20} /> },
    { id: 'groups', label: 'Groups', icon: <Users size={20} /> }
  ];

  const quickActions = [
    { icon: <LiveVideo size={20} />, label: 'Live Video', color: 'text-red-500' },
    { icon: <Photo size={20} />, label: 'Photo/Video', color: 'text-green-500' },
    { icon: <Feeling size={20} />, label: 'Feeling/Activity', color: 'text-yellow-500' }
  ];

  return (
    <div className="home-container">
      {/* Top Navigation */}
      <div className="top-nav">
        <div className="nav-left">
          <div className="logo">
            <div className="logo-icon">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="logo-text">WaveNet</h1>
          </div>
          
          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search WaveNet..." 
              className="search-input"
            />
          </div>
        </div>
        
        <div className="nav-center">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
        
        <div className="nav-right">
          <button className="nav-icon">
            <Bell size={24} />
          </button>
          <NotificationCenter />
          
          <button className="nav-icon">
            <MessageCircle size={24} />
          </button>
          
          <div className="user-menu">
            <img 
              src={user?.profile?.profilePicture?.url || '/default-avatar.png'} 
              alt={user?.username}
              className="user-avatar"
            />
            <span className="user-name">{user?.username}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Sidebar */}
        <Sidebar user={user} />

        {/* Feed Area */}
        <div className="feed-area" ref={feedRef}>
          {/* Stories */}
          <StoryCarousel />
          
          {/* Create Post Card */}
          <div className="create-post-card">
            <div className="create-post-header">
              <img 
                src={user?.profile?.profilePicture?.url || '/default-avatar.png'} 
                alt={user?.username}
                className="user-avatar-small"
              />
              <button 
                className="create-post-input"
                onClick={() => setShowCreatePost(true)}
              >
                What's on your mind, {user?.username}?
              </button>
            </div>
            
            <div className="quick-actions">
              {quickActions.map((action, index) => (
                <button key={index} className="quick-action-btn">
                  <span className={`action-icon ${action.color}`}>
                    {action.icon}
                  </span>
                  <span className="action-label">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feed Filter */}
          <div className="feed-filter">
            <button className="filter-btn active">
              <Newspaper size={18} />
              <span>All Posts</span>
            </button>
            <button className="filter-btn">
              <TrendingUp size={18} />
              <span>Trending</span>
            </button>
            <button className="filter-btn">
              <Calendar size={18} />
              <span>Events</span>
            </button>
            <button className="filter-btn">
              <Filter size={18} />
              <span>Filters</span>
            </button>
          </div>

          {/* Posts Feed */}
          <div className="posts-feed">
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
                  <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
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
                    <p className="text-sm text-gray-500">Check back later for new posts</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <RightSidebar user={user} />
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
                ✕
              </button>
            </div>
            <CreatePost onPostCreated={handlePostCreated} />
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <button className="fab" onClick={() => setShowCreatePost(true)}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

export default Home;