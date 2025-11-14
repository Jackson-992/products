import './OrderDetails.css';

const OrderDetails = ({ order, isOpen, onClose, loading = false }) => {
    if (!isOpen) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusClass = (status) => {
        if (!status) return 'status-default';

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

    const formatAmount = (amount) => {
        return typeof amount === 'number' ? amount.toFixed(2) : '0.00';
    };

    if (loading) {
        return (
            <>
                <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
                <div className={`order-details-sidebar ${isOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <h3>Order Details</h3>
                        <button className="close-btn" onClick={onClose}>×</button>
                    </div>
                    <div className="loading-sidebar">Loading order details...</div>
                </div>
            </>
        );
    }

    if (!order) return null;

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
            <div className={`Order-details-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Order Details</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="sidebar-content">
                    {/* Order Summary */}
                    <div className="section">
                        <h4>Order Summary</h4>
                        <div className="summary-grid">
                            <div className="summary-item">
                                <label>Order ID:</label>
                                <span>{order.id}</span>
                            </div>
                            <div className="summary-item">
                                <label>Status:</label>
                                <span className={`status-badge ${getStatusClass(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="summary-item">
                                <label>Date Created:</label>
                                <span>{formatDate(order.created_at)}</span>
                            </div>
                            <div className="summary-item">
                                <label>Total Amount:</label>
                                <span className="amount">Ksh {formatAmount(order.total_amount)}</span>
                            </div>
                            {/*<div className="summary-item">*/}
                            {/*    <label>Payment Completed:</label>*/}
                            {/*    <span>{order.payment_completion ? 'Yes' : 'No'}</span>*/}
                            {/*</div>*/}
                        </div>
                    </div>

                    {/* User Information */}
                    <div className="section">
                        <h4>User Information</h4>
                        <div className="summary-grid">
                            <div className="summary-item">
                                <label>User Name:</label>
                                <span>{order.user_name}</span>
                            </div>
                            <div className="summary-item">
                                <label>User ID:</label>
                                <span>{order.user_id}</span>
                            </div>
                            <div className="summary-item">
                                <label>Phone:</label>
                                <span>{order.phone_number}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="section">
                        <h4>Order Items ({order.order_items?.length || 0})</h4>
                        <div className="products-list">
                            {order.order_items && order.order_items.length > 0 ? (
                                order.order_items.map((item, index) => (
                                    <div key={item.id || index} className="product-item">
                                        <div className="product-info">
                                            <div className="product-name">
                                                {item.product_name || `Product ${item.product_id}`}
                                            </div>
                                            <div className="Product-details">
                                                {item.color && <span>Color: {item.color}</span>}
                                                {item.size && <span>Size: {item.size}</span>}
                                                {item.product_sku && <span>SKU: {item.product_sku}</span>}
                                            </div>
                                            {item.affiliate_code && (
                                                <div className="affiliate-code">
                                                    Affiliate: {item.affiliate_code}
                                                </div>
                                            )}
                                        </div>
                                        <div className="product-quantity">
                                            Qty: {item.quantity}
                                        </div>
                                        <div className="product-price">
                                            Ksh {formatAmount(item.price)}
                                        </div>
                                        {item.commission_earned > 0 && (
                                            <div className="product-commission">
                                                Commission: Ksh {formatAmount(item.commission_earned)}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="no-items">No items found for this order</div>
                            )}
                        </div>
                    </div>

                    {/* Order Total */}
                    <div className="section total-section">
                        <div className="order-total">
                            <div className="total-label">Order Total:</div>
                            <div className="total-amount">Ksh {formatAmount(order.total_amount)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderDetails;