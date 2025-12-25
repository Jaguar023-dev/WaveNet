// client/src/components/Post/CreatePost.jsx
import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { 
  Image, Video, Smile, MapPin, Calendar, 
  Globe, Users, Lock, X, ChevronDown,
  Video as VideoIcon, FileText, Poll, 
  Camera, Music, Gift
} from 'react-feather';
import { PostStorage } from '../../utils/PostStorage';
import './CreatePost.css';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState('friends');
  const [media, setMedia] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [feeling, setFeeling] = useState('');
  
  const { user } = useSelector(state => state.auth);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const privacyOptions = [
    { value: 'public', icon: <Globe size={16} />, label: 'Public', desc: 'Anyone on or off Facebook' },
    { value: 'friends', icon: <Users size={16} />, label: 'Friends', desc: 'Your friends on Facebook' },
    { value: 'friends_except', icon: <Users size={16} />, label: 'Friends except...', desc: 'Don\'t show to some friends' },
    { value: 'specific_friends', icon: <Users size={16} />, label: 'Specific friends', desc: 'Only show to some friends' },
    { value: 'only_me', icon: <Lock size={16} />, label: 'Only me', desc: 'Only you can see' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && media.length === 0) return;
    
    setIsLoading(true);
    
    try {
      const postData = {
        user: {
          id: user.id,
          username: user.username,
          profilePicture: user.profilePicture,
          isVerified: user.isVerified
        },
        content: content.trim(),
        privacy,
        media: media.map(m => ({ url: m.preview, type: m.type })),
        hashtags: extractHashtags(content),
        location: location || null,
        feeling: feeling || null
      };
      
      const newPost = PostStorage.savePost(postData);
      
      // Clear form
      setContent('');
      setMedia([]);
      setHashtags([]);
      setLocation('');
      setFeeling('');
      
      // Callback to parent
      if (onPostCreated) {
        onPostCreated(newPost);
      }
      
      // Show success message
      alert('Post created successfully!');
      
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.slice(0, 10 - media.length).map(file => {
      const type = file.type.startsWith('image/') ? 'image' : 
                   file.type.startsWith('video/') ? 'video' : 'file';
      
      return {
        file,
        preview: URL.createObjectURL(file),
        type
      };
    });
    
    setMedia([...media, ...newMedia]);
  };

  const removeMedia = (index) => {
    const newMedia = [...media];
    URL.revokeObjectURL(newMedia[index].preview);
    newMedia.splice(index, 1);
    setMedia(newMedia);
  };

  const extractHashtags = (text) => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  };

  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
  };

  const getPrivacyIcon = (value) => {
    const option = privacyOptions.find(opt => opt.value === value);
    return option ? option.icon : <Globe size={16} />;
  };

  const getPrivacyLabel = (value) => {
    const option = privacyOptions.find(opt => opt.value === value);
    return option ? option.label : 'Public';
  };

  return (
    <div className="create-post-container">
      <div className="create-post-header">
        <h3>Create Post</h3>
        <button className="close-btn">
          <X size={20} />
        </button>
      </div>
      
      <div className="create-post-user">
        <img 
          src={user?.profilePicture || '/default-avatar.png'} 
          alt={user?.username}
          className="user-avatar"
        />
        <div className="user-info">
          <div className="user-name">{user?.username}</div>
          <div className="privacy-selector">
            <button 
              className="privacy-btn"
              onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
            >
              {getPrivacyIcon(privacy)}
              <span>{getPrivacyLabel(privacy)}</span>
              <ChevronDown size={16} />
            </button>
            
            {showPrivacyMenu && (
              <div className="privacy-menu">
                {privacyOptions.map(option => (
                  <button
                    key={option.value}
                    className={`privacy-option ${privacy === option.value ? 'active' : ''}`}
                    onClick={() => {
                      setPrivacy(option.value);
                      setShowPrivacyMenu(false);
                    }}
                  >
                    <div className="privacy-icon">{option.icon}</div>
                    <div className="privacy-info">
                      <div className="privacy-label">{option.label}</div>
                      <div className="privacy-desc">{option.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="post-content-wrapper">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder={`What's on your mind, ${user?.username || 'User'}?`}
            className="post-textarea"
            rows="4"
          />
          
          {/* Media Preview */}
          {media.length > 0 && (
            <div className="media-preview">
              {media.map((item, index) => (
                <div key={index} className="media-preview-item">
                  {item.type === 'image' ? (
                    <img src={item.preview} alt={`Preview ${index + 1}`} />
                  ) : item.type === 'video' ? (
                    <video src={item.preview} controls />
                  ) : (
                    <div className="file-preview">
                      <FileText size={24} />
                      <span>{item.file.name}</span>
                    </div>
                  )}
                  <button 
                    className="remove-media-btn"
                    onClick={() => removeMedia(index)}
                    type="button"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Feeling/Location Tags */}
          {(feeling || location) && (
            <div className="post-tags-preview">
              {feeling && (
                <span className="feeling-tag">Feeling {feeling}</span>
              )}
              {location && (
                <span className="location-tag">At {location}</span>
              )}
            </div>
          )}
        </div>
        
        <div className="post-options">
          <div className="add-to-post">
            <span>Add to your post</span>
            <div className="add-options">
              <button 
                type="button"
                className="add-option"
                onClick={() => fileInputRef.current.click()}
              >
                <Image size={20} />
              </button>
              <button type="button" className="add-option">
                <VideoIcon size={20} />
              </button>
              <button type="button" className="add-option">
                <Smile size={20} />
              </button>
              <button type="button" className="add-option">
                <MapPin size={20} />
              </button>
              <button type="button" className="add-option">
                <Calendar size={20} />
              </button>
              <button type="button" className="add-option">
                <Poll size={20} />
              </button>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleMediaUpload}
            style={{ display: 'none' }}
          />
        </div>
        
        <button 
          type="submit" 
          className="post-submit-btn"
          disabled={isLoading || (!content.trim() && media.length === 0)}
        >
          {isLoading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;