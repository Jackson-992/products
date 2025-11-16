import './PaymentDetails.css';

const PaymentDetails = ({ payment, isOpen, onClose }) => {
    if (!isOpen || !payment) return null;

    const formatDate = (dateString) => {
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

    const getTypeClass = (type) => {
        switch (type) {
            case 'withdrawal':
                return 'type-withdrawal';
            case 'sales_commission':
                return 'type-sales';
            case 'referral_commission':
                return 'type-referral';
            case 'registration':
                return 'type-registration';
            default:
                return 'type-default';
        }
    };

    const renderPaymentDetails = () => {
        switch (payment.type) {
            case 'referral_commission':
                return (
                    <div className="details-section">
                        <h4>Referral Commission Details</h4>
                        <div className="details-grid">
                            <div className="detail-item">
                                <label>Invitee Code:</label>
                                <span>{payment.details.invitee_code}</span>
                            </div>
                            <div className="detail-item">
                                <label>Commission Amount:</label>
                                <span className="amount">Ksh {payment.details.commission_amount?.toLocaleString()}</span>
                            </div>
                            <div className="detail-item">
                                <label>Time Invited:</label>
                                <span>{formatDate(payment.details.invited_at)}</span>
                            </div>
                        </div>
                    </div>
                );

            case 'sales_commission':
                return (
                    <div className="details-section">
                        <h4>Sales Commission Details</h4>
                        <div className="details-grid">
                            <div className="detail-item">
                                <label>Product ID:</label>
                                <span>{payment.details.product_id}</span>
                            </div>
                            <div className="detail-item">
                                <label>Product Name:</label>
                                <span>{payment.details.product_name}</span>
                            </div>
                            <div className="detail-item">
                                <label>Quantity:</label>
                                <span>{payment.details.quantity}</span>
                            </div>
                            <div className="detail-item">
                                <label>Unit Price:</label>
                                <span>Ksh {payment.details.unit_price?.toLocaleString()}</span>
                            </div>
                            <div className="detail-item">
                                <label>Commission Rate:</label>
                                <span>{payment.details.commission_rate}%</span>
                            </div>
                            <div className="detail-item">
                                <label>Commission Amount:</label>
                                <span className="amount">Ksh {payment.details.commission_amount?.toLocaleString()}</span>
                            </div>
                            <div className="detail-item">
                                <label>Sale Date:</label>
                                <span>{formatDate(payment.details.sale_date)}</span>
                            </div>
                        </div>
                    </div>
                );

            case 'withdrawal':
                return (
                    <div className="details-section">
                        <h4>Withdrawal Details</h4>
                        <div className="details-grid">
                            <div className="detail-item">
                                <label>Withdrawal Amount:</label>
                                <span className="amount">Ksh {payment.amount.toLocaleString()}</span>
                            </div>
                            <div className="detail-item">
                                <label>Phone Number:</label>
                                <span>{payment.details.phone_number}</span>
                            </div>
                            <div className="detail-item">
                                <label>Network:</label>
                                <span>{payment.details.network}</span>
                            </div>
                            <div className="detail-item">
                                <label>Transaction ID:</label>
                                <span>{payment.details.transaction_id || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Initiated At:</label>
                                <span>{formatDate(payment.details.initiated_at)}</span>
                            </div>
                            {payment.details.processed_at && (
                                <div className="detail-item">
                                    <label>Processed At:</label>
                                    <span>{formatDate(payment.details.processed_at)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'registration':
                return (
                    <div className="details-section">
                        <h4>Registration Payment Details</h4>
                        <div className="details-grid">
                            <div className="detail-item">
                                <label>User ID:</label>
                                <span>{payment.details.user_id}</span>
                            </div>
                            <div className="detail-item">
                                <label>Phone Number:</label>
                                <span className="phone-number">{payment.details.phone_number}</span>
                            </div>
                            <div className="detail-item">
                                <label>Referer Code:</label>
                                <span className="referer-code">{payment.details.referer_code || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Registration Amount:</label>
                                <span className="amount">Ksh {payment.details.amount?.toLocaleString()}</span>
                            </div>
                            <div className="detail-item">
                                <label>Payment Created:</label>
                                <span>{formatDate(payment.details.created_at)}</span>
                            </div>
                            {payment.details.completed_at && (
                                <div className="detail-item">
                                    <label>Completed At:</label>
                                    <span>{formatDate(payment.details.completed_at)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
            <div className={`payment-details-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Payment Details</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="sidebar-content">
                    {/* Payment Summary */}
                    <div className="summary-section">
                        <h4>Payment Summary</h4>
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
                                <label>Type:</label>
                                <span className={`type-badge ${getTypeClass(payment.type)}`}>
                                    {payment.type.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="summary-item">
                                <label>Status:</label>
                                <span className={`status-badge ${getStatusClass(payment.status)}`}>
                                    {payment.status}
                                </span>
                            </div>
                            <div className="summary-item">
                                <label>Date Created:</label>
                                <span>{formatDate(payment.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Type-specific Details */}
                    {renderPaymentDetails()}
                </div>
            </div>
        </>
    );
};

export default PaymentDetails;