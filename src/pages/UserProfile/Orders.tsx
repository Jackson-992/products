import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, DollarSign, MapPin, Phone } from 'lucide-react';
import { supabase } from '@/services/supabase';
import './Orders.css';

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const getUserProfile = async () => {
            try {
                // First get the auth user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setLoading(false);
                    return;
                }

                // Then get the user profile with integer ID
                const { data: profile, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('auth_id', user.id)
                    .single();

                if (error) throw error;
                setUserProfile(profile);
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setLoading(false);
            }
        };

        getUserProfile();
    }, []);

    useEffect(() => {
        if (userProfile && userProfile.id) {
            fetchUserOrders();
        }
    }, [userProfile]);

    const fetchUserOrders = async () => {
        try {
            setLoading(true);

            console.log('Fetching orders for user ID:', userProfile.id);

            // Fetch orders with their order items using the user_profile ID
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (*)
                `)
                .eq('user_id', userProfile.id)
                .order('created_at', { ascending: false });

            if (ordersError) {
                console.error('Error fetching orders:', ordersError);
                throw ordersError;
            }

            console.log('Raw orders data:', ordersData);

            // Transform the data to match the component's expected format
            const transformedOrders = ordersData.map(order => ({
                id: `ORD-${order.id.toString().padStart(3, '0')}`,
                databaseId: order.id,
                date: order.created_at,
                status: mapOrderStatus(order.status, order.payment_completion),
                total: parseFloat(order.total_amount),
                items: order.order_items.map(item => ({
                    id: item.id,
                    productId: item.product_id,
                    name: item.product_name || 'Product',
                    price: parseFloat(item.price),
                    quantity: item.quantity,
                })),
                shippingAddress: {
                    fullName: userProfile?.name || "Customer",
                    street: "123 Main Street",
                    city: "Nairobi",
                    state: "Nairobi County",
                    zipCode: "00100",
                    country: "Kenya",
                    phone: order.phone_number || userProfile?.phone || "+254712345678"
                },
                payment: {
                    method: "mpesa", // Default to M-Pesa since no credit cards
                    phone: order.phone_number, // Use the phone number from orders table
                    transactionId: `TXN-${order.id.toString().padStart(6, '0')}`,
                    amount: parseFloat(order.total_amount),
                    status: order.payment_completion ? "completed" : "pending"
                },
                shipping: {
                    method: "standard",
                    cost: 0,
                    trackingNumber: null,
                    estimatedDelivery: calculateEstimatedDelivery(order.created_at)
                }
            }));

            console.log('Transformed orders:', transformedOrders);
            setOrders(transformedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    // Map database status to component status
    const mapOrderStatus = (dbStatus, paymentCompletion) => {
        // If payment is not completed, show as processing (payment pending)
        if (!paymentCompletion) return 'processing';

        switch (dbStatus?.toLowerCase()) {
            case 'pending':
                return 'processing';
            case 'confirmed':
                return 'processing';
            case 'shipped':
                return 'shipped';
            case 'delivered':
                return 'delivered';
            case 'cancelled':
                return 'cancelled';
            default:
                return 'processing';
        }
    };

    const calculateEstimatedDelivery = (orderDate) => {
        const deliveryDate = new Date(orderDate);
        deliveryDate.setDate(deliveryDate.getDate() + 7);
        return deliveryDate.toISOString().split('T')[0];
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return <CheckCircle className="status-icon delivered" />;
            case 'shipped':
                return <Truck className="status-icon shipped" />;
            case 'processing':
                return <Package className="status-icon processing" />;
            case 'cancelled':
                return <XCircle className="status-icon cancelled" />;
            default:
                return <Clock className="status-icon processing" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'delivered':
                return 'Delivered';
            case 'shipped':
                return 'Shipped';
            case 'processing':
                return 'Processing';
            case 'cancelled':
                return 'Cancelled';
            default:
                return 'Processing';
        }
    };

    const getPaymentMethodText = (method) => {
        switch (method) {
            case 'mpesa':
                return 'M-Pesa';
            case 'cash_on_delivery':
                return 'Cash on Delivery';
            default:
                return 'M-Pesa'; // Default to M-Pesa
        }
    };

    const getPaymentMethodIcon = (method) => {
        return <DollarSign className="payment-icon" />;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filter orders based on active tab
    const filteredOrders = orders.filter(order => {
        if (activeTab === 'completed') {
            return order.status === 'delivered' || order.status === 'cancelled';
        } else if (activeTab === 'pending') {
            return order.status === 'processing' || order.status === 'shipped';
        }
        return true;
    });

    const completedOrdersCount = orders.filter(order =>
        order.status === 'delivered' || order.status === 'cancelled'
    ).length;

    const pendingOrdersCount = orders.filter(order =>
        order.status === 'processing' || order.status === 'shipped'
    ).length;

    if (loading) {
        return (
            <div className="orders-container">
                <div className="orders-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your orders...</p>
                </div>
            </div>
        );
    }

    // Show login prompt if no user profile
    if (!userProfile) {
        return (
            <div className="orders-container">
                <div className="orders-header">
                    <button
                        className="back-button"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>
                    <div className="orders-title-section">
                        <Package className="orders-icon" />
                        <h1 className="orders-title">My Orders</h1>
                    </div>
                </div>
                <div className="empty-orders">
                    <Package className="empty-package" />
                    <h2>Please Log In</h2>
                    <p>You need to be logged in to view your orders</p>
                    <button
                        className="start-shopping-btn"
                        onClick={() => navigate('/login')}
                    >
                        Log In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-container">
            <div className="orders-header">
                <button
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={20} />
                    Back
                </button>
                <div className="orders-title-section">
                    <Package className="orders-icon" />
                    <h1 className="orders-title">My Orders</h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="orders-tabs">
                <button
                    className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    <span className="tab-label">Pending</span>
                    <span className="tab-count">{pendingOrdersCount}</span>
                </button>
                <button
                    className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    <span className="tab-label">Completed</span>
                    <span className="tab-count">{completedOrdersCount}</span>
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="empty-orders">
                    <Package className="empty-package" />
                    <h2>No orders yet</h2>
                    <p>Start shopping to see your orders here</p>
                    <button
                        className="start-shopping-btn"
                        onClick={() => navigate('/products')}
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="orders-content">
                    <div className="orders-list">
                        {filteredOrders.length === 0 ? (
                            <div className="no-orders-message">
                                <Package className="no-orders-icon" />
                                <h3>No {activeTab} orders</h3>
                                <p>
                                    {activeTab === 'pending'
                                        ? "You don't have any pending orders at the moment."
                                        : "You don't have any completed orders yet."
                                    }
                                </p>
                            </div>
                        ) : (
                            filteredOrders.map((order) => (
                                <div
                                    key={order.databaseId}
                                    className={`order-card ${selectedOrder?.databaseId === order.databaseId ? 'selected' : ''}`}
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <div className="order-header">
                                        <div className="order-info">
                                            <h3 className="order-id">{order.id}</h3>
                                            <span className="order-date">{formatDate(order.date)}</span>
                                        </div>
                                        <div className="order-status">
                                            {getStatusIcon(order.status)}
                                            <span className={`status-text ${order.status}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="order-items-preview">
                                        {order.items.slice(0, 2).map((item) => (
                                            <div key={item.id} className="preview-item">
                                                <div className="preview-details">
                                                    <span className="preview-name">{item.name}</span>
                                                    <span className="preview-quantity">Qty: {item.quantity}</span>
                                                    <span className="preview-price">Ksh {item.price.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {order.items.length > 2 && (
                                            <div className="more-items">
                                                +{order.items.length - 2} more items
                                            </div>
                                        )}
                                    </div>

                                    <div className="order-footer">
                                        <div className="order-total">
                                            Total: <strong>Ksh {order.total.toLocaleString()}</strong>
                                        </div>
                                        <div className="order-payment">
                                            {getPaymentMethodIcon(order.payment.method)}
                                            <span>{getPaymentMethodText(order.payment.method)} • {order.payment.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Order Details Sidebar */}
                    {selectedOrder && (
                        <div className="order-details-sidebar">
                            <div className="sidebar-header">
                                <h2>Order Details</h2>
                                <button
                                    className="close-sidebar"
                                    onClick={() => setSelectedOrder(null)}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="order-details-content">
                                {/* Order Summary */}
                                <div className="detail-section">
                                    <h3>Order Summary</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span>Order ID:</span>
                                            <span>{selectedOrder.id}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span>Order Date:</span>
                                            <span>{formatDate(selectedOrder.date)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span>Status:</span>
                                            <span className={`status-badge ${selectedOrder.status}`}>
                                                {getStatusIcon(selectedOrder.status)}
                                                {getStatusText(selectedOrder.status)}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span>Payment:</span>
                                            <span className={`payment-status ${selectedOrder.payment.status}`}>
                                                {selectedOrder.payment.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="detail-section">
                                    <h3>Items ({selectedOrder.items.length})</h3>
                                    <div className="items-list">
                                        {selectedOrder.items.map((item) => (
                                            <div key={item.id} className="order-item">
                                                <div className="item-details">
                                                    <h4 className="item-name">{item.name}</h4>
                                                    <div className="item-price">
                                                        Ksh {item.price.toLocaleString()} × {item.quantity}
                                                    </div>
                                                </div>
                                                <div className="item-total">
                                                    Ksh {(item.price * item.quantity).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="detail-section">
                                    <h3>Shipping Address</h3>
                                    <div className="address-card">
                                        <MapPin className="address-icon" />
                                        <div className="address-details">
                                            <strong>{selectedOrder.shippingAddress.fullName}</strong>
                                            <p>{selectedOrder.shippingAddress.street}</p>
                                            <p>
                                                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                                            </p>
                                            <p>{selectedOrder.shippingAddress.country}</p>
                                            <div className="contact-info">
                                                <Phone size={14} />
                                                <span>{selectedOrder.shippingAddress.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Details */}
                                <div className="detail-section">
                                    <h3>Payment Details</h3>
                                    <div className="payment-card">
                                        {getPaymentMethodIcon(selectedOrder.payment.method)}
                                        <div className="payment-details">
                                            <div className="payment-method">
                                                {getPaymentMethodText(selectedOrder.payment.method)}
                                            </div>
                                            <div className="phone-info">
                                                Phone: {selectedOrder.payment.phone}
                                            </div>
                                            <div className="transaction-id">
                                                Transaction ID: {selectedOrder.payment.transactionId}
                                            </div>
                                            <div className="payment-status">
                                                Status: <span className={`status ${selectedOrder.payment.status}`}>
                                                    {selectedOrder.payment.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Info */}
                                <div className="detail-section">
                                    <h3>Shipping Information</h3>
                                    <div className="shipping-card">
                                        <Truck className="shipping-icon" />
                                        <div className="shipping-details">
                                            <div className="shipping-method">
                                                {selectedOrder.shipping.method === 'express' ? 'Express Shipping' : 'Standard Shipping'}
                                            </div>
                                            {selectedOrder.shipping.trackingNumber && (
                                                <div className="tracking-info">
                                                    Tracking: {selectedOrder.shipping.trackingNumber}
                                                </div>
                                            )}
                                            {selectedOrder.shipping.estimatedDelivery && (
                                                <div className="delivery-info">
                                                    Estimated Delivery: {new Date(selectedOrder.shipping.estimatedDelivery).toLocaleDateString()}
                                                </div>
                                            )}
                                            <div className="shipping-cost">
                                                Shipping Cost: {selectedOrder.shipping.cost === 0 ? 'FREE' : `Ksh ${selectedOrder.shipping.cost.toLocaleString()}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Total */}
                                <div className="detail-section total-section">
                                    <h3>Order Total</h3>
                                    <div className="total-breakdown">
                                        <div className="total-row">
                                            <span>Subtotal:</span>
                                            <span>Ksh {selectedOrder.total.toLocaleString()}</span>
                                        </div>
                                        <div className="total-row">
                                            <span>Shipping:</span>
                                            <span>{selectedOrder.shipping.cost === 0 ? 'FREE' : `Ksh ${selectedOrder.shipping.cost.toLocaleString()}`}</span>
                                        </div>
                                        <div className="total-divider"></div>
                                        <div className="total-row grand-total">
                                            <span>Total:</span>
                                            <span>Ksh {(selectedOrder.total + selectedOrder.shipping.cost).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Orders;