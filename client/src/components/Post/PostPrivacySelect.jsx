// components/Post/PostPrivacySelect.jsx
import React, { useState } from 'react';
import { Globe, Lock, Users, ChevronDown, Check } from 'react-feather';

const PostPrivacySelect = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const privacyOptions = [
    {
      value: 'public',
      label: 'Public',
      description: 'Anyone can see this post',
      icon: <Globe size={18} className="text-blue-500" />
    },
    {
      value: 'friends',
      label: 'Friends',
      description: 'Only your friends can see this post',
      icon: <Users size={18} className="text-green-500" />
    },
    {
      value: 'private',
      label: 'Only Me',
      description: 'Only you can see this post',
      icon: <Lock size={18} className="text-gray-500" />
    }
  ];

  const selectedOption = privacyOptions.find(option => option.value === value) || privacyOptions[0];

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {selectedOption.icon}
        <span>{selectedOption.label}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute z-50 w-64 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="py-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                Who can see your post?
              </div>
              
              {privacyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {option.icon}
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </div>
                  
                  {value === option.value && (
                    <Check size={16} className="text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PostPrivacySelect;