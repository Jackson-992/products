import './OrderDetails.css';

const OrderDetails = ({ order, isOpen, onClose }) => {
    if (!isOpen || !order) return null;

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
                                <span>{order.order_id}</span>
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
                                <span className="amount">${order.amount}</span>
                            </div>
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
                                <span>{order.phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Products */}
                    <div className="section">
                        <h4>Products ({order.products.length})</h4>
                        <div className="products-list">
                            {order.products.map((product, index) => (
                                <div key={product.id || index} className="product-item">
                                    <div className="product-info">
                                        <div className="product-name">{product.name}</div>
                                        <div className="product-id">ID: {product.id}</div>
                                    </div>
                                    <div className="product-quantity">
                                        Qty: {product.quantity}
                                    </div>
                                    <div className="product-price">
                                        ${product.price}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Total */}
                    <div className="section total-section">
                        <div className="order-total">
                            <div className="total-label">Order Total:</div>
                            <div className="total-amount">${order.amount}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderDetails;