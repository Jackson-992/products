import './OrderTable.css';
import { useState, useMemo } from 'react';
import OrderDetails from './OrderDetails';
import { useOrders } from '@/hooks/useOrders.ts';

const OrderTable = () => {
    const { orders, loading, error, getOrderWithItems } = useOrders();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
    const [filters, setFilters] = useState({
        orderId: '',
        userId: '',
        phone: ''
    });

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            orderId: '',
            userId: '',
            phone: ''
        });
    };

    // Filter orders based on search criteria
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesOrderId = filters.orderId ?
                order.id.toString().includes(filters.orderId) : true;

            const matchesUserId = filters.userId ?
                order.user_id.toString().includes(filters.userId) : true;

            const matchesPhone = filters.phone ?
                order.phone_number.toLowerCase().includes(filters.phone.toLowerCase()) : true;

            return matchesOrderId && matchesUserId && matchesPhone;
        });
    }, [orders, filters]);

    const handleOrderClick = async (order) => {
        try {
            setLoadingOrderDetails(true);
            const orderWithItems = await getOrderWithItems(order.id);
            setSelectedOrder(orderWithItems);
            setIsSidebarOpen(true);
        } catch (err) {
            console.error('Error loading order details:', err);
            // Fallback to basic order data if details fail
            setSelectedOrder(order);
            setIsSidebarOpen(true);
        } finally {
            setLoadingOrderDetails(false);
        }
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedOrder(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'status-completed';
            case 'pending':
                return 'status-pending';
            case 'processing':
                return 'status-processing';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return 'status-default';
        }
    };

    const formatAmount = (amount) => {
        return typeof amount === 'number' ? amount.toFixed(2) : '0.00';
    };

    const hasActiveFilters = filters.orderId || filters.userId || filters.phone;

    if (loading) {
        return <div className="loading">Loading orders...</div>;
    }

    if (error) {
        return (
            <div className="error-state">
                {error}
                <button onClick={() => window.location.reload()} className="retry-btn">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="order-table-container">
            <div className="table-header">
                <div className="header-left">
                    <h2>Orders</h2>
                    <span className="order-count">{filteredOrders.length} of {orders.length} orders</span>
                </div>
                {hasActiveFilters && (
                    <button onClick={clearFilters} className="clear-filters-btn">
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Filters Section */}
            <div className="filters-container">
                <div className="filter-group">
                    <label htmlFor="orderId-filter">Order ID:</label>
                    <input
                        id="orderId-filter"
                        type="text"
                        placeholder="Filter by Order ID..."
                        value={filters.orderId}
                        onChange={(e) => handleFilterChange('orderId', e.target.value)}
                        className="filter-input"
                    />
                </div>

                <div className="filter-group">
                    <label htmlFor="userId-filter">User ID:</label>
                    <input
                        id="userId-filter"
                        type="text"
                        placeholder="Filter by User ID..."
                        value={filters.userId}
                        onChange={(e) => handleFilterChange('userId', e.target.value)}
                        className="filter-input"
                    />
                </div>

                <div className="filter-group">
                    <label htmlFor="phone-filter">Phone:</label>
                    <input
                        id="phone-filter"
                        type="text"
                        placeholder="Filter by Phone..."
                        value={filters.phone}
                        onChange={(e) => handleFilterChange('phone', e.target.value)}
                        className="filter-input"
                    />
                </div>
            </div>

            {/* Orders Table */}
            <div className="table-wrapper">
                <table className="orders-table">
                    <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>User Name</th>
                        <th className="hide-on-mobile">User ID</th>
                        <th className="hide-on-small">Phone</th>
                        <th className="text-right">Amount</th>
                        <th className="text-center">Status</th>
                        <th className="hide-on-small">Date Created</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <tr
                                key={order.id}
                                className="Order-row"
                                onClick={() => handleOrderClick(order)}
                            >
                                <td className="Order-id">{order.id.toString()}</td>
                                <td className="User-name">{order.user_name}</td>
                                <td className="user-id hide-on-mobile">{order.user_id.toString()}</td>
                                <td className="phone hide-on-small">{order.phone_number}</td>
                                <td className="amount text-right">Ksh {formatAmount(order.total_amount)}</td>
                                <td className="status text-center">
                                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="date-created hide-on-small">
                                    {formatDate(order.created_at)}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="no-results">
                                {hasActiveFilters ? 'No orders match your filters' : 'No orders found'}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <OrderDetails
                order={selectedOrder}
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
                loading={loadingOrderDetails}
            />
        </div>
    );
};

export default OrderTable;