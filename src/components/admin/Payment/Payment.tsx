import './Payment.css';
import { useState } from 'react';
import PaymentDetails from './PaymentDetails';
import { usePayments } from './usePayments';

const Payment = () => {
    const { payments, loading } = usePayments();
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const handlePaymentClick = (payment) => {
        setSelectedPayment(payment);
        setIsSidebarOpen(true);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedPayment(null);
    };

    // Filter payments
    const filteredPayments = payments.filter(payment => {
        const matchesSearch =
            payment.payment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.affiliate_code.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'all' || payment.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'completed':
                return 'status-completed';
            case 'pending':
                return 'status-pending';
            case 'failed':
                return 'status-failed';
            case 'processing':
                return 'status-processing';
            default:
                return 'status-default';
        }
    };

    const getTypeClass = (type) => {
        switch (type) {
            case 'withdrawal':
                return 'type-withdrawal';
            case 'sales_commission':
                return 'type-sales';
            case 'referral_commission':
                return 'type-referral';
            default:
                return 'type-default';
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setTypeFilter('all');
        setStatusFilter('all');
    };

    const hasActiveFilters = searchTerm || typeFilter !== 'all' || statusFilter !== 'all';

    if (loading) {
        return <div className="loading">Loading payments...</div>;
    }

    return (
        <div className="payment-table-container">
            <div className="table-header">
                <div className="header-left">
                    <h2>Payment History</h2>
                    <span className="payment-count">
            {filteredPayments.length} of {payments.length} payments
          </span>
                </div>

                {hasActiveFilters && (
                    <button onClick={clearFilters} className="clear-filters-btn">
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Filters Section */}
            <div className="filters-container">
                <div className="search-group">
                    <label>Search:</label>
                    <input
                        type="text"
                        placeholder="Search by Payment ID or Affiliate Code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="Filter-group">
                    <label>Type:</label>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Types</option>
                        <option value="withdrawal">Withdrawal</option>
                        <option value="sales_commission">Sales Commission</option>
                        <option value="referral_commission">Referral Commission</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Status:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </div>

            {/* Payments Table */}
            <div className="Table-wrapper">
                <table className="payments-table">
                    <thead>
                    <tr>
                        <th>Payment ID</th>
                        <th>Affiliate Code</th>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th className="hide-on-mobile">Date Created</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredPayments.length > 0 ? (
                        filteredPayments.map((payment) => (
                            <tr
                                key={payment.id}
                                className="Payment-row"
                                onClick={() => handlePaymentClick(payment)}
                            >
                                <td className="payment-id">{payment.payment_id}</td>
                                <td className="affiliate-code">
                                    <span className="code-badge">{payment.affiliate_code}</span>
                                </td>
                                <td className="amount">
                                    Ksh {payment.amount.toLocaleString()}
                                </td>
                                <td className="payment-type">
                    <span className={`type-badge ${getTypeClass(payment.type)}`}>
                      {payment.type.replace('_', ' ')}
                    </span>
                                </td>
                                <td className="status">
                    <span className={`status-badge ${getStatusClass(payment.status)}`}>
                      {payment.status}
                    </span>
                                </td>
                                <td className="date-created hide-on-mobile">
                                    {formatDate(payment.created_at)}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="no-results">
                                {hasActiveFilters ? 'No payments match your filters' : 'No payments found'}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <PaymentDetails
                payment={selectedPayment}
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
            />
        </div>
    );
};

export default Payment;