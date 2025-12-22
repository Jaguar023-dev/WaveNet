import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fullScreen = false, size = 'medium', text = 'Loading...' }) => {
  const sizeClass = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  }[size];

  if (fullScreen) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className={`spinner ${sizeClass}`}></div>
          {text && <p className="loading-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loading-inline">
      <div className={`spinner ${sizeClass}`}></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;