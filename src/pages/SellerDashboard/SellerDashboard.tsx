// SellerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAffiliateStatus } from "@/hooks/checkAffiliateStatus.ts"; // Adjust import path as needed
import Products from './AvailableProducts';
import Earnings from './Earnings';
import Transactions from './Transactions';
import './SellerDashboard.css';

const SellerDashboard = () => {
    const [activeTab, setActiveTab] = useState('products');
    const { isAffiliate, loading } = useAffiliateStatus();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isAffiliate) {
            navigate("/join");
        }
    }, [isAffiliate, loading, navigate]);

    const renderContent = () => {
        switch (activeTab) {
            case 'products':
                return <Products />;
            case 'earnings':
                return <Earnings />;
            case 'transactions':
                return <Transactions />;
            default:
                return <Products />;
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Checking status...</p>
                </div>
            </div>
        );
    }

    if (!isAffiliate) {
        return (
            <div className="dashboard-container">
                <div className="loading-state">
                    <p>Redirecting to affiliate program...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Affiliate Dashboard</h1>
                <div className="user-info">
                    <span>Welcome, Seller!</span>
                </div>
            </div>

            <div className="dashboard-tabs">
                <button
                    className={`Tab-button ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => setActiveTab('products')}
                >
                    Products
                </button>
                <button
                    className={`Tab-button ${activeTab === 'earnings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('earnings')}
                >
                    Earnings
                </button>
                <button
                    className={`Tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transactions')}
                >
                    Wallet
                </button>
            </div>

            <div className="dashboard-content">
                {renderContent()}
            </div>
        </div>
    );
}

export default SellerDashboard;