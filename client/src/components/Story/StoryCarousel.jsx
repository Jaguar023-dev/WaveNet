import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'react-feather';
import './StoryCarousel.css';

const StoryCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const stories = [
    { id: 1, user: 'You', hasStory: false, isAdd: true },
    { id: 2, user: 'Alex', hasStory: true, seen: false },
    { id: 3, user: 'Sam', hasStory: true, seen: true },
    { id: 4, user: 'Taylor', hasStory: true, seen: false },
    { id: 5, user: 'Chris', hasStory: true, seen: true },
    { id: 6, user: 'Emma', hasStory: true, seen: false },
    { id: 7, user: 'John', hasStory: true, seen: true },
    { id: 8, user: 'Jane', hasStory: true, seen: false },
  ];

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(stories.length - 4, prev + 1));
  };

  const visibleStories = stories.slice(currentIndex, currentIndex + 4);

  return (
    <div className="story-carousel">
      {currentIndex > 0 && (
        <button className="carousel-btn prev" onClick={handlePrev}>
          <ChevronLeft size={24} />
        </button>
      )}

      <div className="stories-container">
        {visibleStories.map(story => (
          <div key={story.id} className={`story-item ${story.isAdd ? 'add-story' : ''} ${story.seen ? 'seen' : 'unseen'}`}>
            <div className="story-avatar">
              {story.isAdd ? (
                <div className="add-story-icon">
                  <Plus size={24} />
                </div>
              ) : (
                <div className="story-gradient"></div>
              )}
            </div>
            <span className="story-user">{story.user}</span>
            {story.isAdd && <span className="add-text">Create Story</span>}
          </div>
        ))}
      </div>

      {currentIndex < stories.length - 4 && (
        <button className="carousel-btn next" onClick={handleNext}>
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
};

export default StoryCarousel;