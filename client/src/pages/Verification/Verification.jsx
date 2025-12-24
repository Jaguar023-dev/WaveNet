// client/src/pages/Verification/Verification.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVerification } from '../../hooks/useVerification';
import { 
  CheckCircle, 
  Shield, 
  FileText, 
  Globe, 
  Users, 
  Award, 
  Upload,
  X,
  AlertCircle,
  Calendar,
  Mail,
  Lock
} from 'react-feather';
import './Verification.css';

const Verification = () => {
  const navigate = useNavigate();
  const {
    isVerified,
    verificationStatus,
    verificationLoading,
    verificationError,
    submitVerification,
    canRequestVerification
  } = useVerification();
  
  const [formData, setFormData] = useState({
    category: '',
    justification: '',
    website: '',
    followersCount: '',
    document: null
  });
  
  const [documentPreview, setDocumentPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.justification) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      await submitVerification(formData);
      navigate('/verification/success');
    } catch (error) {
      console.error('Verification submission error:', error);
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, document: file }));
      const previewUrl = URL.createObjectURL(file);
      setDocumentPreview(previewUrl);
    }
  };
  
  // If already verified
  if (isVerified) {
    return (
      <div className="verification-container">
        <div className="verification-success">
          <CheckCircle size={64} color="#4CAF50" />
          <h1>🎉 You're Verified!</h1>
          <p>Your account has been verified with the blue checkmark badge.</p>
          <button onClick={() => navigate('/profile')} className="btn-primary">
            View Your Profile
          </button>
        </div>
      </div>
    );
  }
  
  // If pending review
  if (verificationStatus?.verificationRequest?.status === 'pending') {
    return (
      <div className="verification-container">
        <div className="verification-pending">
          <AlertCircle size={64} color="#FFB300" />
          <h1>⏳ Verification Pending</h1>
          <p>Your verification request is under review.</p>
          <p>We'll notify you once a decision has been made.</p>
          <button onClick={() => navigate('/home')} className="btn-secondary">
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  // If rejected
  if (verificationStatus?.verificationRequest?.status === 'rejected') {
    return (
      <div className="verification-container">
        <div className="verification-rejected">
          <X size={64} color="#F44336" />
          <h1>❌ Verification Denied</h1>
          <p>Your verification request was not approved.</p>
          {verificationStatus.verificationRequest.rejectionReason && (
            <div className="rejection-reason">
              <strong>Reason:</strong> {verificationStatus.verificationRequest.rejectionReason}
            </div>
          )}
          <button onClick={() => navigate('/verification')} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="verification-container">
      {/* Main verification page content would go here */}
      <div className="verification-header">
        <h1><CheckCircle size={32} /> Get Verified on WaveNet</h1>
        <p>The blue verification badge lets people know that your account is authentic.</p>
      </div>
      
      {/* Simple form for now */}
      <div className="verification-form-simple">
        <h2>Verification Application</h2>
        <p>Complete this form to apply for verification.</p>
        
        <div className="form-group">
          <label>Category *</label>
          <select 
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="form-control"
          >
            <option value="">Select a category</option>
            <option value="public_figure">Public Figure</option>
            <option value="brand">Brand/Business</option>
            <option value="organization">Organization</option>
            <option value="journalist">Journalist/Media</option>
            <option value="entertainer">Entertainer</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Justification *</label>
          <textarea 
            value={formData.justification}
            onChange={(e) => setFormData({...formData, justification: e.target.value})}
            placeholder="Explain why you should be verified..."
            className="form-control"
            rows={4}
          />
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={verificationLoading}
          className="btn-submit"
        >
          {verificationLoading ? 'Submitting...' : 'Submit Verification Request'}
        </button>
      </div>
    </div>
  );
};

export default Verification;