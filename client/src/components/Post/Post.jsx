import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, 
  ThumbsUp, Smile, Frown, Heart as HeartIcon, AlertTriangle,
  Globe, Users, Lock, Send, CheckCircle
} from 'react-feather';
import './Post.css';

const Post = ({ post }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const { user } = useSelector(state => state.auth);

  const reactions = [
    { type: 'like', emoji: '👍', label: 'Like' },
    { type: 'love', emoji: '❤️', label: 'Love' },
    { type: 'haha', emoji: '😂', label: 'Haha' },
    { type: 'wow', emoji: '😮', label: 'Wow' },
    { type: 'sad', emoji: '😢', label: 'Sad' },
    { type: 'angry', emoji: '😠', label: 'Angry' },
  ];

  const handleReaction = (reactionType) => {
    console.log(`Reacted with ${reactionType} to post ${post._id}`);
    setShowReactions(false);
  };

  const handleComment = () => {
    if (comment.trim()) {
      console.log(`Comment on post ${post._id}: ${comment}`);
      setComment('');
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return postDate.toLocaleDateString();
  };

  const getPrivacyIcon = (privacy) => {
    switch (privacy) {
      case 'public': return <Globe size={12} />;
      case 'friends': return <Users size={12} />;
      case 'only-me': return <Lock size={12} />;
      default: return <Globe size={12} />;
    }
  };

  // NEW: Verified Badge Component
  const VerifiedBadge = ({ size = 16, showTooltip = true }) => (
    <span 
      className="verified-badge"
      title={showTooltip ? "Verified Account" : undefined}
    >
      <CheckCircle size={size} />
    </span>
  );

  return (
    <div className="post-container">
      {/* Post Header */}
      <div className="post-header">
        <div className="post-user">
          <img 
            src={post.user?.profilePicture || '/default-avatar.png'} 
            alt={post.user?.username}
            className="post-avatar"
          />
          <div className="post-user-info">
            <div className="post-user-name-wrapper">
              <h4 className="post-username">{post.user?.username}</h4>
              {/* ADDED: Verified Badge */}
              {post.user?.isVerified && (
                <VerifiedBadge size={16} showTooltip={true} />
              )}
            </div>
            <div className="post-meta">
              <span className="post-time">{formatTime(post.createdAt)}</span>
              <span className="post-privacy">
                {getPrivacyIcon(post.privacy)}
                {post.privacy}
              </span>
              {post.location && (
                <span className="post-location">📍 {post.location}</span>
              )}
            </div>
          </div>
        </div>
        <button className="post-menu-btn">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Content */}
      <div className="post-content">
        {post.content && (
          <p className="post-text">{post.content}</p>
        )}
        
        {/* Post Media */}
        {post.media && post.media.length > 0 && (
          <div className={`post-media ${post.media.length === 1 ? 'single' : 'multiple'}`}>
            {post.media.slice(0, 4).map((media, index) => (
              <div key={index} className="media-item">
                {media.type === 'image' ? (
                  <img src={media.url} alt={`Post media ${index + 1}`} />
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
              {['❤️', '👍', '😂'].map((emoji, index) => (
                <span key={index} className="reaction-icon">{emoji}</span>
              ))}
            </div>
            <span>{post.reactions?.length || 0}</span>
          </div>
          <div className="comments-shares">
            <span>{post.comments?.length || 0} comments</span>
            <span>•</span>
            <span>{post.shares?.length || 0} shares</span>
          </div>
        </div>
      </div>

      {/* Post Actions */}
      <div className="post-actions">
        <div className="action-buttons">
          <button 
            className="action-btn"
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setTimeout(() => setShowReactions(false), 300)}
          >
            <ThumbsUp size={20} />
            <span>Like</span>
          </button>
          
          <button 
            className="action-btn"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={20} />
            <span>Comment</span>
          </button>
          
          <button className="action-btn">
            <Share2 size={20} />
            <span>Share</span>
          </button>
        </div>
        
        <button className="save-btn">
          <Bookmark size={20} />
        </button>

        {/* Reactions Popup */}
        {showReactions && (
          <div className="reactions-popup" onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setTimeout(() => setShowReactions(false), 500)}>
            {reactions.map(reaction => (
              <button
                key={reaction.type}
                className="reaction-option"
                onClick={() => handleReaction(reaction.type)}
                title={reaction.label}
              >
                <span className="reaction-emoji">{reaction.emoji}</span>
              </button>
            ))}
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
            {post.comments && post.comments.length > 0 ? (
              post.comments.slice(0, 3).map(comment => (
                <div key={comment._id} className="comment-item">
                  <img 
                    src={comment.user?.profilePicture || '/default-avatar.png'} 
                    alt={comment.user?.username}
                    className="comment-avatar"
                  />
                  <div className="comment-content">
                    <div className="comment-header">
                      <div className="comment-user-wrapper">
                        <span className="comment-username">{comment.user?.username}</span>
                        {/* ADDED: Verified Badge in Comments */}
                        {comment.user?.isVerified && (
                          <VerifiedBadge size={14} showTooltip={false} />
                        )}
                      </div>
                      <span className="comment-time">{formatTime(comment.createdAt)}</span>
                    </div>
                    <p className="comment-text">{comment.content}</p>
                    <div className="comment-actions">
                      <button className="comment-like-btn">Like</button>
                      <span className="comment-reply">Reply</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            )}
            
            {post.comments && post.comments.length > 3 && (
              <button className="view-all-comments">
                View all {post.comments.length} comments
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;