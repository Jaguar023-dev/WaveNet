import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Image, Video, Smile, MapPin, Feeling } from '../../utils/icons';
import EmojiPicker from 'emoji-picker-react';
import PostPrivacySelect from './PostPrivacySelect';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [privacy, setPrivacy] = useState('friends');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useSelector(state => state.auth);

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video'
    }));
    setMedia([...media, ...newMedia]);
  };

  const handleEmojiClick = (emojiData) => {
    setContent(prev => prev + emojiData.emoji);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) return;

    setIsPosting(true);
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('privacy', privacy);
      
      media.forEach((item, index) => {
        formData.append(`media`, item.file);
      });

      // TODO: API call to create post
      // const response = await api.post('/posts', formData);
      
      // Reset form
      setContent('');
      setMedia([]);
      setPrivacy('friends');
      
      // Notify parent component
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const removeMedia = (index) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <img
          src={user?.profilePicture || '/default-avatar.png'}
          alt={user?.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold">{user?.username}</h3>
          <PostPrivacySelect value={privacy} onChange={setPrivacy} />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind, ${user?.username}?`}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
          rows="3"
        />

        {/* Media Preview */}
        {media.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            {media.map((item, index) => (
              <div key={index} className="relative group">
                {item.type === 'image' ? (
                  <img
                    src={item.preview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={item.preview}
                    className="w-full h-48 object-cover rounded-lg"
                    controls
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Post Actions */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100"
              >
                <Image className="w-5 h-5" />
                <span>Photo/Video</span>
              </button>
              
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="flex items-center space-x-2 text-gray-600 hover:text-yellow-600 p-2 rounded-lg hover:bg-gray-100"
              >
                <Smile className="w-5 h-5" />
                <span>Feeling</span>
              </button>
              
              <button
                type="button"
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 p-2 rounded-lg hover:bg-gray-100"
              >
                <MapPin className="w-5 h-5" />
                <span>Location</span>
              </button>
            </div>
            
            <button
              type="submit"
              disabled={isPosting || (!content.trim() && media.length === 0)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPosting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleMediaUpload}
          className="hidden"
        />

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute z-10 mt-2">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </form>
    </div>
  );
};

export default CreatePost;