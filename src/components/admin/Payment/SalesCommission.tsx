import './Sales.css';
import { useState } from 'react';
import PaymentDetails from './PaymentDetails';
import { useSales } from '@/hooks/payments/useSales.ts';

const SalesCommission = () => {
    const { payments, loading } = useSales();
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const salesPayments = payments.filter(p => p.type === 'sales_commission');

    const handlePaymentClick = (payment) => {
        setSelectedPayment(payment);
        setIsSidebarOpen(true);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedPayment(null);
    };

    const filteredPayments = salesPayments.filter(payment => {
        const matchesSearch =
            payment.payment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.affiliate_code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
        return matchesSearch && matchesStatus;
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
        const classes = {
            completed: 'status-completed',
            pending: 'status-pending',
            failed: 'status-failed',
            processing: 'status-processing'
        };
        return classes[status] || 'status-default';
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
    };

    const hasActiveFilters = searchTerm || statusFilter !== 'all';
    const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

    if (loading) {
        return <div className="loading">Loading sales commissions...</div>;
    }

    return (
        <div className="sales-commission-container">
            <div className="table-header">
                <div className="header-left">
                    <h2>Sales Commission</h2>
                    <span className="payment-count">
                        {filteredPayments.length} of {salesPayments.length} payments
                    </span>
                    <span className="total-amount">
                        Total: Ksh {totalAmount.toLocaleString()}
                    </span>
                </div>

                {hasActiveFilters && (
                    <button onClick={clearFilters} className="clear-filters-btn">
                        Clear Filters
                    </button>
                )}
            </div>

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

            <div className="table-wrapper">
                <table className="payments-table">
                    <thead>
                    <tr>
                        <th>COmmission ID</th>
                        <th>Affiliate Code</th>
                        <th>Amount</th>
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
                            <td colSpan="5" className="no-results">
                                {hasActiveFilters ? 'No payments match your filters' : 'No sales commissions found'}
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

export default SalesCommission;