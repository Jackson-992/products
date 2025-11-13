// SellerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAffiliateStatus } from "@/hooks/checkAffiliateStatus.ts"; // Adjust import path as needed
import Products from './AvailableProducts';
import Earnings from './Earnings';
import Performance from './Performance';
import Transactions from './Transactions';
import './SellerDashboard.css';
import { useAffiliateCode } from '@/hooks/checkAffiliateCode.ts';

const SellerDashboard = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [copied, setCopied] = useState(false);
    const { isAffiliate, loading } = useAffiliateStatus();
    const navigate = useNavigate();
    const { affiliateCode } = useAffiliateCode();

    useEffect(() => {
        if (!loading && !isAffiliate) {
            navigate("/join");
        }
    }, [isAffiliate, loading, navigate]);

    const copyToClipboard = async () => {
        if (!affiliateCode) return;

        try {
            await navigator.clipboard.writeText(affiliateCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            //console.error('Failed to copy text: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = affiliateCode;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

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

    // SellerDashboard.jsx - Updated affiliate code section only
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

            {/* Compact Affiliate Code Section */}
            <div className="affiliate-code-compact">
                <div className="code-label">Your Affiliate Code:</div>
                <div className="code-wrapper">
                    <code className="affiliate-code">{affiliateCode || 'Loading...'}</code>
                    <button
                        className={`copy-btn-compact ${copied ? 'copied' : ''}`}
                        onClick={copyToClipboard}
                        disabled={!affiliateCode}
                        title="Copy to clipboard"
                    >
                        {copied ? '✓' : '📋'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SellerDashboard;