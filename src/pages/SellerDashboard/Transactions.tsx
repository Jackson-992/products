// Transactions.jsx
import React, { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Phone, Copy, Users, ShoppingCart } from 'lucide-react';
import './Transactions.css';

const Transactions = () => {
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    // Mock wallet data
    const walletData = {
        balance: 12560.75,
        // available: 11560.75,
        // pending: 1000.00
    };

    // Mock transactions data with three types
    const transactionsData = [
        {
            id: 1,
            type: 'withdrawal',
            amount: 5000.00,
            phone: '+254712345678',
            status: 'completed',
            date: '2024-01-15 14:30',
            reference: 'MPESA_REF_001'
        },
        {
            id: 2,
            type: 'withdrawal',
            amount: 3000.00,
            phone: '+254712345678',
            status: 'pending',
            date: '2024-01-14 10:15',
            reference: 'MPESA_REF_002'
        },
        {
            id: 3,
            type: 'sales_commission',
            amount: 1250.50,
            status: 'completed',
            date: '2024-01-13 16:45',
            reference: 'SALES_COMM_001'
        },
        {
            id: 4,
            type: 'referral_commission',
            amount: 250.00,
            status: 'completed',
            date: '2024-01-13 14:20',
            reference: 'REF_COMM_001'
        },
        {
            id: 5,
            type: 'withdrawal',
            amount: 2000.00,
            phone: '+254712345678',
            status: 'failed',
            date: '2024-01-12 09:20',
            reference: 'MPESA_REF_003'
        },
        {
            id: 6,
            type: 'sales_commission',
            amount: 875.25,
            status: 'completed',
            date: '2024-01-11 11:30',
            reference: 'SALES_COMM_002'
        },
        {
            id: 7,
            type: 'referral_commission',
            amount: 250.00,
            status: 'completed',
            date: '2024-01-10 08:45',
            reference: 'REF_COMM_002'
        },
        {
            id: 8,
            type: 'sales_commission',
            amount: 420.75,
            status: 'completed',
            date: '2024-01-09 15:20',
            reference: 'SALES_COMM_003'
        }
    ];

    const filteredTransactions = activeFilter === 'all'
        ? transactionsData
        : transactionsData.filter(transaction => transaction.status === activeFilter);

    const handleWithdrawal = (e) => {
        e.preventDefault();
        // Handle withdrawal logic here
        console.log('Withdrawal request:', { amount: withdrawAmount, phone: phoneNumber });
        // Reset form
        setWithdrawAmount('');
        setPhoneNumber('');
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle size={14} />;
            case 'pending': return <Clock size={14} />;
            case 'failed': return <XCircle size={14} />;
            default: return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'status-completed';
            case 'pending': return 'status-pending';
            case 'failed': return 'status-failed';
            default: return '';
        }
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'withdrawal': return <ArrowUpRight size={14} />;
            case 'sales_commission': return <ShoppingCart size={14} />;
            case 'referral_commission': return <Users size={14} />;
            default: return <ArrowDownLeft size={14} />;
        }
    };

    const getTransactionType = (type) => {
        switch (type) {
            case 'withdrawal': return 'Withdrawal';
            case 'sales_commission': return 'Sales Commission';
            case 'referral_commission': return 'Referral Commission';
            default: return 'Transaction';
        }
    };

    const getAmountColor = (type) => {
        return type === 'withdrawal' ? 'amount-negative' : 'amount-positive';
    };

    const getAmountPrefix = (type) => {
        return type === 'withdrawal' ? '-' : '+';
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="transactions-container">
            <div className="transactions-header">
                <h2>Wallet & Transactions</h2>
            </div>

            {/* Wallet Balance */}
            <div className="wallet-section">
                <div className="wallet-card">
                    <div className="wallet-header">
                        <div className="wallet-icon">
                            <Wallet size={18} />
                        </div>
                        <div className="wallet-info">
                            <span className="wallet-label">Available Balance</span>
                            <span className="wallet-amount">KSh {walletData.balance.toLocaleString()}</span>
                        </div>
                    </div>
                    {/*<div className="wallet-details">*/}
                    {/*    <div className="wallet-detail">*/}
                    {/*        <span className="detail-label">Available:</span>*/}
                    {/*        <span className="detail-amount">KSh {walletData.available.toLocaleString()}</span>*/}
                    {/*    </div>*/}
                    {/*    <div className="wallet-detail">*/}
                    {/*        <span className="detail-label">Pending:</span>*/}
                    {/*        <span className="detail-amount pending">KSh {walletData.pending.toLocaleString()}</span>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>
            </div>

            {/* Withdrawal Form */}
            <div className="withdrawal-section">
                <div className="withdrawal-card">
                    <div className="card-header">
                        <ArrowUpRight size={16} />
                        <span>Withdraw to M-Pesa</span>
                    </div>
                    <form onSubmit={handleWithdrawal} className="withdrawal-form">
                        <div className="form-group">
                            <label htmlFor="amount">Amount (KSh)</label>
                            <input
                                type="number"
                                id="amount"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                placeholder="Enter amount"
                                min="100"
                                max={walletData.available}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">M-Pesa Phone Number</label>
                            <div className="phone-input-container">
                                <Phone size={14} className="phone-icon" />
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="    0712345678"
                                    pattern="0[0-9]{9}"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="withdraw-btn"
                            disabled={!withdrawAmount || !phoneNumber || parseFloat(withdrawAmount) > walletData.available}
                        >
                            Withdraw Now
                        </button>
                        <div className="withdrawal-note">
                            Minimum withdrawal: KSh 100 • Processed within 24 hours
                        </div>
                    </form>
                </div>
            </div>

            {/* Transaction History */}
            <div className="transactions-section">
                <div className="transactions-header-compact">
                    <h3>Transaction History</h3>
                    <div className="transaction-filters">
                        <button
                            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('completed')}
                        >
                            Completed
                        </button>
                        <button
                            className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('pending')}
                        >
                            Pending
                        </button>
                        <button
                            className={`filter-btn ${activeFilter === 'failed' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('failed')}
                        >
                            Failed
                        </button>
                    </div>
                </div>

                <div className="transactions-list">
                    {filteredTransactions.map(transaction => (
                        <div key={transaction.id} className="transaction-item">
                            <div className="transaction-icon">
                                {getTransactionIcon(transaction.type)}
                            </div>
                            <div className="transaction-details">
                                <div className="transaction-main">
                                    <span className="transaction-type">
                                        {getTransactionType(transaction.type)}
                                    </span>
                                    <span className={`transaction-amount ${getAmountColor(transaction.type)}`}>
                                        {getAmountPrefix(transaction.type)}KSh {transaction.amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="transaction-meta">
                                    <span className="transaction-date">{transaction.date}</span>
                                    {transaction.phone && (
                                        <span className="transaction-phone">
                                            {transaction.phone}
                                        </span>
                                    )}
                                    <span
                                        className="transaction-reference"
                                        onClick={() => copyToClipboard(transaction.reference)}
                                    >
                                        {transaction.reference}
                                        <Copy size={10} />
                                    </span>
                                </div>
                            </div>
                            <div className={`transaction-status ${getStatusColor(transaction.status)}`}>
                                {getStatusIcon(transaction.status)}
                                <span>{transaction.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Transactions;