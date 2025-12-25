import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  ThumbsUp, Smile, Heart as HeartIcon,
  Globe, Users, Lock, Send, CheckCircle,
  Repeat, BarChart, Eye, Users as UsersIcon,
  Edit, Trash2, Flag, Link,
  Image, Video, MapPin, Calendar,
  ChevronDown, ChevronUp, X,
  Download, Maximize2, Minimize2
} from 'react-feather';
import PostService from '../../services/PostService';
import './Post.css';

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
  const [reactionCount, setReactionCount] = useState(0);
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
    if (!post || !post.id) return;
    
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
    if (!post.id) return;
    
    // Get post data from PostService
    const postData = PostService.getAllPosts().find(p => p.id === post.id) || post;
    
    setComments(postData.comments || []);
    setShareCount(postData.shares || 0);
    setViewCount(postData.views || 0);
    setReactionCount(postData.reactionCount || 0);
  };

  const checkIfOwner = () => {
    if (!user || !post.user) return;
    setIsOwner(user?.id === post.user?.id || user?.username === post.user?.username);
  };

  const loadUserInteractions = () => {
    if (!post.id) return;
    
    const userReaction = PostService.getUserReaction(post.id);
    const isSaved = PostService.isPostSaved(post.id);
    
    if (userReaction) {
      setUserReaction(userReaction);
      setIsLiked(true);
    }
    
    setIsSaved(isSaved);
  };

  const incrementViewCount = () => {
    if (!post.id) return;
    const newViewCount = PostService.incrementViewCount(post.id);
    setViewCount(newViewCount);
  };

  const handleReaction = (reactionType) => {
    if (!post.id) return;
    
    const result = PostService.reactToPost(post.id, reactionType);
    setUserReaction(result.userReaction);
    setIsLiked(!!result.userReaction);
    setReactionCount(result.reactionCount);
    setShowReactions(false);
  };

  const handleComment = () => {
    if (!post.id || !comment.trim()) return;
    
    try {
      const newComment = PostService.addComment(post.id, comment);
      setComments(prev => [...prev, newComment]);
      setComment('');
      
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
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
    
    // Update in PostService (you might want to add this method to PostService)
    const postData = PostService.getAllPosts().find(p => p.id === post.id);
    if (postData) {
      postData.comments = updatedComments;
      // You might need to add an updateComments method to PostService
    }
  };

  const handleShare = (shareType = 'timeline') => {
    if (!post.id) return;
    
    if (shareType === 'profile') {
      try {
        const resharedPost = PostService.resharePost(post.id);
        setShareCount(prev => prev + 1);
        alert('Post reshared to your profile!');
        
        // Refresh feed if callback exists
        if (window.refreshFeed) {
          window.refreshFeed();
        }
      } catch (error) {
        console.error('Error resharing post:', error);
        alert('Failed to reshare post. Please try again.');
      }
    } else if (shareType === 'copy') {
      navigator.clipboard.writeText(window.location.origin + '/post/' + post.id)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => alert('Failed to copy link.'));
    }
    
    setShowShareMenu(false);
  };

  const handleSavePost = () => {
    if (!post.id) return;
    
    if (isSaved) {
      PostService.unsavePost(post.id);
      setIsSaved(false);
    } else {
      PostService.savePost(post.id);
      setIsSaved(true);
    }
  };

  const handleDeletePost = () => {
    if (!post.id) return;
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      PostService.deletePost(post.id);
      
      // Trigger parent component to remove post
      if (window.onPostDeleted) {
        window.onPostDeleted(post.id);
      }
      
      setShowOptionsMenu(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return 'Just now';
    
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
    if (!post.id) return null;
    
    const insights = PostService.getPostInsights(post.id);
    if (insights) return insights;
    
    // Fallback if PostService doesn't have insights
    const engagementRate = ((comments.length + reactionCount) / (viewCount || 1) * 100).toFixed(1);
    const sharesPerView = (shareCount / (viewCount || 1) * 100).toFixed(1);
    
    return {
      reach: viewCount || 0,
      engagement: comments.length + reactionCount,
      engagementRate: `${engagementRate}%`,
      shares: shareCount,
      shareRate: `${sharesPerView}%`,
      comments: comments.length,
      reactions: reactionCount,
      demographics: {
        locations: ['United States', 'India', 'UK', 'Canada'],
        ageGroups: {
          '18-24': Math.floor(Math.random() * 30) + 20,
          '25-34': Math.floor(Math.random() * 40) + 30,
          '35-44': Math.floor(Math.random() * 20) + 15,
          '45+': Math.floor(Math.random() * 10) + 5
        }
      }
    };
  };

  const insights = generateInsights();

  if (!post || !post.id) {
    return <div className="post-container">Post not found</div>;
  }

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
              {reactionCount > 3 && (
                <span className="reaction-count">+{reactionCount - 3}</span>
              )}
            </div>
            <span>{reactionCount || 0}</span>
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
      {showInsights && isOwner && insights && (
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
                <p className="insight-label">{insights.shareRate} share rate</p>
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