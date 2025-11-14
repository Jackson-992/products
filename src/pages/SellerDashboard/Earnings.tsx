import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Copy, TrendingUp, UserPlus, Loader2 } from 'lucide-react';
import {
    getFormattedReferrals,
    getReferralStats,
    getAffiliateEarnings
} from '@/services/SellerServices/ReferalsCommission.ts';
import {
    getFormattedSales,
    getSalesStats
} from '@/services/SellerServices/SalesCommission.ts';
import './Earnings.css';
import { useAffiliateCode } from '@/hooks/checkAffiliateCode.ts';

const Earnings = () => {
    const [activeTab, setActiveTab] = useState('sales');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { affiliateCode } = useAffiliateCode();

    // State for all data - initialize as null to distinguish between "loading" and "no data"
    const [referralsData, setReferralsData] = useState(null);
    const [salesData, setSalesData] = useState(null);
    const [referralStats, setReferralStats] = useState(null);
    const [salesStats, setSalesStats] = useState(null);
    const [affiliateEarnings, setAffiliateEarnings] = useState(null);

    // Fetch all data on component mount
    useEffect(() => {
        const fetchAllData = async () => {
            if (!affiliateCode) {
                setError('Affiliate code is required');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Fetch all data in parallel for better performance
                const [
                    referralsResponse,
                    referralStatsResponse,
                    earningsResponse,
                    salesResponse,
                    salesStatsResponse
                ] = await Promise.all([
                    getFormattedReferrals(affiliateCode),
                    getReferralStats(affiliateCode),
                    getAffiliateEarnings(affiliateCode),
                    getFormattedSales(affiliateCode),
                    getSalesStats(affiliateCode)
                ]);

                // Handle referrals data
                if (referralsResponse.error) throw referralsResponse.error;
                setReferralsData(referralsResponse.data || []);

                // Handle referral stats
                if (referralStatsResponse.error) throw referralStatsResponse.error;
                setReferralStats(referralStatsResponse.data || {
                    totalReferrals: 0,
                    totalEarnings: 0,
                    pendingEarnings: 0
                });

                // Handle affiliate earnings
                if (earningsResponse.error) throw earningsResponse.error;
                setAffiliateEarnings({
                    balance: parseFloat(earningsResponse.data?.balance || 0),
                    totalEarnings: parseFloat(earningsResponse.data?.total_earnings || 0),
                    referralsEarnings: parseFloat(earningsResponse.data?.referals_earnings || 0),
                    commissionEarnings: parseFloat(earningsResponse.data?.commission_earnings || 0)
                });

                // Handle sales data
                if (salesResponse.error) throw salesResponse.error;
                setSalesData(salesResponse.data || []);

                // Handle sales stats
                if (salesStatsResponse.error) throw salesStatsResponse.error;
                setSalesStats(salesStatsResponse.data || {
                    totalSales: 0,
                    completedSales: 0,
                    pendingSales: 0,
                    totalCommissionEarnings: 0,
                    pendingCommissionEarnings: 0,
                    totalSalesValue: 0
                });

            } catch (err) {
                console.error('Error fetching earnings data:', err);
                setError('Failed to load earnings data');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [affiliateCode]);

    const copyReferralLink = () => {
        navigator.clipboard.writeText(`https://youraffiliate.com/ref/${affiliateCode}`);
        // You can add a toast notification here
    };

    // Show loading state until all data is loaded
    if (loading || !affiliateEarnings || !referralStats || !salesStats) {
        return (
            <div className="earnings-container">
                <div className="loading-state">
                    <Loader2 size={32} className="spinner" />
                    <p>Loading earnings data...</p>
                </div>
            </div>
        );
    }

    // Show error state if there's an error
    if (error) {
        return (
            <div className="earnings-container">
                <div className="error-state">
                    <p>Error: {error}</p>
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
                            <div className="referral-stats-compact">
                                <div className="stat-item-compact">
                                    <span className="stat-value">{salesStats.totalSales}</span>
                                    <span className="stat-label">Total</span>
                                </div>

                                <div className="stat-item-compact">
                                    <span className="stat-value">Ksh {salesStats.totalCommissionEarnings.toFixed(2)}</span>
                                    <span className="stat-label">Earned</span>
                                </div>
                            </div>

                            {!salesData || salesData.length === 0 ? (
                                <div className="empty-state">
                                    <DollarSign size={48} />
                                    <p>No sales yet</p>
                                    <p className="empty-state-subtitle">Your sales will appear here once you start earning commissions</p>
                                </div>
                            ) : (
                                <div className="table-container">
                                    <div className="table-header-compact">
                                        <div className="table-col">Product</div>
                                        <div className="table-col">Date</div>
                                        <div className="table-col text-right">Commission</div>
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
                            )}
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

                            {!referralsData || referralsData.length === 0 ? (
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