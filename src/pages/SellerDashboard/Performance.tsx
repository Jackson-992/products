// Performance.jsx
import React, { useState } from 'react';
import { TrendingUp, Users, BarChart3, Calendar, Star, MousePointer, ShoppingCart, UserPlus } from 'lucide-react';
import './Performance.css';

const Performance = () => {
    const [activeTab, setActiveTab] = useState('sales');
    const [timeRange, setTimeRange] = useState('weekly');

    // Mock data for sales performance
    const salesData = {
        totalClicks: 8452,
        totalConversions: 342,
        conversionRate: 4.05,
        topProducts: [
            { name: "Gaming Keyboard RGB", conversions: 89, rate: 6.2 },
            { name: "Wireless Earbuds Pro", conversions: 76, rate: 5.8 },
            { name: "Smart Home Speaker", conversions: 54, rate: 4.5 },
            { name: "Fitness Tracker", conversions: 43, rate: 3.9 }
        ],
        timeline: [
            { period: "Jan 1", clicks: 234, conversions: 12, sales: 10 },
            { period: "Jan 2", clicks: 189, conversions: 8, sales: 7 },
            { period: "Jan 3", clicks: 267, conversions: 14, sales: 12 },
            { period: "Jan 4", clicks: 198, conversions: 9, sales: 8 },
            { period: "Jan 5", clicks: 312, conversions: 18, sales: 15 },
            { period: "Jan 6", clicks: 276, conversions: 13, sales: 11 },
            { period: "Jan 7", clicks: 245, conversions: 11, sales: 9 }
        ]
    };

    // Mock data for referrals performance
    const referralsData = {
        totalReferrals: 24,
        newReferrals: 8,
        referralRate: 2.1,
        timeline: [
            { period: "Jan 1", referrals: 2 },
            { period: "Jan 2", referrals: 1 },
            { period: "Jan 3", referrals: 0 },
            { period: "Jan 4", referrals: 3 },
            { period: "Jan 5", referrals: 1 },
            { period: "Jan 6", referrals: 0 },
            { period: "Jan 7", referrals: 1 }
        ],
        recentReferrals: [
            { name: "John Doe", date: "2024-01-15", status: "Active" },
            { name: "Jane Smith", date: "2024-01-14", status: "Active" },
            { name: "Mike Johnson", date: "2024-01-10", status: "Pending" },
            { name: "Sarah Wilson", date: "2024-01-08", status: "Active" }
        ]
    };

    const timeRanges = [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' }
    ];

    return (
        <div className="performance-container">
            <div className="performance-header">
                <h2>Performance Analytics</h2>
                <div className="time-filter">
                    {timeRanges.map(range => (
                        <button
                            key={range.value}
                            className={`time-filter-btn ${timeRange === range.value ? 'active' : ''}`}
                            onClick={() => setTimeRange(range.value)}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="performance-tabs">
                <div className="tabs-header">
                    <button
                        className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sales')}
                    >
                        <TrendingUp size={14} />
                        Sales Performance
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'referrals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('referrals')}
                    >
                        <Users size={14} />
                        Referrals Performance
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'sales' && (
                        <div className="sales-performance">
                            {/* Key Metrics */}
                            <div className="metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-icon">
                                        <MousePointer size={16} />
                                    </div>
                                    <div className="metric-content">
                                        <span className="metric-value">{salesData.totalClicks.toLocaleString()}</span>
                                        <span className="metric-label">Total Clicks</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-icon">
                                        <ShoppingCart size={16} />
                                    </div>
                                    <div className="metric-content">
                                        <span className="metric-value">{salesData.totalConversions}</span>
                                        <span className="metric-label">Total Sales</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-icon">
                                        <BarChart3 size={16} />
                                    </div>
                                    <div className="metric-content">
                                        <span className="metric-value">{salesData.conversionRate}%</span>
                                        <span className="metric-label">Conversion Rate</span>
                                    </div>
                                </div>
                            </div>

                            {/* Charts and Data Grid */}
                            <div className="data-grid">
                                {/* Top Products */}
                                <div className="data-card">
                                    <div className="card-header">
                                        <Star size={14} />
                                        <span>Top Performing Products</span>
                                    </div>
                                    <div className="card-content">
                                        {salesData.topProducts.map((product, index) => (
                                            <div key={index} className="product-row">
                                                <div className="product-info">
                                                    <span className="Product-name">{product.name}</span>
                                                    <span className="product-stats">{product.conversions} sales</span>
                                                </div>
                                                <span className="conversion-rate">{product.rate}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Timeline Chart */}
                                <div className="data-card">
                                    <div className="card-header">
                                        <Calendar size={14} />
                                        <span>Performance Timeline</span>
                                    </div>
                                    <div className="chart-container">
                                        <div className="chart-bars">
                                            {salesData.timeline.map((day, index) => (
                                                <div key={index} className="chart-bar-group">
                                                    <div className="bar-container">
                                                        <div
                                                            className="bar clicks"
                                                            style={{ height: `${(day.clicks / 350) * 60}px` }}
                                                            title={`Clicks: ${day.clicks}`}
                                                        ></div>
                                                        <div
                                                            className="bar conversions"
                                                            style={{ height: `${(day.conversions / 20) * 60}px` }}
                                                            title={`Conversions: ${day.conversions}`}
                                                        ></div>
                                                        <div
                                                            className="bar sales"
                                                            style={{ height: `${(day.sales / 18) * 60}px` }}
                                                            title={`Sales: ${day.sales}`}
                                                        ></div>
                                                    </div>
                                                    <span className="chart-label">{day.period}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="chart-legend">
                                            <div className="legend-item">
                                                <div className="legend-color clicks"></div>
                                                <span>Clicks</span>
                                            </div>
                                            <div className="legend-item">
                                                <div className="legend-color conversions"></div>
                                                <span>Conversions</span>
                                            </div>
                                            <div className="legend-item">
                                                <div className="legend-color sales"></div>
                                                <span>Sales</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'referrals' && (
                        <div className="referrals-performance">
                            {/* Key Metrics */}
                            <div className="metrics-grid">
                                <div className="metric-card">
                                    <div className="metric-icon">
                                        <Users size={16} />
                                    </div>
                                    <div className="metric-content">
                                        <span className="metric-value">{referralsData.totalReferrals}</span>
                                        <span className="metric-label">Total Referrals</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-icon">
                                        <UserPlus size={16} />
                                    </div>
                                    <div className="metric-content">
                                        <span className="metric-value">{referralsData.newReferrals}</span>
                                        <span className="metric-label">New This {timeRange}</span>
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <div className="metric-icon">
                                        <TrendingUp size={16} />
                                    </div>
                                    <div className="metric-content">
                                        <span className="metric-value">{referralsData.referralRate}%</span>
                                        <span className="metric-label">Growth Rate</span>
                                    </div>
                                </div>
                            </div>

                            {/* Charts and Data Grid */}
                            <div className="data-grid">
                                {/* Recent Referrals */}
                                <div className="data-card">
                                    <div className="card-header">
                                        <UserPlus size={14} />
                                        <span>Recent Referrals</span>
                                    </div>
                                    <div className="card-content">
                                        {referralsData.recentReferrals.map((referral, index) => (
                                            <div key={index} className="referral-row">
                                                <div className="referral-info">
                                                    <span className="referral-name">{referral.name}</span>
                                                    <span className="referral-date">{referral.date}</span>
                                                </div>
                                                <span className={`status status-${referral.status.toLowerCase()}`}>
                                                    {referral.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Referrals Timeline */}
                                <div className="data-card">
                                    <div className="card-header">
                                        <Calendar size={14} />
                                        <span>Referrals Timeline</span>
                                    </div>
                                    <div className="chart-container">
                                        <div className="referral-chart">
                                            {referralsData.timeline.map((day, index) => (
                                                <div key={index} className="referral-bar-group">
                                                    <div
                                                        className="referral-bar"
                                                        style={{ height: `${(day.referrals / 4) * 80}px` }}
                                                        title={`Referrals: ${day.referrals}`}
                                                    ></div>
                                                    <span className="chart-label">{day.period}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="chart-legend">
                                            <div className="legend-item">
                                                <div className="legend-color referrals"></div>
                                                <span>Referrals</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Performance;