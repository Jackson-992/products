import './AffiliateDetails.css';

const AffiliateDetails = ({ affiliate, isOpen, onClose }) => {
    if (!isOpen || !affiliate) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const referralEarning = 250; // Ksh 250 per referral
    const commissionRate = 0.15; // 15% commission on product sales

    // Calculate earnings from different sources
    const referralEarnings = affiliate.total_referrals * referralEarning;
    const productSalesEarnings = affiliate.total_earned - referralEarnings;
    const totalEarnings = affiliate.total_earned;

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
            <div className={`affiliate-details-sidebar compact ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Affiliate Details</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="sidebar-content">
                    {/* Basic Information */}
                    <div className="section compact-section">
                        <h4>Basic Info</h4>
                        <div className="Info-grid compact-grid">
                            <div className="info-item">
                                <label>Name:</label>
                                <span>{affiliate.user_name}</span>
                            </div>
                            <div className="info-item">
                                <label>User ID:</label>
                                <span>{affiliate.user_id}</span>
                            </div>
                            <div className="info-item">
                                <label>Affiliate Code:</label>
                                <span className="affiliate-code">{affiliate.affiliate_code}</span>
                            </div>
                            <div className="info-item">
                                <label>Joined:</label>
                                <span>{formatDate(affiliate.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Wallet & Earnings */}
                    <div className="section compact-section">
                        <h4>Wallet & Earnings</h4>
                        <div className="stats-grid compact-stats">
                            <div className="stat-card compact-stat">
                                <div className="stat-value">Ksh {affiliate.wallet_balance.toLocaleString()}</div>
                                <div className="stat-label">Wallet Balance</div>
                            </div>
                            <div className="stat-card compact-stat">
                                <div className="stat-value">Ksh {affiliate.total_earned.toLocaleString()}</div>
                                <div className="stat-label">Total Earned</div>
                            </div>
                            <div className="stat-card compact-stat">
                                <div className="stat-value">Ksh {affiliate.pending_earnings.toLocaleString()}</div>
                                <div className="stat-label">Pending</div>
                            </div>
                        </div>
                    </div>

                    {/* Earnings Breakdown */}
                    <div className="section compact-section">
                        <h4>Earnings Breakdown</h4>
                        <div className="earnings-breakdown">
                            <div className="earnings-item">
                                <div className="earnings-type">
                                    <span className="type-label">Referral Earnings</span>
                                    <span className="type-desc">{affiliate.total_referrals} referrals × Ksh {referralEarning}</span>
                                </div>
                                <div className="earnings-amount">
                                    Ksh {referralEarnings.toLocaleString()}
                                </div>
                            </div>

                            <div className="earnings-item">
                                <div className="earnings-type">
                                    <span className="type-label">Product Sales Commission</span>
                                    <span className="type-desc">{affiliate.total_products_sold} sales × {commissionRate * 100}% commission</span>
                                </div>
                                <div className="earnings-amount">
                                    Ksh {productSalesEarnings.toLocaleString()}
                                </div>
                            </div>

                            <div className="earnings-item total">
                                <div className="earnings-type">
                                    <span className="type-label">Total Earnings</span>
                                </div>
                                <div className="earnings-amount total">
                                    Ksh {totalEarnings.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Summary */}
                    <div className="section compact-section">
                        <h4>Performance Summary</h4>
                        <div className="metrics-grid compact-metrics">
                            <div className="metric-item">
                                <label>Total Referrals:</label>
                                <span className="metric-value">{affiliate.total_referrals}</span>
                            </div>
                            <div className="metric-item">
                                <label>Products Sold:</label>
                                <span className="metric-value">{affiliate.total_products_sold}</span>
                            </div>
                            <div className="metric-item">
                                <label>Commission Rate:</label>
                                <span className="metric-value">{commissionRate * 100}%</span>
                            </div>
                            <div className="metric-item">
                                <label>Conversion Rate:</label>
                                <span className="metric-value">{affiliate.conversion_rate}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Referrer Information */}
                    {affiliate.referred_by && (
                        <div className="section compact-section">
                            <h4>Referred By</h4>
                            <div className="referrer-info compact-referrer">
                                <div className="referrer-details">
                                    <span className="referrer-code">{affiliate.referred_by.code}</span>
                                    <span className="referrer-name">({affiliate.referred_by.name})</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recent Activity */}
                    {affiliate.recent_referrals && affiliate.recent_referrals.length > 0 && (
                        <div className="section compact-section">
                            <h4>Recent Referrals</h4>
                            <div className="recent-referrals compact-referrals">
                                {affiliate.recent_referrals.slice(0, 3).map((referral, index) => (
                                    <div key={index} className="referral-item compact-referral">
                                        <div className="referral-name">{referral.user_name}</div>
                                        <div className="referral-date">{formatDate(referral.joined_at)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AffiliateDetails;