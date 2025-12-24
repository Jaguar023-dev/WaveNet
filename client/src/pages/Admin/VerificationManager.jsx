// client/src/pages/Admin/VerificationManager.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, Clock, User, FileText, ExternalLink } from 'react-feather';
import './VerificationManager.css';

const VerificationManager = () => {
  const { user } = useSelector(state => state.auth);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      window.location.href = '/';
      return;
    }
    fetchRequests();
    fetchStats();
  }, [user]);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/verification/requests/pending');
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to fetch verification requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/verification/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const approveRequest = async (userId) => {
    if (!window.confirm('Approve this verification request?')) return;
    
    try {
      await api.post(`/verification/${userId}/approve`);
      toast.success('Verification request approved');
      fetchRequests();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const rejectRequest = async (userId) => {
    if (!rejectionReason || rejectionReason.length < 10) {
      toast.error('Please provide a rejection reason (min 10 characters)');
      return;
    }
    
    if (!window.confirm('Reject this verification request?')) return;
    
    try {
      await api.post(`/verification/${userId}/reject`, { rejectionReason });
      toast.success('Verification request rejected');
      setSelectedRequest(null);
      setRejectionReason('');
      fetchRequests();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const viewProfile = (userId) => {
    window.open(`/profile/${userId}`, '_blank');
  };

  if (loading) {
    return <div className="loading">Loading verification requests...</div>;
  }

  return (
    <div className="verification-manager">
      <div className="manager-header">
        <h1><CheckCircle /> Verification Management</h1>
        <p>Review and manage verification requests</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon pending">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.pendingRequests}</h3>
              <p>Pending Requests</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon approved">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.approvedRequests}</h3>
              <p>Verified Accounts</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon rejected">
              <XCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.rejectedRequests}</h3>
              <p>Rejected Requests</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon total">
              <FileText size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.totalRequests}</h3>
              <p>Total Requests</p>
            </div>
          </div>
        </div>
      )}

      <div className="requests-section">
        <h2>Pending Verification Requests ({requests.length})</h2>
        
        {requests.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} />
            <h3>No pending verification requests</h3>
            <p>All verification requests have been reviewed.</p>
          </div>
        ) : (
          <div className="requests-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Category</th>
                  <th>Submitted</th>
                  <th>Followers</th>
                  <th>Website</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td>
                      <div className="user-cell">
                        <img 
                          src={req.profile?.profilePicture?.url || '/default-avatar.png'} 
                          alt={req.username}
                          className="user-avatar"
                        />
                        <div>
                          <strong>{req.username}</strong>
                          <p className="user-email">{req.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">
                        {req.verification?.verificationRequest?.category || 'N/A'}
                      </span>
                    </td>
                    <td>
                      {new Date(req.verification?.verificationRequest?.submittedAt).toLocaleDateString()}
                    </td>
                    <td>
                      {req.verification?.verificationRequest?.followersCount?.toLocaleString() || '0'}
                    </td>
                    <td>
                      {req.verification?.verificationRequest?.website ? (
                        <a 
                          href={req.verification.verificationRequest.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="website-link"
                        >
                          <ExternalLink size={14} /> Visit
                        </a>
                      ) : 'N/A'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-view"
                          onClick={() => setSelectedRequest(req)}
                        >
                          <FileText size={16} /> Review
                        </button>
                        <button 
                          className="btn-approve"
                          onClick={() => approveRequest(req._id)}
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="review-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Review Verification Request</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedRequest(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="applicant-info">
                <img 
                  src={selectedRequest.profile?.profilePicture?.url || '/default-avatar.png'} 
                  alt={selectedRequest.username}
                  className="applicant-avatar"
                />
                <div>
                  <h3>{selectedRequest.username}</h3>
                  <p>{selectedRequest.email}</p>
                  <p>Joined: {new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="request-details">
                <div className="detail-group">
                  <label>Category:</label>
                  <span className="detail-value">
                    {selectedRequest.verification?.verificationRequest?.category}
                  </span>
                </div>
                
                <div className="detail-group">
                  <label>Followers Claimed:</label>
                  <span className="detail-value">
                    {selectedRequest.verification?.verificationRequest?.followersCount?.toLocaleString() || '0'}
                  </span>
                </div>
                
                {selectedRequest.verification?.verificationRequest?.website && (
                  <div className="detail-group">
                    <label>Website:</label>
                    <a 
                      href={selectedRequest.verification.verificationRequest.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="detail-value link"
                    >
                      {selectedRequest.verification.verificationRequest.website}
                    </a>
                  </div>
                )}
                
                <div className="detail-group full-width">
                  <label>Justification:</label>
                  <div className="justification-box">
                    {selectedRequest.verification?.verificationRequest?.justification}
                  </div>
                </div>
                
                {selectedRequest.verification?.verificationRequest?.supportingDocuments?.length > 0 && (
                  <div className="detail-group">
                    <label>Supporting Documents:</label>
                    <div className="documents-list">
                      {selectedRequest.verification.verificationRequest.supportingDocuments.map((doc, idx) => (
                        <a 
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="document-link"
                        >
                          <FileText size={16} /> Document {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="rejection-section">
                <label>Rejection Reason (if rejecting):</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a clear reason for rejection (minimum 10 characters)..."
                  rows={4}
                  className="rejection-textarea"
                />
                <div className="char-count">{rejectionReason.length}/10 characters</div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => viewProfile(selectedRequest._id)}
                >
                  <User size={16} /> View Profile
                </button>
                <button 
                  className="btn-danger"
                  onClick={() => rejectRequest(selectedRequest._id)}
                  disabled={!rejectionReason || rejectionReason.length < 10}
                >
                  <XCircle size={16} /> Reject
                </button>
                <button 
                  className="btn-success"
                  onClick={() => approveRequest(selectedRequest._id)}
                >
                  <CheckCircle size={16} /> Approve & Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationManager;