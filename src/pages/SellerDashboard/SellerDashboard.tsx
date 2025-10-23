// SellerDashboard.jsx
import React, { useState } from 'react';
import Products from './AvailableProducts';
import Earnings from './Earnings';
import Performance from './Performance';
import Transactions from './Transactions';
import './SellerDashboard.css';

const SellerDashboard = () => {
    const [activeTab, setActiveTab] = useState('products');

    const renderContent = () => {
        switch (activeTab) {
            case 'products':
                return <Products />;
            case 'earnings':
                return <Earnings />;
            case 'performance':
                return <Performance />;
            case 'transactions':
                return <Transactions />;
            default:
                return <Products />;
        }
    };

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
                    className={`Tab-button ${activeTab === 'performance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('performance')}
                >
                    Performance
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