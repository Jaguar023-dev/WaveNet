// client/src/hooks/useVerification.js
import { useSelector, useDispatch } from 'react-redux';
import {
  getVerificationStatus,
  submitVerificationRequest,
  checkVerificationStatus,
  getPendingVerificationRequests,
  approveVerificationRequest,
  rejectVerificationRequest,
  getVerificationStats,
  setVerificationStatus,
  clearVerificationStatus,
  clearVerificationError,
  resetVerificationState,
  updateVerificationRequestStatus,
  selectCurrentUser,
  selectVerificationStatus,
  selectIsVerified,
  selectVerificationLoading,
  selectVerificationError,
  selectVerificationSuccess,
  selectRequestSubmitted,
  selectPendingVerificationRequests,
  selectAdminVerificationLoading,
  selectAdminVerificationError,
  selectVerificationStats,
} from '../store/slices/userSlice';

export const useVerification = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const currentUser = useSelector(selectCurrentUser);
  const verificationStatus = useSelector(selectVerificationStatus);
  const isVerified = useSelector(selectIsVerified);
  const verificationLoading = useSelector(selectVerificationLoading);
  const verificationError = useSelector(selectVerificationError);
  const verificationSuccess = useSelector(selectVerificationSuccess);
  const requestSubmitted = useSelector(selectRequestSubmitted);
  const pendingVerificationRequests = useSelector(selectPendingVerificationRequests);
  const adminVerificationLoading = useSelector(selectAdminVerificationLoading);
  const adminVerificationError = useSelector(selectAdminVerificationError);
  const verificationStats = useSelector(selectVerificationStats);

  // Actions
  const fetchVerificationStatus = () => dispatch(getVerificationStatus());
  const submitVerification = (requestData) => dispatch(submitVerificationRequest(requestData));
  const fetchPendingRequests = () => dispatch(getPendingVerificationRequests());
  const approveVerification = (userId) => dispatch(approveVerificationRequest(userId));
  const rejectVerification = (userId, rejectionReason) => 
    dispatch(rejectVerificationRequest({ userId, rejectionReason }));
  const fetchVerificationStats = () => dispatch(getVerificationStats());
  const setStatus = (status) => dispatch(setVerificationStatus(status));
  const clearStatus = () => dispatch(clearVerificationStatus());
  const clearError = () => dispatch(clearVerificationError());
  const resetState = () => dispatch(resetVerificationState());
  const updateRequestStatus = (userId, status, rejectionReason) =>
    dispatch(updateVerificationRequestStatus({ userId, status, rejectionReason }));

  // Helper functions
  const canRequestVerification = () => {
    if (!currentUser) return false;
    if (currentUser.isVerified) return false;
    if (currentUser.verificationRequest?.status === 'pending') return false;
    if (currentUser.verificationRequest?.status === 'rejected') {
      // Check if 90 days have passed since rejection
      const rejectedAt = new Date(currentUser.verificationRequest.reviewedAt);
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      return rejectedAt < ninetyDaysAgo;
    }
    return true;
  };

  const getVerificationBadgeColor = () => {
    if (isVerified) return '#1877f2'; // Facebook blue
    if (verificationStatus?.verificationRequest?.status === 'pending') return '#ffb300'; // Amber
    if (verificationStatus?.verificationRequest?.status === 'rejected') return '#f44336'; // Red
    return '#9e9e9e'; // Gray
  };

  return {
    // State
    currentUser,
    verificationStatus,
    isVerified,
    verificationLoading,
    verificationError,
    verificationSuccess,
    requestSubmitted,
    pendingVerificationRequests,
    adminVerificationLoading,
    adminVerificationError,
    verificationStats,

    // Actions
    fetchVerificationStatus,
    submitVerification,
    fetchPendingRequests,
    approveVerification,
    rejectVerification,
    fetchVerificationStats,
    setStatus,
    clearStatus,
    clearError,
    resetState,
    updateRequestStatus,

    // Helpers
    canRequestVerification,
    getVerificationBadgeColor,
  };
};