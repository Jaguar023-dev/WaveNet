// client/src/components/Post/CreatePost.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './CreatePost.css';

const CreatePost = ({ onPostCreated, onClose }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [privacy, setPrivacy] = useState('friends');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const { user } = useSelector(state => state.auth);

  // Auto-focus textarea when modal opens
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Place cursor at end
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Re-enable body scroll
      document.body.style.overflow = 'auto';
      
      // Clean up object URLs
      media.forEach(item => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []);

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      name: file.name,
      size: file.size
    }));
    
    setMedia([...media, ...newMedia]);
    
    // Reset file input
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) {
      alert('Please add some text or media to your post.');
      return;
    }

    setIsPosting(true);
    
    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      formData.append('privacy', privacy);
      
      media.forEach((item, index) => {
        formData.append(`media`, item.file);
      });

      console.log('Creating post with:', { 
        content: content.trim(), 
        mediaCount: media.length,
        privacy 
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('✅ Post created successfully');
      
      // Reset form
      setContent('');
      setMedia([]);
      setPrivacy('friends');
      
      // Notify parent
      if (onPostCreated) {
        onPostCreated();
      }
      
      // Close modal
      if (onClose) {
        onClose();
      }
      
    } catch (error) {
      console.error('❌ Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const removeMedia = (index) => {
    if (media[index]?.preview) {
      URL.revokeObjectURL(media[index].preview);
    }
    setMedia(media.filter((_, i) => i !== index));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    // Clean up object URLs
    media.forEach(item => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });
    
    if (onClose) {
      onClose();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="create-post-modal">
      {/* Header */}
      <div className="create-post-header">
        <h3>Create Post</h3>
        <button 
          className="close-btn"
          onClick={handleClose}
          type="button"
          disabled={isPosting}
        >
          <i className="fi fi-rr-cross-small"></i>
        </button>
      </div>

      {/* User Info */}
      <div className="create-post-user">
        <img
          src={user?.profile?.profilePicture?.url || '/default-avatar.png'}
          alt={user?.username}
          className="user-avatar"
        />
        <div className="user-info">
          <h4>{user?.username}</h4>
          <select 
            className="privacy-select"
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
            disabled={isPosting}
          >
            <option value="public">🌐 Public</option>
            <option value="friends">👥 Friends</option>
            <option value="onlyme">🔒 Only me</option>
          </select>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="create-post-form">
        {/* Caption Input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind, ${user?.username}?`}
          className="caption-input"
          rows="4"
          disabled={isPosting}
        />

        {/* Media Preview */}
        {media.length > 0 && (
          <div className="media-preview">
            {media.map((item, index) => (
              <div key={index} className="media-item">
                <div className="media-preview-container">
                  {item.type === 'image' ? (
                    <img 
                      src={item.preview} 
                      alt={`Preview ${index + 1}`} 
                      className="media-image"
                    />
                  ) : (
                    <div className="video-container">
                      <video src={item.preview} className="media-video" />
                      <div className="video-icon">▶️</div>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="remove-media-btn"
                    disabled={isPosting}
                  >
                    <i className="fi fi-rr-cross-small"></i>
                  </button>
                  
                  <div className="media-info">
                    <span className="media-name">{item.name}</span>
                    <span className="media-size">{formatFileSize(item.size)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo Upload Area */}
        <div className="photo-upload-area">
          <div className="upload-box" onClick={handlePhotoClick}>
            <i className="fi fi-sr-add-image upload-icon"></i>
            <span className="upload-text">Add Photos/Videos</span>
            <p className="upload-hint">Click to select from your gallery</p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleMediaUpload}
            className="hidden-file-input"
            disabled={isPosting}
          />
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            type="submit"
            disabled={isPosting || (!content.trim() && media.length === 0)}
            className="post-btn"
          >
            {isPosting ? (
              <>
                <span className="spinner"></span>
                <span>Posting...</span>
              </>
            ) : (
              'Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;