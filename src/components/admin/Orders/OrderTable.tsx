import './OrderTable.css';
import { useState, useMemo } from 'react';
import OrderDetails from './OrderDetails';
import { useOrders } from './useOrders';

const OrderTable = () => {
    const { orders, loading } = useOrders();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
                order.order_id.toLowerCase().includes(filters.orderId.toLowerCase()) : true;

            const matchesUserId = filters.userId ?
                order.user_id.toLowerCase().includes(filters.userId.toLowerCase()) : true;

            const matchesPhone = filters.phone ?
                order.phone.toLowerCase().includes(filters.phone.toLowerCase()) : true;

            return matchesOrderId && matchesUserId && matchesPhone;
        });
    }, [orders, filters]);

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
        setIsSidebarOpen(true);
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
        switch (status.toLowerCase()) {
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

    const hasActiveFilters = filters.orderId || filters.userId || filters.phone;

    if (loading) {
        return <div className="loading">Loading orders...</div>;
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
                        <th className="text-left">Order ID</th>
                        <th className="text-left">User Name</th>
                        <th className="text-left hide-on-mobile">User ID</th>
                        <th className="text-left hide-on-small">Phone</th>
                        <th className="text-right">Amount</th>
                        <th className="text-center">Status</th>
                        <th className="text-left hide-on-small">Date Created</th>
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
                                <td className="Order-id text-left">{order.order_id}</td>
                                <td className="User-name text-left">{order.user_name}</td>
                                <td className="user-id text-left hide-on-mobile">{order.user_id}</td>
                                <td className="phone text-left hide-on-small">{order.phone}</td>
                                <td className="amount text-right">${order.amount}</td>
                                <td className="status text-center">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                                </td>
                                <td className="date-created text-left hide-on-small">
                                    {formatDate(order.created_at)}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="no-results text-center">
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
            />
        </div>
    );
};

export default OrderTable;