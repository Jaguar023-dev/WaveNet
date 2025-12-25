import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Heart, 
  MessageCircle, 
  Share2, 
  Send,
  MoreVertical,
  Eye,
  Clock,
  Camera,
  Video,
  Upload,
  Smile
} from 'react-feather';
import './StoryCarousel.css';

const StoryCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [storyProgress, setStoryProgress] = useState(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const fileInputRef = useRef(null);

  // Load stories from localStorage on component mount
  useEffect(() => {
    loadStoriesFromStorage();
    
    // Check for expired stories every minute
    const interval = setInterval(checkExpiredStories, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Update story progress when viewing
  useEffect(() => {
    let progressInterval;
    
    if (showStoryViewer && selectedStory) {
      progressInterval = setInterval(() => {
        setStoryProgress(prev => {
          if (prev >= 100) {
            handleNextStory();
            return 0;
          }
          return prev + (100 / 7); // 7 seconds per story
        });
      }, 1000);
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [showStoryViewer, selectedStory]);

  const loadStoriesFromStorage = () => {
    try {
      const savedStories = localStorage.getItem('wavenet-stories');
      if (savedStories) {
        const parsedStories = JSON.parse(savedStories);
        
        // Filter out expired stories
        const currentTime = Date.now();
        const validStories = parsedStories.filter(story => 
          story.expiresAt > currentTime
        );
        
        setStories(validStories);
        
        // Save filtered stories back
        if (validStories.length !== parsedStories.length) {
          localStorage.setItem('wavenet-stories', JSON.stringify(validStories));
        }
      }
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  };

  const checkExpiredStories = () => {
    const currentTime = Date.now();
    const validStories = stories.filter(story => story.expiresAt > currentTime);
    
    if (validStories.length !== stories.length) {
      setStories(validStories);
      localStorage.setItem('wavenet-stories', JSON.stringify(validStories));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      alert('Please select an image (JPEG, PNG, GIF) or video (MP4, WebM) file.');
      return;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size should be less than 50MB.');
      return;
    }

    setUploadFile(file);
    const previewUrl = URL.createObjectURL(file);
    setUploadPreview(previewUrl);
  };

  const handleUploadStory = () => {
    if (!uploadFile) {
      alert('Please select a photo or video to upload.');
      return;
    }

    const newStory = {
      id: Date.now(),
      type: uploadFile.type.startsWith('video/') ? 'video' : 'image',
      url: uploadPreview,
      user: {
        id: 'current-user',
        name: 'You',
        avatar: '/default-avatar.png'
      },
      caption: uploadCaption,
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
      reactions: [],
      replies: [],
      views: [],
      viewers: []
    };

    // Add to stories array
    const updatedStories = [newStory, ...stories];
    setStories(updatedStories);
    
    // Save to localStorage
    try {
      localStorage.setItem('wavenet-stories', JSON.stringify(updatedStories));
    } catch (error) {
      console.error('Error saving story:', error);
    }

    // Clean up
    URL.revokeObjectURL(uploadPreview);
    setUploadFile(null);
    setUploadPreview(null);
    setUploadCaption('');
    setShowUploadModal(false);
  };

  const handleViewStory = (story) => {
    if (story.user.id === 'current-user') {
      // View own story - show viewers
      openStoryViewer(story, true);
    } else {
      // View friend's story
      openStoryViewer(story, false);
      
      // Add viewer
      const updatedStories = stories.map(s => {
        if (s.id === story.id && !s.viewers.includes('current-user')) {
          return {
            ...s,
            viewers: [...s.viewers, 'current-user'],
            views: [...s.views, {
              userId: 'current-user',
              timestamp: Date.now(),
              username: 'You'
            }]
          };
        }
        return s;
      });
      
      setStories(updatedStories);
      localStorage.setItem('wavenet-stories', JSON.stringify(updatedStories));
    }
  };

  const openStoryViewer = (story, isOwnStory = false) => {
    setSelectedStory({ ...story, isOwnStory });
    setShowStoryViewer(true);
    setStoryProgress(0);
    setActiveStoryIndex(0);
  };

  const handleCloseStoryViewer = () => {
    setShowStoryViewer(false);
    setSelectedStory(null);
    setStoryProgress(0);
  };

  const handleNextStory = () => {
    const currentIdx = stories.findIndex(s => s.id === selectedStory?.id);
    if (currentIdx < stories.length - 1) {
      const nextStory = stories[currentIdx + 1];
      openStoryViewer(nextStory, nextStory.user.id === 'current-user');
    } else {
      handleCloseStoryViewer();
    }
  };

  const handlePrevStory = () => {
    const currentIdx = stories.findIndex(s => s.id === selectedStory?.id);
    if (currentIdx > 0) {
      const prevStory = stories[currentIdx - 1];
      openStoryViewer(prevStory, prevStory.user.id === 'current-user');
    }
  };

  const handleAddReaction = (reaction) => {
    if (!selectedStory) return;

    const updatedStories = stories.map(story => {
      if (story.id === selectedStory.id) {
        const existingReaction = story.reactions.find(r => r.userId === 'current-user');
        
        if (existingReaction) {
          // Update existing reaction
          return {
            ...story,
            reactions: story.reactions.map(r => 
              r.userId === 'current-user' 
                ? { ...r, type: reaction, timestamp: Date.now() }
                : r
            )
          };
        } else {
          // Add new reaction
          return {
            ...story,
            reactions: [
              ...story.reactions,
              { userId: 'current-user', type: reaction, timestamp: Date.now(), username: 'You' }
            ]
          };
        }
      }
      return story;
    });

    setStories(updatedStories);
    localStorage.setItem('wavenet-stories', JSON.stringify(updatedStories));
    
    // Update selected story
    setSelectedStory(prev => ({
      ...prev,
      reactions: updatedStories.find(s => s.id === selectedStory.id).reactions
    }));
  };

  const handleSendReply = (message) => {
    if (!selectedStory || !message.trim()) return;

    const newReply = {
      id: Date.now(),
      userId: 'current-user',
      username: 'You',
      message: message.trim(),
      timestamp: Date.now(),
      avatar: '/default-avatar.png'
    };

    const updatedStories = stories.map(story => {
      if (story.id === selectedStory.id) {
        return {
          ...story,
          replies: [...story.replies, newReply]
        };
      }
      return story;
    });

    setStories(updatedStories);
    localStorage.setItem('wavenet-stories', JSON.stringify(updatedStories));
    
    // Update selected story
    setSelectedStory(prev => ({
      ...prev,
      replies: [...prev.replies, newReply]
    }));
  };

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(stories.length - 4, prev + 1));
  };

  const visibleStories = [
    // Always show "Create Story" first
    { id: 'create', isAdd: true, user: 'Create Story' },
    // Then show actual stories
    ...stories.slice(currentIndex, currentIndex + 3)
  ];

  // Sample reactions emojis
  const reactions = ['❤️', '😍', '😂', '😮', '😢', '👏'];

  return (
    <>
      <div className="story-carousel">
        {currentIndex > 0 && stories.length > 4 && (
          <button className="carousel-btn prev" onClick={handlePrev}>
            <ChevronLeft size={24} />
          </button>
        )}

        <div className="stories-container">
          {visibleStories.map((story, index) => (
            <div 
              key={story.id} 
              className={`story-item ${story.isAdd ? 'add-story' : story.seen ? 'seen' : 'unseen'}`}
              onClick={() => {
                if (story.isAdd) {
                  setShowUploadModal(true);
                } else {
                  handleViewStory(story);
                }
              }}
            >
              <div className="story-avatar">
                {story.isAdd ? (
                  <div className="add-story-icon">
                    <Plus size={24} />
                  </div>
                ) : (
                  <>
                    <div className={`story-gradient ${story.viewers?.includes('current-user') ? 'seen' : 'unseen'}`}></div>
                    <img 
                      src={story.user.avatar} 
                      alt={story.user.name}
                      className="story-avatar-img"
                    />
                  </>
                )}
              </div>
              <span className="story-user">
                {story.isAdd ? 'Create Story' : story.user.name}
              </span>
              {story.isAdd && <span className="add-text">Add to story</span>}
            </div>
          ))}
        </div>

        {currentIndex < stories.length - 4 && stories.length > 4 && (
          <button className="carousel-btn next" onClick={handleNext}>
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Story Upload Modal */}
      {showUploadModal && (
        <div className="story-upload-modal">
          <div className="upload-modal-content">
            <div className="upload-modal-header">
              <h3>Create New Story</h3>
              <button className="close-btn" onClick={() => setShowUploadModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="upload-options">
              <div className="upload-option" onClick={() => fileInputRef.current?.click()}>
                <Camera size={32} />
                <span>Upload Photo/Video</span>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>

            {uploadPreview && (
              <div className="upload-preview">
                <div className="preview-header">
                  <h4>Preview</h4>
                  <button className="remove-preview" onClick={() => {
                    URL.revokeObjectURL(uploadPreview);
                    setUploadPreview(null);
                    setUploadFile(null);
                  }}>
                    <X size={20} />
                  </button>
                </div>
                
                {uploadFile?.type.startsWith('video/') ? (
                  <video src={uploadPreview} controls className="preview-media" />
                ) : (
                  <img src={uploadPreview} alt="Preview" className="preview-media" />
                )}
                
                <div className="caption-section">
                  <textarea
                    placeholder="Add a caption..."
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    maxLength={200}
                    className="caption-input"
                  />
                  <div className="caption-counter">
                    {uploadCaption.length}/200
                  </div>
                </div>
                
                <button className="post-story-btn" onClick={handleUploadStory}>
                  <Upload size={20} />
                  Post Story
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      {showStoryViewer && selectedStory && (
        <div className="story-viewer-modal">
          <div className="story-viewer-content">
            {/* Progress Bar */}
            <div className="story-progress">
              <div 
                className="story-progress-bar" 
                style={{ width: `${storyProgress}%` }}
              ></div>
            </div>

            {/* Header */}
            <div className="story-header">
              <div className="story-user-info">
                <img 
                  src={selectedStory.user.avatar} 
                  alt={selectedStory.user.name}
                  className="story-viewer-avatar"
                />
                <div>
                  <h4>{selectedStory.user.name}</h4>
                  <span className="story-time">
                    <Clock size={12} />
                    {Math.round((selectedStory.expiresAt - Date.now()) / (60 * 60 * 1000))}h
                  </span>
                </div>
              </div>
              
              <div className="story-header-actions">
                {selectedStory.isOwnStory && (
                  <button className="viewers-btn" title="View who saw your story">
                    <Eye size={20} />
                    <span>{selectedStory.viewers?.length || 0}</span>
                  </button>
                )}
                <button className="close-story-btn" onClick={handleCloseStoryViewer}>
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Story Media */}
            <div className="story-media-container">
              {selectedStory.type === 'video' ? (
                <video 
                  src={selectedStory.url} 
                  controls 
                  autoPlay 
                  className="story-media"
                />
              ) : (
                <img 
                  src={selectedStory.url} 
                  alt="Story" 
                  className="story-media"
                />
              )}
              
              {/* Navigation Arrows */}
              <button className="story-nav prev-story" onClick={handlePrevStory}>
                <ChevronLeft size={32} />
              </button>
              <button className="story-nav next-story" onClick={handleNextStory}>
                <ChevronRight size={32} />
              </button>
            </div>

            {/* Caption */}
            {selectedStory.caption && (
              <div className="story-caption">
                <p>{selectedStory.caption}</p>
              </div>
            )}

            {/* Reactions */}
            <div className="story-reactions">
              <div className="reaction-stats">
                {selectedStory.reactions?.length > 0 && (
                  <div className="reaction-count">
                    {selectedStory.reactions.slice(0, 3).map((reaction, idx) => (
                      <span key={idx} className="reaction-emoji">
                        {reaction.type}
                      </span>
                    ))}
                    <span>{selectedStory.reactions.length}</span>
                  </div>
                )}
              </div>
              
              <div className="reaction-actions">
                <div className="quick-reactions">
                  {reactions.map((reaction, index) => (
                    <button
                      key={index}
                      className="reaction-btn"
                      onClick={() => handleAddReaction(reaction)}
                    >
                      {reaction}
                    </button>
                  ))}
                </div>
                
                <button className="reply-action" onClick={() => {
                  const message = prompt('Send a message reply:');
                  if (message) handleSendReply(message);
                }}>
                  <MessageCircle size={24} />
                  Reply
                </button>
                
                <button className="share-action">
                  <Share2 size={24} />
                  Share
                </button>
              </div>
            </div>

            {/* Viewers List (only for own stories) */}
            {selectedStory.isOwnStory && selectedStory.views?.length > 0 && (
              <div className="story-viewers">
                <h4>Viewers ({selectedStory.views.length})</h4>
                <div className="viewers-list">
                  {selectedStory.views.map((view, index) => (
                    <div key={index} className="viewer-item">
                      <img src="/default-avatar.png" alt={view.username} />
                      <span>{view.username}</span>
                      <span className="view-time">
                        {new Date(view.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default StoryCarousel;