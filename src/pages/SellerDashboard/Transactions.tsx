// Transactions.tsx
import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Copy, Users, ShoppingCart, AlertCircle } from 'lucide-react';
import { useAffiliateCode } from '@/hooks/checkAffiliateCode.ts';
import { affiliateProfileService } from '@/services/SellerServices/getBalance.ts';
import { withdrawalService, Withdrawal, WithdrawalStatus } from '@/services/SellerServices/WithdrawalServices.ts';
import './Transactions.css';

const Transactions = () => {
    const { affiliateCode, loading: affiliateLoading } = useAffiliateCode();

    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const [balance, setBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Load balance and transactions
    useEffect(() => {
        if (affiliateCode) {
            loadData();
        }
    }, [affiliateCode]);

    const loadData = async () => {
        if (!affiliateCode) return;

        try {
            setLoading(true);
            setError(null);

            // Load balance
            const balanceData = await affiliateProfileService.getBalanceByAffiliateCode(affiliateCode);
            if (balanceData !== null) {
                setBalance(balanceData);
            }

            // Load withdrawal history
            const historyData = await withdrawalService.getWithdrawalHistory(affiliateCode);
            setTransactions(historyData);

        } catch (err) {
            console.error('Error loading data:', err);
            setError('Failed to load wallet data');
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = activeFilter === 'all'
        ? transactions
        : transactions.filter(transaction => transaction.status === activeFilter);

    const handleWithdrawal = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!affiliateCode) {
            setError('Affiliate code not found');
            return;
        }

        const amount = parseFloat(withdrawAmount);

        if (amount < 100) {
            setError('Minimum withdrawal amount is KSh 100');
            return;
        }

        if (amount > balance) {
            setError('Insufficient balance');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            setSuccessMessage(null);

            // Format phone number (remove leading 0 and add country code if needed)
            let formattedPhone = phoneNumber.trim();
            if (formattedPhone.startsWith('0')) {
                formattedPhone = '+254' + formattedPhone.substring(1);
            } else if (!formattedPhone.startsWith('+')) {
                formattedPhone = '+254' + formattedPhone;
            }

            // Create withdrawal request
            const withdrawal = await withdrawalService.createWithdrawal({
                affiliate_code: affiliateCode,
                amount: amount,
                phone_number: formattedPhone
            });

            if (withdrawal) {
                setSuccessMessage('Withdrawal request submitted successfully! Processing within 24 hours.');
                setWithdrawAmount('');
                setPhoneNumber('');

                // Reload data to show new transaction
                await loadData();

                // Clear success message after 5 seconds
                setTimeout(() => setSuccessMessage(null), 5000);
            } else {
                setError('Failed to submit withdrawal request. Please try again.');
            }

        } catch (err) {
            console.error('Error submitting withdrawal:', err);
            setError('An error occurred while processing your request');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusIcon = (status: string | null) => {
        switch (status) {
            case WithdrawalStatus.COMPLETED: return <CheckCircle size={14} />;
            case WithdrawalStatus.PENDING: return <Clock size={14} />;
            case WithdrawalStatus.PROCESSING: return <Clock size={14} />;
            case WithdrawalStatus.FAILED: return <XCircle size={14} />;
            case WithdrawalStatus.CANCELLED: return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case WithdrawalStatus.COMPLETED: return 'status-completed';
            case WithdrawalStatus.PENDING: return 'status-pending';
            case WithdrawalStatus.PROCESSING: return 'status-pending';
            case WithdrawalStatus.FAILED: return 'status-failed';
            case WithdrawalStatus.CANCELLED: return 'status-failed';
            default: return 'status-pending';
        }
    };

    const getTransactionIcon = (type: string) => {
        return <ArrowUpRight size={14} />;
    };

    const getTransactionType = (type: string) => {
        return 'Withdrawal';
    };

    const getAmountColor = (type: string) => {
        return 'amount-negative';
    };

    const getAmountPrefix = (type: string) => {
        return '-';
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-KE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (affiliateLoading || loading) {
        return (
            <div className="transactions-container">
                <div className="loading-state">Loading Wallet...</div>
            </div>
        );
    }

    if (!affiliateCode) {
        return (
            <div className="transactions-container">
                <div className="error-state">
                    <AlertCircle size={24} />
                    <p>No affiliate account found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="transactions-container">
            <div className="transactions-header">
                <h2>Wallet & Transactions</h2>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="alert alert-error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {successMessage && (
                <div className="alert alert-success">
                    <CheckCircle size={16} />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Wallet Balance */}
            <div className="wallet-section">
                <div className="wallet-card">
                    <div className="wallet-header">
                        <div className="wallet-icon">
                            <Wallet size={18} />
                        </div>
                        <div className="wallet-info">
                            <span className="wallet-label">Available Balance</span>
                            <span className="wallet-amount">KSh {balance.toLocaleString()}</span>
                        </div>
                    </div>
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
                                min="500"
                                max={balance}
                                required
                                disabled={submitting}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">M-Pesa Phone Number</label>
                            <div className="phone-input-container">
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="07********"
                                    pattern="0[0-9]{9}"
                                    required
                                    disabled={submitting}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="withdraw-btn"
                            disabled={
                                submitting ||
                                !withdrawAmount ||
                                !phoneNumber ||
                                parseFloat(withdrawAmount) > balance ||
                                parseFloat(withdrawAmount) < 500 ||
                                parseFloat(withdrawAmount) > 5000
                            }

                        >
                            {submitting ? 'Processing...' : 'Withdraw Now'}
                        </button>
                        <div className="withdrawal-note">
                            Min-withdrawal: KSh 500 • Max-withdrawal: Ksh 5000
                             • Processed within 24 hours
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
                            className={`filter-btn ${activeFilter === WithdrawalStatus.COMPLETED ? 'active' : ''}`}
                            onClick={() => setActiveFilter(WithdrawalStatus.COMPLETED)}
                        >
                            Completed
                        </button>
                        <button
                            className={`filter-btn ${activeFilter === WithdrawalStatus.PENDING ? 'active' : ''}`}
                            onClick={() => setActiveFilter(WithdrawalStatus.PENDING)}
                        >
                            Pending
                        </button>
                        <button
                            className={`filter-btn ${activeFilter === WithdrawalStatus.FAILED ? 'active' : ''}`}
                            onClick={() => setActiveFilter(WithdrawalStatus.FAILED)}
                        >
                            Failed
                        </button>
                    </div>
                </div>

                <div className="transactions-list">
                    {filteredTransactions.length === 0 ? (
                        <div className="empty-state">
                            <p>No transactions found</p>
                        </div>
                    ) : (
                        filteredTransactions.map(transaction => (
                            <div key={transaction.id} className="transaction-item">
                                <div className="transaction-icon">
                                    {getTransactionIcon('withdrawal')}
                                </div>
                                <div className="transaction-details">
                                    <div className="transaction-main">
                                        <span className="transaction-type">
                                            {getTransactionType('withdrawal')}
                                        </span>
                                        <span className={`transaction-amount ${getAmountColor('withdrawal')}`}>
                                            {getAmountPrefix('withdrawal')}KSh {Number(transaction.amount).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="transaction-meta">
                                        <span className="transaction-date">{formatDate(transaction.created_at)}</span>
                                        {transaction.phone_number && (
                                            <span className="transaction-phone">
                                                {transaction.phone_number}
                                            </span>
                                        )}
                                        <span
                                            className="transaction-reference"
                                            onClick={() => copyToClipboard(`WD-${transaction.id}`)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            WD-{transaction.id}
                                            <Copy size={10} />
                                        </span>
                                    </div>
                                    {transaction.reason_of_status && (
                                        <div className="transaction-reason">
                                            {transaction.reason_of_status}
                                        </div>
                                    )}
                                </div>
                                <div className={`transaction-status ${getStatusColor(transaction.status)}`}>
                                    {getStatusIcon(transaction.status)}
                                    <span>{transaction.status || 'pending'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Transactions;