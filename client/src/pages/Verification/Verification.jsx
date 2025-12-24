// client/src/pages/Verification/Verification.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './Verification.css';

const Verification = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verificationData, setVerificationData] = useState(null);
  const [activeTab, setActiveTab] = useState('requirements');
  
  console.log('🔵 Verification component loaded');
  console.log('User:', user);
  console.log('User ID:', user?._id);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        console.log('📡 Fetching verification status...');
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No token found in localStorage');
          navigate('/login');
          return;
        }

        // Use absolute URL for production
        const apiUrl = window.location.hostname.includes('render.com') 
          ? 'https://wavenet-wlnf.onrender.com/api/verification/status'
          : 'http://localhost:5000/api/verification/status';

        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Verification data:', data);
          setVerificationData(data);
        } else {
          console.warn('Failed to fetch verification status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching verification:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchVerificationStatus();
    } else {
      console.log('No user in Redux, redirecting to login');
      navigate('/login');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="verification-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #1877f2',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>Loading verification status...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  const isVerified = verificationData?.isVerified || false;
  const isPending = verificationData?.verificationRequest?.status === 'pending';
  const isRejected = verificationData?.verificationRequest?.status === 'rejected';

  return (
    <div className="verification-container">
      <div className="verification-header">
        <h1>🔵 Get Verified on WaveNet</h1>
        <p className="verification-subtitle">
          The blue verification badge lets people know that your account is authentic.
        </p>
      </div>

      <div className="verification-tabs">
        <button 
          className={`tab-btn ${activeTab === 'requirements' ? 'active' : ''}`}
          onClick={() => setActiveTab('requirements')}
        >
          📋 Requirements
        </button>
        <button 
          className={`tab-btn ${activeTab === 'badge' ? 'active' : ''}`}
          onClick={() => setActiveTab('badge')}
        >
          🏅 About the Badge
        </button>
        <button 
          className={`tab-btn ${activeTab === 'apply' ? 'active' : ''}`}
          onClick={() => setActiveTab('apply')}
        >
          📝 Apply Now
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
              <div className="requirement-card">
                <div className="requirement-icon">✅</div>
                <h3>Authenticity</h3>
                <p>Your account must represent a real person, registered business or entity.</p>
              </div>
              
              <div className="requirement-card">
                <div className="requirement-icon">🔍</div>
                <h3>Uniqueness</h3>
                <p>Your account must be the unique presence of the person or business.</p>
              </div>
              
              <div className="requirement-card">
                <div className="requirement-icon">📝</div>
                <h3>Completeness</h3>
                <p>Your account must have a complete profile, profile photo and cover photo.</p>
              </div>
              
              <div className="requirement-card">
                <div className="requirement-icon">⭐</div>
                <h3>Notability</h3>
                <p>Your account must represent a well-known, highly searched for person or brand.</p>
              </div>
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

            {/* Show current status */}
            <div className="status-notice">
              {isVerified ? (
                <div className="approved-notice">
                  <h3>✅ You're Already Verified!</h3>
                  <p>Your account has the blue verification badge.</p>
                  {verificationData?.verifiedSince && (
                    <p><strong>Verified since:</strong> {new Date(verificationData.verifiedSince).toLocaleDateString()}</p>
                  )}
                </div>
              ) : isPending ? (
                <div className="pending-notice">
                  <h3>⏳ Verification Request Pending</h3>
                  <p>Your verification request is under review. We'll notify you once a decision has been made.</p>
                </div>
              ) : isRejected ? (
                <div className="rejected-notice">
                  <h3>❌ Previous Request Denied</h3>
                  <p>Your verification request was not approved. You may reapply after 90 days.</p>
                </div>
              ) : (
                <div className="not-verified">
                  <h3>Ready to Apply?</h3>
                  <p>Check if you meet the requirements above, then apply for verification.</p>
                  <button 
                    className="apply-btn"
                    onClick={() => setActiveTab('apply')}
                  >
                    Apply Now
                  </button>
                </div>
              )}
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
                    src={user?.profile?.profilePicture?.url || '/default-avatar.png'} 
                    alt="Sample" 
                    className="sample-avatar"
                  />
                  <div className="sample-info">
                    <h3>
                      {user?.username || 'YourUsername'}
                      <span className="verified-badge-sample">
                        🔵 Verified
                      </span>
                    </h3>
                    <p className="sample-bio">Official verified account</p>
                  </div>
                </div>
                <div className="sample-post">
                  <div className="post-header">
                    <img 
                      src={user?.profile?.profilePicture?.url || '/default-avatar.png'} 
                      alt="User" 
                      className="post-avatar"
                    />
                    <div>
                      <strong>
                        {user?.username || 'YourUsername'}
                        <span className="verified-badge-small">🔵</span>
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

        {activeTab === 'apply' && (
          <div className="form-section">
            <h2>Apply for Verification</h2>
            
            {isVerified ? (
              <div className="approved-notice">
                <h3>🎉 You're Already Verified!</h3>
                <p>Your account already has the blue verification badge.</p>
                <button 
                  className="back-to-home"
                  onClick={() => navigate('/home')}
                >
                  Return to Home
                </button>
              </div>
            ) : isPending ? (
              <div className="pending-notice">
                <h3>⏳ Application Pending</h3>
                <p>Your verification request is already under review.</p>
                <p>We'll notify you when a decision is made.</p>
                <button 
                  className="back-to-requirements"
                  onClick={() => setActiveTab('requirements')}
                >
                  View Requirements
                </button>
              </div>
            ) : (
              <div className="apply-form">
                <p>To apply for verification, you'll need to:</p>
                <ol>
                  <li>Ensure your profile is complete</li>
                  <li>Gather supporting documents (ID, articles, etc.)</li>
                  <li>Prepare a justification statement</li>
                  <li>Submit your application</li>
                </ol>
                
                <div className="application-ready">
                  <h3>Ready to submit your application?</h3>
                  <p>The full application form will be available soon!</p>
                  <p><em>Check back in a few days to complete your verification application.</em></p>
                </div>
                
                <div className="form-actions">
                  <button 
                    className="secondary-btn"
                    onClick={() => setActiveTab('requirements')}
                  >
                    Review Requirements
                  </button>
                  <button 
                    className="primary-btn"
                    onClick={() => alert('Full application form coming soon!')}
                  >
                    Start Application
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Verification;