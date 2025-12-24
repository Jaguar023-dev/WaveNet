// client/src/pages/Verification/Verification.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import './Verification.css';
import { CheckCircle, FileText, Globe, Users, Award, Shield } from 'react-feather';

const Verification = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('requirements');
  const [userData, setUserData] = useState(null);
  
  const [formData, setFormData] = useState({
    category: '',
    justification: '',
    website: '',
    followersCount: '',
    documents: []
  });
  
  const [documentFile, setDocumentFile] = useState(null);

  // Fetch user verification status on mount
  useEffect(() => {
    if (user) {
      // Use existing user data from Redux, but ensure verification data is loaded
      setUserData(user);
      
      // Optional: Fetch fresh verification status from API
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    try {
      const response = await api.get('/api/verification/status');
      if (response.data) {
        // Update user data with verification info
        setUserData(prev => ({
          ...prev,
          isVerified: response.data.isVerified,
          verificationType: response.data.verificationType,
          verificationRequest: response.data.verificationRequest,
          verifiedSince: response.data.verifiedSince
        }));
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const verificationCategories = [
    { value: 'celebrity', label: 'Celebrity/Public Figure', icon: '🌟' },
    { value: 'journalist', label: 'Journalist/Media', icon: '📰' },
    { value: 'brand', label: 'Brand/Business', icon: '🏢' },
    { value: 'organization', label: 'Organization', icon: '🏛️' },
    { value: 'government', label: 'Government Official', icon: '⚖️' },
    { value: 'entertainer', label: 'Entertainer', icon: '🎭' },
    { value: 'sports', label: 'Sports Personality', icon: '⚽' },
    { value: 'activist', label: 'Activist/Influencer', icon: '📢' }
  ];

  const requirements = [
    {
      title: 'Authenticity',
      description: 'Your account must represent a real person, registered business or entity.',
      icon: '✅'
    },
    {
      title: 'Uniqueness',
      description: 'Your account must be the unique presence of the person or business.',
      icon: '🔍'
    },
    {
      title: 'Completeness',
      description: 'Your account must be active with a complete profile, profile photo and cover photo.',
      icon: '📝'
    },
    {
      title: 'Notability',
      description: 'Your account must represent a well-known, highly searched for person or brand.',
      icon: '⭐'
    }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setDocumentFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.justification) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.justification.length < 200) {
      toast.error('Justification must be at least 200 characters');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('category', formData.category);
      formDataToSend.append('justification', formData.justification);
      formDataToSend.append('website', formData.website);
      formDataToSend.append('followersCount', formData.followersCount);
      
      // Upload document if provided
      if (documentFile) {
        formDataToSend.append('document', documentFile);
      }

      // Submit verification request
      const response = await api.post('/api/verification/request', formDataToSend, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        toast.success('Verification request submitted successfully! Our team will review it within 7-10 business days.');
        
        // Refresh verification status
        await fetchVerificationStatus();
        
        // Switch to requirements tab to show pending status
        setActiveTab('requirements');
      } else {
        toast.error(response.data.message || 'Failed to submit verification request');
      }
      
    } catch (error) {
      console.error('Verification request failed:', error);
      toast.error(error.response?.data?.message || 'Failed to submit verification request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Determine user's verification status
  const isVerified = userData?.isVerified || false;
  const verificationRequestStatus = userData?.verificationRequest?.status || 'not_requested';
  const isPending = verificationRequestStatus === 'pending';
  const isRejected = verificationRequestStatus === 'rejected';

  return (
    <div className="verification-container">
      <div className="verification-header">
        <h1><CheckCircle size={32} /> Get Verified on WaveNet</h1>
        <p className="verification-subtitle">
          The blue verification badge lets people know that your account is authentic.
        </p>
      </div>

      <div className="verification-tabs">
        <button 
          className={`tab-btn ${activeTab === 'requirements' ? 'active' : ''}`}
          onClick={() => setActiveTab('requirements')}
        >
          <Shield size={20} /> Requirements
        </button>
        <button 
          className={`tab-btn ${activeTab === 'badge' ? 'active' : ''}`}
          onClick={() => setActiveTab('badge')}
        >
          <Award size={20} /> About the Badge
        </button>
        <button 
          className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          <FileText size={20} /> Apply Now
        </button>
      </div>

      <div className="verification-content">
        {activeTab === 'requirements' && (
          <div className="requirements-section">
            <h2>Verification Requirements</h2>
            <p className="section-description">
              To be eligible for a blue verification badge, your account must meet the following criteria:
            </p>
            
            <div className="requirements-grid">
              {requirements.map((req, index) => (
                <div key={index} className="requirement-card">
                  <div className="requirement-icon">{req.icon}</div>
                  <h3>{req.title}</h3>
                  <p>{req.description}</p>
                </div>
              ))}
            </div>

            <div className="additional-requirements">
              <h3>📋 Additional Requirements:</h3>
              <ul>
                <li>Account must be at least 30 days old</li>
                <li>Must have a profile photo and cover photo</li>
                <li>Must have at least 500 followers</li>
                <li>Account must be active (posted in the last 30 days)</li>
                <li>No violations of our Community Standards</li>
              </ul>
            </div>

            {/* Show status if pending or verified */}
            {isPending && (
              <div className="status-notice pending">
                <h3>⏳ Your Verification Request is Pending</h3>
                <p>We're reviewing your application. You'll be notified when a decision is made.</p>
                <p><strong>Submitted:</strong> {userData?.verificationRequest?.submittedAt ? 
                  new Date(userData.verificationRequest.submittedAt).toLocaleDateString() : 'Recently'}</p>
              </div>
            )}

            {isVerified && (
              <div className="status-notice verified">
                <h3>✅ You're Verified!</h3>
                <p>Your account has the blue verification badge.</p>
                <p><strong>Category:</strong> {userData?.verificationType || 'Public Figure'}</p>
                {userData?.verifiedSince && (
                  <p><strong>Verified since:</strong> {new Date(userData.verifiedSince).toLocaleDateString()}</p>
                )}
              </div>
            )}

            {isRejected && (
              <div className="status-notice rejected">
                <h3>❌ Verification Request Denied</h3>
                <p>Your application was not approved. You can reapply after 90 days.</p>
                {userData?.verificationRequest?.rejectionReason && (
                  <p><strong>Reason:</strong> {userData.verificationRequest.rejectionReason}</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'badge' && (
          <div className="badge-section">
            <h2>About the Blue Verification Badge</h2>
            
            <div className="badge-preview">
              <div className="verified-profile-sample">
                <div className="sample-header">
                  <img 
                    src={user.profile?.profilePicture?.url || '/default-avatar.png'} 
                    alt="Sample" 
                    className="sample-avatar"
                  />
                  <div className="sample-info">
                    <h3>
                      {user.username}
                      <span className="verified-badge-sample">
                        <CheckCircle size={18} /> Verified
                      </span>
                    </h3>
                    <p className="sample-bio">Official verified account</p>
                  </div>
                </div>
                <div className="sample-post">
                  <div className="post-header">
                    <img 
                      src={user.profile?.profilePicture?.url || '/default-avatar.png'} 
                      alt="User" 
                      className="post-avatar"
                    />
                    <div>
                      <strong>
                        {user.username}
                        <span className="verified-badge-small">
                          <CheckCircle size={14} />
                        </span>
                      </strong>
                      <p className="post-time">Just now</p>
                    </div>
                  </div>
                  <p className="post-content">
                    "This is how your verified badge will appear next to your name on posts and comments."
                  </p>
                </div>
              </div>
            </div>

            <div className="badge-benefits">
              <h3>✅ Benefits of Being Verified:</h3>
              <ul>
                <li>Increased credibility and trust</li>
                <li>Easier for followers to find the real you</li>
                <li>Priority in search results</li>
                <li>Access to exclusive features</li>
                <li>Protection against impersonation</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'form' && (
          <div className="form-section">
            <h2>Request Verification</h2>
            
            {/* Show status messages */}
            {isPending && (
              <div className="pending-notice">
                <h3>⏳ Verification Request Pending</h3>
                <p>Your verification request is under review. We'll notify you once a decision has been made.</p>
                <p><strong>Submitted:</strong> {userData?.verificationRequest?.submittedAt ? 
                  new Date(userData.verificationRequest.submittedAt).toLocaleDateString() : 'Recently'}</p>
                <button 
                  className="back-to-requirements"
                  onClick={() => setActiveTab('requirements')}
                >
                  View Requirements
                </button>
              </div>
            )}

            {isVerified && (
              <div className="approved-notice">
                <h3>🎉 Congratulations! You're Verified</h3>
                <p>Your account has been verified. The blue badge will now appear next to your name.</p>
                <p><strong>Verified since:</strong> {userData?.verifiedSince ? 
                  new Date(userData.verifiedSince).toLocaleDateString() : 'Recently'}</p>
                <button 
                  className="back-to-requirements"
                  onClick={() => setActiveTab('requirements')}
                >
                  View Your Status
                </button>
              </div>
            )}

            {isRejected && (
              <div className="rejected-notice">
                <h3>❌ Verification Request Denied</h3>
                <p>Your request for verification was not approved at this time.</p>
                {userData?.verificationRequest?.rejectionReason && (
                  <p><strong>Reason:</strong> {userData.verificationRequest.rejectionReason}</p>
                )}
                <p>You may reapply after 90 days.</p>
                <button 
                  className="back-to-requirements"
                  onClick={() => setActiveTab('requirements')}
                >
                  View Requirements
                </button>
              </div>
            )}

            {/* Only show form if not verified, not pending, and not recently rejected */}
            {!isVerified && !isPending && !isRejected && (
              <form onSubmit={handleSubmit} className="verification-form">
                <div className="form-group">
                  <label>Category *</label>
                  <select 
                    name="category" 
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select a category</option>
                    {verificationCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <Globe size={16} /> Website or Social Media Links
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Users size={16} /> Approximate Followers/Subscribers
                  </label>
                  <input
                    type="number"
                    name="followersCount"
                    value={formData.followersCount}
                    onChange={handleInputChange}
                    placeholder="e.g., 10000"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Justification for Verification *
                    <span className="hint">Explain why you should be verified (min. 200 characters)</span>
                  </label>
                  <textarea
                    name="justification"
                    value={formData.justification}
                    onChange={handleInputChange}
                    placeholder="Explain your notability, achievements, press coverage, or other reasons for verification..."
                    rows={6}
                    minLength={200}
                    required
                    className="form-textarea"
                  />
                  <div className="char-count">
                    {formData.justification.length}/200 characters
                    {formData.justification.length < 200 && (
                      <span className="char-warning"> (need {200 - formData.justification.length} more)</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Supporting Document (Optional)
                    <span className="hint">Upload government ID, article about you, or official documents (PDF, JPG, PNG up to 5MB)</span>
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="file-input"
                  />
                  {documentFile && (
                    <div className="file-preview">
                      Selected: {documentFile.name} ({(documentFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>

                <div className="form-footer">
                  <p className="disclaimer">
                    ⚠️ By submitting this request, you confirm that all information provided is accurate. 
                    False information may result in permanent ban from WaveNet.
                  </p>
                  
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isSubmitting || formData.justification.length < 200}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Verification Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Verification;