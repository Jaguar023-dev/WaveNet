// client/src/components/Post/CreatePost.jsx
import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';

const CreatePost = ({ onPostCreated, onClose }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useSelector(state => state.auth);

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      name: file.name
    }));
    setMedia([...media, ...newMedia]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) return;

    setIsPosting(true);
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('privacy', 'friends'); // Default privacy
      
      media.forEach((item, index) => {
        formData.append(`media`, item.file);
      });

      // TODO: API call to create post
      console.log('Creating post with:', { content, mediaCount: media.length });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setContent('');
      setMedia([]);
      
      // Notify parent component
      if (onPostCreated) {
        onPostCreated();
      }
      
      // Close modal
      if (onClose) {
        onClose();
      }
      
      alert('Post created successfully!');
      
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const removeMedia = (index) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(media[index].preview);
    setMedia(media.filter((_, i) => i !== index));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    // Clean up object URLs
    media.forEach(item => URL.revokeObjectURL(item.preview));
    if (onClose) {
      onClose();
    }
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
          <select className="privacy-select">
            <option value="public">🌐 Public</option>
            <option value="friends">👥 Friends</option>
            <option value="onlyme">🔒 Only me</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      <form onSubmit={handleSubmit} className="create-post-form">
        {/* Caption Input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind, ${user?.username}?`}
          className="caption-input"
          rows="4"
          autoFocus
        />

        {/* Media Preview */}
        {media.length > 0 && (
          <div className="media-preview">
            {media.map((item, index) => (
              <div key={index} className="media-item">
                {item.type === 'image' ? (
                  <div className="image-preview">
                    <img
                      src={item.preview}
                      alt="Preview"
                      className="preview-image"
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="remove-media-btn"
                    >
                      <i className="fi fi-rr-cross-small"></i>
                    </button>
                    <div className="media-name">{item.name}</div>
                  </div>
                ) : (
                  <div className="video-preview">
                    <video
                      src={item.preview}
                      className="preview-video"
                      controls
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="remove-media-btn"
                    >
                      <i className="fi fi-rr-cross-small"></i>
                    </button>
                    <div className="media-name">{item.name}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Photo Upload Button */}
        <div className="photo-upload-section">
          <button
            type="button"
            onClick={handlePhotoClick}
            className="photo-upload-btn"
          >
            <i className="fi fi-sr-add-image"></i>
            <span>Add Photos/Videos</span>
          </button>
          <p className="upload-hint">Select photos or videos from your gallery</p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleMediaUpload}
          className="hidden-file-input"
        />

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            type="button"
            onClick={handlePhotoClick}
            className="icon-btn photo-btn"
            title="Add photo"
          >
            <i className="fi fi-sr-add-image"></i>
          </button>
          
          <div className="spacer"></div>
          
          <button
            type="submit"
            disabled={isPosting || (!content.trim() && media.length === 0)}
            className="post-btn"
          >
            {isPosting ? (
              <>
                <span className="spinner"></span>
                Posting...
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