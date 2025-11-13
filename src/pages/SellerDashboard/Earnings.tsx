import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Copy, TrendingUp, UserPlus, Loader2 } from 'lucide-react';
import { getFormattedReferrals, getReferralStats, getAffiliateEarnings } from '@/services/SellerServices/ReferalsCommission.ts';
import './Earnings.css';
import { useAffiliateCode } from '@/hooks/checkAffiliateCode.ts';

const Earnings = () => {
    const [activeTab, setActiveTab] = useState('sales');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { affiliateCode } = useAffiliateCode();

    // State for referral data
    const [referralsData, setReferralsData] = useState([]);
    const [referralStats, setReferralStats] = useState({
        totalReferrals: 0,
        totalEarnings: 0,
        pendingEarnings: 0
    });
    const [affiliateEarnings, setAffiliateEarnings] = useState({
        balance: 0,
        totalEarnings: 0,
        referralsEarnings: 0,
        commissionEarnings: 0
    });

    // Mock data for sales (you'll replace this later)
    const salesData = [
        { id: 1, product: "Wireless Earbuds Pro", date: "2024-01-15", amount: "Ksh 350", status: "Completed" },
        { id: 2, product: "Fitness Tracker Watch", date: "2024-01-14", amount: "Ksh 100", status: "Completed" },
        { id: 4, product: "Smart Home Speaker", date: "2024-01-13", amount: "Ksh 130", status: "Completed" },
        { id: 5, product: "Yoga Mat Premium", date: "2024-01-12", amount: "Ksh 210", status: "Completed" }
    ];

    // Fetch referral data on component mount
    useEffect(() => {
        const fetchReferralData = async () => {
            if (!affiliateCode) {
                setError('Affiliate code is required');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Fetch referrals
                const { data: referrals, error: referralsError } = await getFormattedReferrals(affiliateCode);
                if (referralsError) throw referralsError;

                // Fetch stats
                const { data: stats, error: statsError } = await getReferralStats(affiliateCode);
                if (statsError) throw statsError;

                // Fetch affiliate earnings
                const { data: earnings, error: earningsError } = await getAffiliateEarnings(affiliateCode);
                if (earningsError) throw earningsError;

                setReferralsData(referrals || []);
                setReferralStats(stats || { totalReferrals: 0, totalEarnings: 0, pendingEarnings: 0 });
                setAffiliateEarnings({
                    balance: parseFloat(earnings?.balance || 0),
                    totalEarnings: parseFloat(earnings?.total_earnings || 0),
                    referralsEarnings: parseFloat(earnings?.referals_earnings || 0),
                    commissionEarnings: parseFloat(earnings?.commission_earnings || 0)
                });
            } catch (err) {
                console.error('Error fetching referral data:', err);
                setError('Failed to load referral data');
            } finally {
                setLoading(false);
            }
        };

        fetchReferralData();
    }, [affiliateCode]);

    // Calculate totals for sales (mock data)
    const totalSales = salesData
        .filter(sale => sale.status === 'Completed')
        .reduce((sum, sale) => sum + parseFloat(sale.amount.replace('Ksh', '')), 0);

    const copyReferralLink = () => {
        navigator.clipboard.writeText(`https://youraffiliate.com/ref/${affiliateCode}`);
        // You can add a toast notification here
    };

    if (loading) {
        return (
            <div className="earnings-container">
                <div className="loading-state">
                    <Loader2 size={32} className="spinner" />
                    <p>Loading earnings data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="earnings-container">
                <div className="error-state">
                    <p className="error-message">{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="earnings-container">
            <div className="earnings-header">
                <h2>Earnings</h2>
            </div>

            {/* Summary Cards - Compact */}
            <div className="earnings-summary-compact">
                <div className="summary-card-compact">
                    <div className="summary-icon-compact">
                        <DollarSign size={16} />
                    </div>
                    <div className="summary-content-compact">
                        <span className="summary-label">Sales</span>
                        <span className="summary-amount">Ksh {affiliateEarnings.commissionEarnings.toFixed(2)}</span>
                    </div>
                </div>

                <div className="summary-card-compact">
                    <div className="summary-icon-compact">
                        <Users size={16} />
                    </div>
                    <div className="summary-content-compact">
                        <span className="summary-label">Referrals</span>
                        <span className="summary-amount">Ksh {affiliateEarnings.referralsEarnings.toFixed(2)}</span>
                    </div>
                </div>

                <div className="summary-card-compact">
                    <div className="summary-icon-compact">
                        <TrendingUp size={16} />
                    </div>
                    <div className="summary-content-compact">
                        <span className="summary-label">Total</span>
                        <span className="summary-amount">Ksh {affiliateEarnings.totalEarnings.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Tabs - Compact */}
            <div className="earnings-tabs-compact">
                <div className="tabs-header-compact">
                    <button
                        className={`tab-button-compact ${activeTab === 'sales' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sales')}
                    >
                        <DollarSign size={14} />
                        Sales
                    </button>
                    <button
                        className={`tab-button-compact ${activeTab === 'referrals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('referrals')}
                    >
                        <UserPlus size={14} />
                        Referrals
                    </button>
                </div>

                <div className="tab-content-compact">
                    {activeTab === 'sales' && (
                        <div className="sales-tab-compact">
                            <div className="table-container">
                                <div className="table-header-compact">
                                    <div className="table-col">Product</div>
                                    <div className="table-col">Date</div>
                                    <div className="table-col text-right">Amount</div>
                                    <div className="table-col text-right">Status</div>
                                </div>

                                <div className="table-body-compact">
                                    {salesData.map(sale => (
                                        <div key={sale.id} className="table-row-compact">
                                            <div className="table-col Product-name">{sale.product}</div>
                                            <div className="table-col">{sale.date}</div>
                                            <div className="table-col text-right amount">{sale.amount}</div>
                                            <div className="table-col text-right">
                                                <span className={`status-badge status-${sale.status.toLowerCase()}`}>
                                                    {sale.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'referrals' && (
                        <div className="referrals-tab-compact">
                            <div className="referral-stats-compact">
                                <div className="stat-item-compact">
                                    <span className="stat-value">{referralStats.totalReferrals}</span>
                                    <span className="stat-label">Total</span>
                                </div>
                                <div className="stat-item-compact">
                                    <span className="stat-value">Ksh {referralStats.totalEarnings.toFixed(2)}</span>
                                    <span className="stat-label">Earned</span>
                                </div>
                            </div>

                            {referralsData.length === 0 ? (
                                <div className="empty-state">
                                    <UserPlus size={48} />
                                    <p>No referrals yet</p>
                                    <p className="empty-state-subtitle">Share your referral link to start earning!</p>
                                </div>
                            ) : (
                                <div className="table-container">
                                    <div className="table-header-compact">
                                        <div className="table-col">Code</div>
                                        <div className="table-col">Date</div>
                                        <div className="table-col text-right">Amount</div>
                                        <div className="table-col text-right">Status</div>
                                    </div>

                                    <div className="table-body-compact">
                                        {referralsData.map(referral => (
                                            <div key={referral.id} className="table-row-compact">
                                                <div className="table-col Product-name">{referral.code}</div>
                                                <div className="table-col">{referral.date}</div>
                                                <div className="table-col text-right amount">{referral.amount}</div>
                                                <div className="table-col text-right">
                                                    <span className={`status-badge status-${referral.status.toLowerCase()}`}>
                                                        {referral.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Earnings;