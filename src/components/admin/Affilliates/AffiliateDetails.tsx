import './AffiliateDetails.css';
import { useState, useEffect } from 'react';
import { getSalesStats, getSalesPerformance, getRecentSales } from '@/services/SellerServices/SalesCommission.ts';

const AffiliateDetails = ({ affiliate, isOpen, onClose }) => {
    if (!isOpen || !affiliate) return null;

    const [salesStats, setSalesStats] = useState(null);
    const [salesPerformance, setSalesPerformance] = useState(null);
    const [recentSales, setRecentSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSalesData = async () => {
            if (!affiliate?.affiliate_code) return;

            setLoading(true);
            try {
                // Fetch sales stats and performance data
                const [statsResponse, performanceResponse, recentSalesResponse] = await Promise.all([
                    getSalesStats(affiliate.affiliate_code),
                    getSalesPerformance(affiliate.affiliate_code),
                    getRecentSales(affiliate.affiliate_code, 5)
                ]);

                if (statsResponse.data) setSalesStats(statsResponse.data);
                if (performanceResponse.data) setSalesPerformance(performanceResponse.data);
                if (recentSalesResponse.data) setRecentSales(recentSalesResponse.data);

            } catch (error) {
                console.error('Error fetching sales data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen && affiliate) {
            fetchSalesData();
        }
    }, [affiliate, isOpen]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return 'Ksh 0';
        return `Ksh ${Number(amount).toLocaleString()}`;
    };

    // Calculate earnings from different sources using actual data
    const referralEarnings = affiliate.referals_earnings || 0;
    const commissionEarnings = affiliate.commission_earnings || 0;
    const totalEarnings = affiliate.total_earnings || 0;

    // Use actual commission rate from sales data if available, otherwise default
    const commissionRate = 0.08; // You can make this dynamic if stored in your database

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
                        <div className="info-grid compact-grid">
                            <div className="info-item">
                                <label>Name:</label>
                                <span>{affiliate.user_name || 'Unknown User'}</span>
                            </div>
                            <div className="info-item">
                                <label>User ID:</label>
                                <span>{affiliate.user_id || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Affiliate Code:</label>
                                <span className="affiliate-code">{affiliate.affiliate_code || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <label>Joined:</label>
                                <span>{formatDate(affiliate.created_at)}</span>
                            </div>
                            {affiliate.referer && (
                                <div className="info-item">
                                    <label>Referred By:</label>
                                    <span>{affiliate.referer}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Wallet & Earnings */}
                    <div className="section compact-section">
                        <h4>Wallet & Earnings</h4>
                        <div className="stats-grid compact-stats">
                            <div className="stat-card compact-stat">
                                <div className="stat-value">{formatCurrency(affiliate.balance)}</div>
                                <div className="stat-label">Current Balance</div>
                            </div>
                            <div className="stat-card compact-stat">
                                <div className="stat-value">{formatCurrency(affiliate.total_earnings)}</div>
                                <div className="stat-label">Total Earned</div>
                            </div>
                            <div className="stat-card compact-stat">
                                <div className="stat-value">{formatCurrency(affiliate.total_withdrawals)}</div>
                                <div className="stat-label">Total Withdrawn</div>
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
                                    <span className="type-desc">{affiliate.total_referrals || 0} referrals</span>
                                </div>
                                <div className="earnings-amount">
                                    {formatCurrency(referralEarnings)}
                                </div>
                            </div>

                            <div className="earnings-item">
                                <div className="earnings-type">
                                    <span className="type-label">Sales Commission</span>
                                    <span className="type-desc">
                                        {salesStats ? `${salesStats.completedSales} completed sales` : 'Loading...'}
                                    </span>
                                </div>
                                <div className="earnings-amount">
                                    {formatCurrency(commissionEarnings)}
                                </div>
                            </div>

                            <div className="earnings-item total">
                                <div className="earnings-type">
                                    <span className="type-label">Total Earnings</span>
                                </div>
                                <div className="earnings-amount total">
                                    {formatCurrency(totalEarnings)}
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
                                <span className="metric-value">{affiliate.total_referrals || 0}</span>
                            </div>
                            <div className="metric-item">
                                <label>Completed Sales:</label>
                                <span className="metric-value">
                                    {loading ? '...' : (salesStats?.completedSales || 0)}
                                </span>
                            </div>

                            <div className="metric-item">
                                <label>Commission Rate:</label>
                                <span className="metric-value">{commissionRate * 100}%</span>
                            </div>

                        </div>
                    </div>

                    {/* Sales Statistics */}
                    {salesStats && (
                        <div className="section compact-section">
                            <h4>Sales Statistics</h4>
                            <div className="stats-grid compact-stats">
                                <div className="stat-card compact-stat">
                                    <div className="stat-value">{salesStats.totalSales || 0}</div>
                                    <div className="stat-label">Total Sales</div>
                                </div>
                                <div className="stat-card compact-stat">
                                    <div className="stat-value">
                                        {formatCurrency(salesStats.totalCommissionEarnings)}
                                    </div>
                                    <div className="stat-label">Total Commission</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recent Sales Activity */}
                    {recentSales.length > 0 && (
                        <div className="section compact-section">
                            <h4>Recent Sales</h4>
                            <div className="recent-sales compact-referrals">
                                {recentSales.slice(0, 3).map((sale, index) => (
                                    <div key={sale.id || index} className="sale-item compact-referral">
                                        <div className="sale-product">{sale.productName}</div>
                                        <div className="sale-details">
                                            <span className="sale-amount">
                                                {formatCurrency(sale.commission_amount)}
                                            </span>
                                            <span className={`sale-status status-${sale.status}`}>
                                                {sale.status}
                                            </span>
                                        </div>
                                        <div className="sale-date">{formatDate(sale.created_at)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="section compact-section">
                            <div className="loading-state">Loading sales data...</div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AffiliateDetails;