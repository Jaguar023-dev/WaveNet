import React from 'react';
import { CheckCircle } from 'react-feather';
import './VerifiedBadge.css';

const VerifiedBadge = ({ size = 'medium', tooltip = true, showText = false }) => {
  const sizes = {
    small: { icon: 14, className: 'badge-small' },
    medium: { icon: 18, className: 'badge-medium' },
    large: { icon: 22, className: 'badge-large' }
  };

  const { icon, className } = sizes[size] || sizes.medium;

  return (
    <span 
      className={`verified-badge ${className}`}
      title={tooltip ? "Verified Account" : undefined}
    >
      <CheckCircle size={icon} />
      {showText && <span className="badge-text">Verified</span>}
    </span>
  );
};

export default VerifiedBadge;