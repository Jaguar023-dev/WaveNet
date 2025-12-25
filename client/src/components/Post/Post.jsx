import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  ThumbsUp, Smile, Frown, Heart as HeartIcon, AlertTriangle,
  Globe, Users, Lock, Send, CheckCircle,
  Repeat, BarChart, Eye, TrendingUp, Users as UsersIcon,
  Edit, Trash2, Flag, Link, ExternalLink,
  Image, Video, MapPin, Calendar,
  ChevronDown, ChevronUp, X, Filter,
  Download, Maximize2, Minimize2
} from 'react-feather';
import './Post.css';

// Local storage helper functions
const POSTS_STORAGE_KEY = 'facebook_posts';
const USER_REACTIONS_KEY = 'user_reactions';
const USER_COMMENTS_KEY = 'user_comments';

const Post = ({ post, isReshare = false, originalPost = null }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [userReaction, setUserReaction] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  
  const { user } = useSelector(state => state.auth);
  const commentInputRef = useRef(null);
  const optionsMenuRef = useRef(null);

  // Reactions with Facebook-style emojis
  const reactions = [
    { type: 'like', emoji: '👍', label: 'Like', color: '#1877F2' },
    { type: 'love', emoji: '❤️', label: 'Love', color: '#F33E58' },
    { type: 'haha', emoji: '😂', label: 'Haha', color: '#F7B125' },
    { type: 'wow', emoji: '😮', label: 'Wow', color: '#F7B125' },
    { type: 'sad', emoji: '😢', label: 'Sad', color: '#F7B125' },
    { type: 'angry', emoji: '😠', label: 'Angry', color: '#E9710F' },
  ];

  // Initialize post data
  useEffect(() => {
    loadPostData();
    checkIfOwner();
    loadUserInteractions();
    incrementViewCount();
  }, [post]);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setShowOptionsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadPostData = () => {
    // Load from local storage or use props
    const storedPosts = JSON.parse(localStorage.getItem(POSTS_STORAGE_KEY)) || [];
    const storedPost = storedPosts.find(p => p.id === post.id) || post;
    
    setComments(storedPost.comments || []);
    setShareCount(storedPost.shares || 0);
    setViewCount(storedPost.views || Math.floor(Math.random() * 1000) + 100); // Simulated views
  };

  const checkIfOwner = () => {
    setIsOwner(user?.id === post.user?.id || user?.username === post.user?.username);
  };

  const loadUserInteractions = () => {
    const userReactions = JSON.parse(localStorage.getItem(USER_REACTIONS_KEY)) || {};
    const userSavedPosts = JSON.parse(localStorage.getItem('saved_posts')) || [];
    
    if (userReactions[post.id]) {
      setUserReaction(userReactions[post.id]);
      setIsLiked(true);
    }
    
    if (userSavedPosts.includes(post.id)) {
      setIsSaved(true);
    }
  };

  const incrementViewCount = () => {
    // Simulate view tracking
    const newViews = viewCount + 1;
    setViewCount(newViews);
    
    // Update in local storage
    updatePostInStorage({ views: newViews });
  };

  const updatePostInStorage = (updates) => {
    const storedPosts = JSON.parse(localStorage.getItem(POSTS_STORAGE_KEY)) || [];
    const postIndex = storedPosts.findIndex(p => p.id === post.id);
    
    if (postIndex !== -1) {
      storedPosts[postIndex] = { ...storedPosts[postIndex], ...updates };
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(storedPosts));
    }
  };

  const handleReaction = (reactionType) => {
    const userReactions = JSON.parse(localStorage.getItem(USER_REACTIONS_KEY)) || {};
    
    if (userReaction === reactionType) {
      // Remove reaction
      delete userReactions[post.id];
      setUserReaction(null);
      setIsLiked(false);
    } else {
      // Add new reaction
      userReactions[post.id] = reactionType;
      setUserReaction(reactionType);
      setIsLiked(true);
      
      // Update post reactions count
      const reactionCount = (post.reactionCount || 0) + 1;
      updatePostInStorage({ reactionCount });
    }
    
    localStorage.setItem(USER_REACTIONS_KEY, JSON.stringify(userReactions));
    setShowReactions(false);
  };

  const handleComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: Date.now().toString(),
        user: {
          id: user?.id,
          username: user?.username,
          profilePicture: user?.profilePicture,
          isVerified: user?.isVerified
        },
        content: comment,
        createdAt: new Date().toISOString(),
        likes: 0
      };
      
      const updatedComments = [...comments, newComment];
      setComments(updatedComments);
      setComment('');
      
      // Save to local storage
      updatePostInStorage({ comments: updatedComments });
      
      // Focus back on input
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    }
  };

  const handleLikeComment = (commentId) => {
    const updatedComments = comments.map(c => {
      if (c.id === commentId) {
        return { ...c, likes: (c.likes || 0) + 1 };
      }
      return c;
    });
    
    setComments(updatedComments);
    updatePostInStorage({ comments: updatedComments });
  };

  const handleShare = (shareType = 'timeline') => {
    const newShare = {
      id: Date.now().toString(),
      userId: user?.id,
      type: shareType,
      timestamp: new Date().toISOString()
    };
    
    const newShareCount = shareCount + 1;
    setShareCount(newShareCount);
    
    // Update in storage
    updatePostInStorage({ 
      shares: newShareCount,
      shareHistory: [...(post.shareHistory || []), newShare]
    });
    
    // If resharing to own profile, create a new post
    if (shareType === 'profile') {
      resharePost();
    }
    
    setShowShareMenu(false);
  };

  const resharePost = () => {
    const resharePostData = {
      id: `reshare_${Date.now()}`,
      user: {
        id: user?.id,
        username: user?.username,
        profilePicture: user?.profilePicture,
        isVerified: user?.isVerified
      },
      content: post.content,
      originalPost: {
        id: post.id,
        user: post.user,
        content: post.content
      },
      isReshare: true,
      createdAt: new Date().toISOString(),
      privacy: 'friends',
      media: post.media,
      hashtags: post.hashtags,
      reactionCount: 0,
      comments: [],
      shares: 0,
      views: 0
    };
    
    // Save to local storage
    const storedPosts = JSON.parse(localStorage.getItem(POSTS_STORAGE_KEY)) || [];
    storedPosts.unshift(resharePostData);
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(storedPosts));
    
    // Show success message or trigger update
    alert('Post reshared to your profile!');
  };

  const handleSavePost = () => {
    const savedPosts = JSON.parse(localStorage.getItem('saved_posts')) || [];
    
    if (isSaved) {
      // Remove from saved
      const index = savedPosts.indexOf(post.id);
      if (index > -1) {
        savedPosts.splice(index, 1);
      }
    } else {
      // Add to saved
      savedPosts.push(post.id);
    }
    
    setIsSaved(!isSaved);
    localStorage.setItem('saved_posts', JSON.stringify(savedPosts));
  };

  const handleDeletePost = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      const storedPosts = JSON.parse(localStorage.getItem(POSTS_STORAGE_KEY)) || [];
      const updatedPosts = storedPosts.filter(p => p.id !== post.id);
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
      
      // Trigger parent component to remove post
      if (window.postDeletedCallback) {
        window.postDeletedCallback(post.id);
      }
      
      setShowOptionsMenu(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
    if (diffDays < 365) return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPrivacyIcon = (privacy) => {
    switch (privacy) {
      case 'public': return <Globe size={12} />;
      case 'friends': return <Users size={12} />;
      case 'only_me': return <Lock size={12} />;
      default: return <Globe size={12} />;
    }
  };

  const getPrivacyText = (privacy) => {
    switch (privacy) {
      case 'public': return 'Public';
      case 'friends': return 'Friends';
      case 'only_me': return 'Only me';
      default: return 'Public';
    }
  };

  const VerifiedBadge = ({ size = 16, showTooltip = true }) => (
    <span 
      className="verified-badge"
      title={showTooltip ? "Verified Account" : undefined}
    >
      <CheckCircle size={size} />
    </span>
  );

  // Generate post insights data
  const generateInsights = () => {
    const engagementRate = ((comments.length + (post.reactionCount || 0)) / viewCount * 100).toFixed(1);
    const sharesPerView = (shareCount / viewCount * 100).toFixed(1);
    
    return {
      reach: viewCount + Math.floor(Math.random() * 500), // Simulated organic reach
      engagement: comments.length + (post.reactionCount || 0),
      engagementRate: `${engagementRate}%`,
      shares: shareCount,
      sharesPerView: `${sharesPerView}%`,
      topLocations: ['United States', 'India', 'UK', 'Canada'],
      demographic: {
        male: Math.floor(Math.random() * 30) + 40,
        female: Math.floor(Math.random() * 30) + 40,
        ageGroups: {
          '18-24': Math.floor(Math.random() * 30),
          '25-34': Math.floor(Math.random() * 40),
          '35-44': Math.floor(Math.random() * 20),
          '45+': Math.floor(Math.random() * 10)
        }
      }
    };
  };

  const insights = generateInsights();

  return (
    <div className={`post-container ${isReshare ? 'reshare-post' : ''}`}>
      {/* Reshare Header */}
      {isReshare && originalPost && (
        <div className="reshare-header">
          <Repeat size={14} />
          <span>
            <strong>{post.user?.username}</strong> shared a post from{' '}
            <strong>{originalPost.user?.username}</strong>
          </span>
        </div>
      )}

      {/* Post Header */}
      <div className="post-header">
        <div className="post-user">
          <img 
            src={post.user?.profilePicture || '/default-avatar.png'} 
            alt={post.user?.username}
            className="post-avatar"
            onError={(e) => {
              e.target.src = '/default-avatar.png';
            }}
          />
          <div className="post-user-info">
            <div className="post-user-name-wrapper">
              <h4 className="post-username">{post.user?.username}</h4>
              {post.user?.isVerified && <VerifiedBadge size={16} showTooltip={true} />}
            </div>
            <div className="post-meta">
              <span className="post-time" title={new Date(post.createdAt).toLocaleString()}>
                {formatTime(post.createdAt)}
              </span>
              <span className="post-privacy">
                {getPrivacyIcon(post.privacy)}
                <span className="privacy-text">{getPrivacyText(post.privacy)}</span>
              </span>
              {post.location && (
                <span className="post-location">
                  <MapPin size={12} />
                  {post.location}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="post-header-actions" ref={optionsMenuRef}>
          {isOwner && (
            <button 
              className="insights-btn"
              onClick={() => setShowInsights(!showInsights)}
              title="View insights"
            >
              <BarChart size={18} />
            </button>
          )}
          
          <button 
            className="post-menu-btn"
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
          >
            <MoreHorizontal size={20} />
          </button>
          
          {showOptionsMenu && (
            <div className="options-menu">
              {isOwner ? (
                <>
                  <button className="option-item" onClick={() => {/* Edit post */}}>
                    <Edit size={16} />
                    <span>Edit post</span>
                  </button>
                  <button className="option-item delete" onClick={handleDeletePost}>
                    <Trash2 size={16} />
                    <span>Delete post</span>
                  </button>
                </>
              ) : (
                <>
                  <button className="option-item">
                    <Flag size={16} />
                    <span>Report post</span>
                  </button>
                  <button className="option-item">
                    <Link size={16} />
                    <span>Copy link</span>
                  </button>
                </>
              )}
              <button className="option-item" onClick={handleSavePost}>
                <Bookmark size={16} />
                <span>{isSaved ? 'Unsave post' : 'Save post'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="post-content">
        {post.content && (
          <p className="post-text">{post.content}</p>
        )}
        
        {/* Original post content for reshare */}
        {isReshare && originalPost && (
          <div className="original-post-preview">
            <div className="original-post-header">
              <img 
                src={originalPost.user?.profilePicture || '/default-avatar.png'} 
                alt={originalPost.user?.username}
                className="original-post-avatar"
              />
              <div className="original-post-info">
                <strong>{originalPost.user?.username}</strong>
                <span>{formatTime(originalPost.createdAt)} • {getPrivacyText(originalPost.privacy)}</span>
              </div>
            </div>
            <p className="original-post-text">{originalPost.content}</p>
          </div>
        )}

        {/* Post Media */}
        {post.media && post.media.length > 0 && (
          <div className={`post-media ${post.media.length === 1 ? 'single' : 'multiple'}`}>
            {post.media.slice(0, 4).map((media, index) => (
              <div key={index} className="media-item">
                {media.type === 'image' ? (
                  <img 
                    src={media.url} 
                    alt={`Post media ${index + 1}`}
                    loading="lazy"
                  />
                ) : (
                  <video src={media.url} controls />
                )}
                {post.media.length > 4 && index === 3 && (
                  <div className="media-overlay">+{post.media.length - 4}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Post Tags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="post-tags">
            {post.hashtags.map((tag, index) => (
              <span key={index} className="post-tag">#{tag}</span>
            ))}
          </div>
        )}

        {/* Post Stats */}
        <div className="post-stats">
          <div className="reactions-count">
            <div className="reaction-icons">
              {reactions.slice(0, 3).map((reaction, index) => (
                <span 
                  key={index} 
                  className="reaction-icon"
                  style={{ backgroundColor: reaction.color }}
                >
                  {reaction.emoji}
                </span>
              ))}
              {post.reactionCount > 3 && (
                <span className="reaction-count">+{post.reactionCount - 3}</span>
              )}
            </div>
            <span>{post.reactionCount || 0}</span>
          </div>
          <div className="comments-shares">
            <span>{comments.length} comments</span>
            <span>•</span>
            <span>{shareCount} shares</span>
            <span>•</span>
            <span className="view-count">
              <Eye size={12} />
              {viewCount.toLocaleString()} views
            </span>
          </div>
        </div>
      </div>

      {/* Post Insights (Owner only) */}
      {showInsights && isOwner && (
        <div className="post-insights">
          <div className="insights-header">
            <h4>Post Insights</h4>
            <button onClick={() => setShowInsights(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">
                <Eye size={20} />
              </div>
              <div className="insight-content">
                <h5>Reach</h5>
                <p className="insight-value">{insights.reach.toLocaleString()}</p>
                <p className="insight-label">People reached</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">
                <UsersIcon size={20} />
              </div>
              <div className="insight-content">
                <h5>Engagement</h5>
                <p className="insight-value">{insights.engagement}</p>
                <p className="insight-label">{insights.engagementRate} engagement rate</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">
                <Share2 size={20} />
              </div>
              <div className="insight-content">
                <h5>Shares</h5>
                <p className="insight-value">{insights.shares}</p>
                <p className="insight-label">{insights.sharesPerView} share rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="post-actions">
        <div className="action-buttons">
          <button 
            className={`action-btn ${userReaction ? 'active' : ''}`}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setTimeout(() => setShowReactions(false), 300)}
            onClick={() => userReaction ? handleReaction(userReaction) : handleReaction('like')}
            style={userReaction ? {
              color: reactions.find(r => r.type === userReaction)?.color || '#1877F2'
            } : {}}
          >
            <ThumbsUp size={20} />
            <span>{userReaction ? reactions.find(r => r.type === userReaction)?.label : 'Like'}</span>
          </button>
          
                    <button 
            className={`action-btn ${showComments ? 'active' : ''}`}
            onClick={() => {
              setShowComments(!showComments);
              if (!showComments && commentInputRef.current) {
                setTimeout(() => commentInputRef.current.focus(), 100);
              }
            }}
          >
            <MessageCircle size={20} />
            <span>Comment</span>
          </button>
          
          <button 
            className="action-btn"
            onClick={() => setShowShareMenu(!showShareMenu)}
          >
            <Share2 size={20} />
            <span>Share</span>
          </button>
        </div>
        
        <button 
          className={`save-btn ${isSaved ? 'saved' : ''}`}
          onClick={handleSavePost}
          title={isSaved ? 'Unsave post' : 'Save post'}
        >
          <Bookmark size={20} />
        </button>

        {/* Reactions Popup */}
        {showReactions && (
          <div 
            className="reactions-popup" 
            onMouseEnter={() => setShowReactions(true)} 
            onMouseLeave={() => setTimeout(() => setShowReactions(false), 500)}
          >
            {reactions.map(reaction => (
              <button
                key={reaction.type}
                className="reaction-option"
                onClick={() => handleReaction(reaction.type)}
                title={reaction.label}
                style={{ transform: userReaction === reaction.type ? 'scale(1.3)' : 'scale(1)' }}
              >
                <span className="reaction-emoji" style={{ fontSize: '22px' }}>
                  {reaction.emoji}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Share Menu */}
        {showShareMenu && (
          <div className="share-menu">
            <div className="share-options">
              <button className="share-option" onClick={() => handleShare('profile')}>
                <div className="share-icon">
                  <Users size={20} />
                </div>
                <div className="share-info">
                  <strong>Share to your profile</strong>
                  <p>Post will appear on your timeline</p>
                </div>
              </button>
              <button className="share-option" onClick={() => handleShare('friends')}>
                <div className="share-icon">
                  <UsersIcon size={20} />
                </div>
                <div className="share-info">
                  <strong>Share with friends</strong>
                  <p>Send in Messenger or group chat</p>
                </div>
              </button>
              <button className="share-option" onClick={() => handleShare('copy')}>
                <div className="share-icon">
                  <Link size={20} />
                </div>
                <div className="share-info">
                  <strong>Copy link</strong>
                  <p>Copy URL to share anywhere</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
          {/* Comment Input */}
          <div className="comment-input-container">
            <img 
              src={user?.profilePicture || '/default-avatar.png'} 
              alt={user?.username}
              className="comment-avatar"
            />
            <div className="comment-input-wrapper">
              <input
                ref={commentInputRef}
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="comment-input"
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
              />
              <div className="comment-actions">
                <button className="comment-action-btn">
                  <Smile size={18} />
                </button>
                <button 
                  className="comment-send-btn"
                  onClick={handleComment}
                  disabled={!comment.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="comments-list">
            {comments.length > 0 ? (
              comments.slice(0, 3).map(comment => (
                <div key={comment.id} className="comment-item">
                  <img 
                    src={comment.user?.profilePicture || '/default-avatar.png'} 
                    alt={comment.user?.username}
                    className="comment-avatar"
                  />
                  <div className="comment-content">
                    <div className="comment-header">
                      <div className="comment-user-wrapper">
                        <span className="comment-username">{comment.user?.username}</span>
                        {comment.user?.isVerified && <VerifiedBadge size={14} showTooltip={false} />}
                      </div>
                      <span className="comment-time">{formatTime(comment.createdAt)}</span>
                    </div>
                    <p className="comment-text">{comment.content}</p>
                    <div className="comment-actions-bottom">
                      <button 
                        className="comment-like-btn"
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        Like ({comment.likes || 0})
                      </button>
                      <span className="comment-reply">Reply</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            )}
            
            {comments.length > 3 && (
              <button className="view-all-comments">
                View all {comments.length} comments
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;