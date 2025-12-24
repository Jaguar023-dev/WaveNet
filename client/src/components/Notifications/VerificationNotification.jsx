// client/src/components/Notifications/VerificationNotification.jsx
import React from 'react';
import { CheckCircle, XCircle } from 'react-feather';

const VerificationNotification = ({ type, data, onClose }) => {
  if (type === 'verification_approved') {
    return (
      <div className="notification verification-approved">
        <CheckCircle size={24} />
        <div>
          <h4>Account Verified!</h4>
          <p>Your account is now verified. The blue badge will appear next to your name.</p>
          <small>Verified on {new Date(data.verifiedSince).toLocaleDateString()}</small>
        </div>
        <button onClick={onClose}>×</button>
      </div>
    );
  }
  
  if (type === 'verification_rejected') {
    return (
      <div className="notification verification-rejected">
        <XCircle size={24} />
        <div>
          <h4>Verification Denied</h4>
          <p>Your verification request was not approved.</p>
          <small>Reason: {data.rejectionReason}</small>
          <p>You can reapply after 90 days.</p>
        </div>
        <button onClick={onClose}>×</button>
      </div>
    );
  }
  
  return null;
};

export default VerificationNotification;