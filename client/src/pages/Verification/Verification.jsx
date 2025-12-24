// client/src/pages/Verification/Verification.jsx
import React, { useState } from 'react';
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
  
  const [formData, setFormData] = useState({
    category: '',
    justification: '',
    website: '',
    followersCount: '',
    documents: []
  });
  
  const [documentFile, setDocumentFile] = useState(null);

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

    setIsSubmitting(true);
    
    try {
      // Upload document if provided
      let documentUrl = '';
      if (documentFile) {
        const formDataFile = new FormData();
        formDataFile.append('document', documentFile);
        
        const uploadRes = await api.post('/upload/verification', formDataFile, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        documentUrl = uploadRes.data.url;
      }

      // Submit verification request
      const requestData = {
        ...formData,
        supportingDocuments: documentUrl ? [{ documentType: 'identity', url: documentUrl }] : []
      };

      await api.post('/verification/request', requestData);
      
      toast.success('Verification request submitted successfully! Our team will review it within 7-10 business days.');
      navigate('/profile/' + user._id);
      
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
            
            {user.verification?.verificationRequest?.status === 'pending' && (
              <div className="pending-notice">
                <h3>⏳ Verification Request Pending</h3>
                <p>Your verification request is under review. We'll notify you once a decision has been made.</p>
                <p><strong>Submitted:</strong> {new Date(user.verification.verificationRequest.submittedAt).toLocaleDateString()}</p>
              </div>
            )}

            {user.verification?.verificationRequest?.status === 'approved' && (
              <div className="approved-notice">
                <h3>🎉 Congratulations! You're Verified</h3>
                <p>Your account has been verified. The blue badge will now appear next to your name.</p>
                <p><strong>Verified since:</strong> {new Date(user.verification.verifiedSince).toLocaleDateString()}</p>
              </div>
            )}

            {user.verification?.verificationRequest?.status === 'rejected' && (
              <div className="rejected-notice">
                <h3>❌ Verification Request Denied</h3>
                <p>Your request for verification was not approved at this time.</p>
                <p><strong>Reason:</strong> {user.verification.verificationRequest.rejectionReason}</p>
                <p>You may reapply after 90 days.</p>
              </div>
            )}

            {user.verification?.verificationRequest?.status !== 'pending' && 
             user.verification?.verificationRequest?.status !== 'approved' && (
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
                    disabled={isSubmitting}
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