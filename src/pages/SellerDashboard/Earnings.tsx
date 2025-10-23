// Earnings.jsx
import React, { useState } from 'react';
import { DollarSign, Users, Copy, TrendingUp, UserPlus } from 'lucide-react';
import './Earnings.css';

const Earnings = () => {
    const [activeTab, setActiveTab] = useState('sales');

    // Mock data for sales
    const salesData = [
        { id: 1, product: "Wireless Earbuds Pro", date: "2024-01-15", amount: "Ksh 350", status: "Completed" },
        { id: 2, product: "Fitness Tracker Watch", date: "2024-01-14", amount: "Ksh 100", status: "Completed" },
        { id: 3, product: "Gaming Keyboard RGB", date: "2024-01-14", amount: "Ksh 50", status: "Pending" },
        { id: 4, product: "Smart Home Speaker", date: "2024-01-13", amount: "Ksh 130", status: "Completed" },
        { id: 5, product: "Yoga Mat Premium", date: "2024-01-12", amount: "Ksh 210", status: "Completed" }
    ];

    // Mock data for referrals
    const referralsData = [
        { id: 1, name: "John Doe", date: "2024-01-15", amount: "250 KSH", status: "Completed" },
        { id: 2, name: "Jane Smith", date: "2024-01-14", amount: "250 KSH", status: "Completed" },
        { id: 3, name: "Mike Johnson", date: "2024-01-10", amount: "250 KSH", status: "Pending" },
        { id: 4, name: "Sarah Wilson", date: "2024-01-08", amount: "250 KSH", status: "Completed" }
    ];

    // Calculate totals
    const totalSales = salesData
        .filter(sale => sale.status === 'Completed')
        .reduce((sum, sale) => sum + parseFloat(sale.amount.replace('Ksh', '')), 0);

    const totalReferrals = referralsData
        .filter(ref => ref.status === 'Completed')
        .reduce((sum, ref) => sum + 250, 0);

    const pendingSales = salesData
        .filter(sale => sale.status === 'Pending')
        .reduce((sum, sale) => sum + parseFloat(sale.amount.replace('Ksh', '')), 0);

    const pendingReferrals = referralsData
        .filter(ref => ref.status === 'Pending')
        .length * 250;

    const copyReferralLink = () => {
        navigator.clipboard.writeText("https://youraffiliate.com/ref/yourusername123");
        // You can add a toast notification here
    };

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
                        <span className="summary-amount">Ksh {totalSales.toFixed(2)}</span>
                        <span className="summary-pending">Ksh {pendingSales.toFixed(2)} pending</span>
                    </div>
                </div>

                <div className="summary-card-compact">
                    <div className="summary-icon-compact">
                        <Users size={16} />
                    </div>
                    <div className="summary-content-compact">
                        <span className="summary-label">Referrals</span>
                        <span className="summary-amount">Ksh {totalReferrals}</span>
                        <span className="summary-pending">Ksh {pendingReferrals} pending</span>
                    </div>
                </div>

                <div className="summary-card-compact">
                    <div className="summary-icon-compact">
                        <TrendingUp size={16} />
                    </div>
                    <div className="summary-content-compact">
                        <span className="summary-label">Total</span>
                        <span className="summary-amount">Ksh {totalSales.toFixed(2)} + {totalReferrals} KSH</span>
                        <span className="summary-pending">Ksh {pendingSales.toFixed(2)} + {pendingReferrals} KSH pending</span>
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
                                    <span className="stat-value">{referralsData.length}</span>
                                    <span className="stat-label">Total</span>
                                </div>
                                <div className="stat-item-compact">
                                    <span className="stat-value">{referralsData.filter(ref => ref.status === 'Completed').length}</span>
                                    <span className="stat-label">Paid</span>
                                </div>
                                <div className="stat-item-compact">
                                    <span className="stat-value">{referralsData.filter(ref => ref.status === 'Pending').length}</span>
                                    <span className="stat-label">Pending</span>
                                </div>
                            </div>

                            <div className="table-container">
                                <div className="table-header-compact">
                                    <div className="table-col">Name</div>
                                    <div className="table-col">Date</div>
                                    <div className="table-col text-right">Amount</div>
                                    <div className="table-col text-right">Status</div>
                                </div>

                                <div className="table-body-compact">
                                    {referralsData.map(referral => (
                                        <div key={referral.id} className="table-row-compact">
                                            <div className="table-col Product-name">{referral.name}</div>
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
                        </div>
                    )}
                </div>
            </div>

            {/* Referral Section - Compact */}
            <div className="referral-section-compact">
                <div className="referral-header">
                    <UserPlus size={16} />
                    <span>Your Referral Link</span>
                </div>
                <div className="referral-link-container-compact">
                    <input
                        type="text"
                        value="https://affiliate.com/ref/yourusername"
                        readOnly
                        className="referral-link-compact"
                    />
                    <button className="copy-referral-btn-compact" onClick={copyReferralLink}>
                        <Copy size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Earnings;