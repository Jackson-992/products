import './WithdrawalDetails.css';
import { useState } from 'react';
import withdrawalService from '@/services/AdminServices/payments/Withdrawals.ts';

const WithdrawalDetails = ({ payment, isOpen, onClose, onStatusUpdate }) => {
    if (!isOpen || !payment) return null;

    const [isUpdating, setIsUpdating] = useState(false);
    const [newStatus, setNewStatus] = useState(payment.status);
    const [reason, setReason] = useState(payment.details.reason_of_status || '');
    const [updateError, setUpdateError] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'completed':
                return 'status-completed';
            case 'pending':
                return 'status-pending';
            case 'failed':
                return 'status-failed';
            case 'processing':
                return 'status-processing';
            default:
                return 'status-default';
        }
    };

    const handleStatusUpdate = async () => {
        if (!newStatus || newStatus === payment.status) return;

        try {
            setIsUpdating(true);
            setUpdateError(null);
            setUpdateSuccess(false);

            await withdrawalService.updateWithdrawalStatus(
                payment.id,
                newStatus,
                reason || null
            );

            setUpdateSuccess(true);

            // Notify parent component to refresh data
            if (onStatusUpdate) {
                onStatusUpdate();
            }

            // Close sidebar after successful update
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (error) {
            setUpdateError(error.message);
            console.error('Error updating withdrawal status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const canUpdateStatus = payment.status === 'pending' || payment.status === 'processing';
    const statusChanged = newStatus !== payment.status;
    const canSubmit = canUpdateStatus && statusChanged && !isUpdating;

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
            <div className={`withdrawal-details-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Withdrawal Details</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="sidebar-content">
                    {/* Payment Summary */}
                    <div className="summary-section">
                        <h4>Withdrawal Summary</h4>
                        <div className="summary-grid">
                            <div className="summary-item">
                                <label>Payment ID:</label>
                                <span className="payment-id">{payment.payment_id}</span>
                            </div>
                            <div className="summary-item">
                                <label>Affiliate Code:</label>
                                <span className="affiliate-code">{payment.affiliate_code}</span>
                            </div>
                            <div className="summary-item">
                                <label>Amount:</label>
                                <span className="amount">Ksh {payment.amount.toLocaleString()}</span>
                            </div>
                            <div className="summary-item">
                                <label>Current Status:</label>
                                <span className={`status-badge ${getStatusClass(payment.status)}`}>
                                    {payment.status}
                                </span>
                            </div>
                            <div className="summary-item">
                                <label>Date Created:</label>
                                <span>{formatDate(payment.created_at)}</span>
                            </div>
                            {payment.details.processed_at && (
                                <div className="summary-item">
                                    <label>Processed At:</label>
                                    <span>{formatDate(payment.details.processed_at)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Withdrawal Details */}
                    <div className="details-section">
                        <h4>Withdrawal Information</h4>
                        <div className="details-grid">
                            <div className="detail-item">
                                <label>Phone Number:</label>
                                <span className="phone-number">{payment.details.phone_number}</span>
                            </div>
                            <div className="detail-item">
                                <label>Current Status Reason:</label>
                                <span className="reason">{payment.details.reason_of_status || 'No reason provided'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Update Section */}
                    {canUpdateStatus && (
                        <div className="status-update-section">
                            <h4>Update Status</h4>

                            <div className="update-form">
                                <div className="form-group">
                                    <label>New Status:</label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="completed">Completed</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Reason for Status:</label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Enter reason for status change..."
                                        className="reason-textarea"
                                        rows="3"
                                    />
                                </div>

                                {updateError && (
                                    <div className="error-message">
                                        {updateError}
                                    </div>
                                )}

                                {updateSuccess && (
                                    <div className="success-message">
                                        Status updated successfully!
                                    </div>
                                )}

                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={!canSubmit}
                                    className={`update-btn ${!canSubmit ? 'disabled' : ''}`}
                                >
                                    {isUpdating ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Read-only for completed/failed withdrawals */}
                    {!canUpdateStatus && (
                        <div className="status-info">
                            <h4>Status Information</h4>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <label>Final Status:</label>
                                    <span className={`status-badge ${getStatusClass(payment.status)}`}>
                                        {payment.status}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Status Reason:</label>
                                    <span className="reason">{payment.details.reason_of_status || 'No reason provided'}</span>
                                </div>
                                {payment.details.processed_at && (
                                    <div className="detail-item">
                                        <label>Processed At:</label>
                                        <span>{formatDate(payment.details.processed_at)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default WithdrawalDetails;