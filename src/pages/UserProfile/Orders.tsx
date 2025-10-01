import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, CreditCard, DollarSign, MapPin, Phone, Mail } from 'lucide-react';
import './Orders.css'

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');

    // Mock data - replace with actual data from your backend
    const mockOrders = [
        {
            id: 'ORD-001',
            date: '2024-01-15T10:30:00Z',
            status: 'delivered',
            total: 29497,
            items: [
                {
                    id: 1,
                    name: "Wireless Bluetooth Headphones",
                    price: 7999,
                    quantity: 2,
                    image: "/api/placeholder/300/300",
                    category: "Electronics"
                },
                {
                    id: 2,
                    name: "Smart Fitness Watch",
                    price: 12999,
                    quantity: 1,
                    image: "/api/placeholder/300/300",
                    category: "Electronics"
                }
            ],
            shippingAddress: {
                fullName: "John Doe",
                street: "123 Main Street",
                city: "Nairobi",
                state: "Nairobi County",
                zipCode: "00100",
                country: "Kenya",
                phone: "+254712345678"
            },
            payment: {
                method: "credit_card",
                cardLast4: "4242",
                cardBrand: "visa",
                transactionId: "TXN-789012",
                amount: 29497,
                status: "completed"
            },
            shipping: {
                method: "standard",
                cost: 300,
                trackingNumber: "TRK-123456789",
                estimatedDelivery: "2024-01-20"
            }
        },
        {
            id: 'ORD-002',
            date: '2024-01-10T14:20:00Z',
            status: 'shipped',
            total: 1499,
            items: [
                {
                    id: 3,
                    name: "Organic Cotton T-Shirt",
                    price: 1499,
                    quantity: 1,
                    image: "/api/placeholder/300/300",
                    category: "Clothing"
                }
            ],
            shippingAddress: {
                fullName: "John Doe",
                street: "123 Main Street",
                city: "Nairobi",
                state: "Nairobi County",
                zipCode: "00100",
                country: "Kenya",
                phone: "+254712345678"
            },
            payment: {
                method: "mpesa",
                phone: "+254712345678",
                transactionId: "MPE-456789",
                amount: 1499,
                status: "completed"
            },
            shipping: {
                method: "express",
                cost: 500,
                trackingNumber: "TRK-987654321",
                estimatedDelivery: "2024-01-13"
            }
        },
        {
            id: 'ORD-003',
            date: '2024-01-18T09:15:00Z',
            status: 'processing',
            total: 8997,
            items: [
                {
                    id: 4,
                    name: "USB-C Charging Cable",
                    price: 1999,
                    quantity: 3,
                    image: "/api/placeholder/300/300",
                    category: "Electronics"
                },
                {
                    id: 5,
                    name: "Phone Case",
                    price: 999,
                    quantity: 2,
                    image: "/api/placeholder/300/300",
                    category: "Accessories"
                }
            ],
            shippingAddress: {
                fullName: "John Doe",
                street: "123 Main Street",
                city: "Nairobi",
                state: "Nairobi County",
                zipCode: "00100",
                country: "Kenya",
                phone: "+254712345678"
            },
            payment: {
                method: "paypal",
                email: "john.doe@example.com",
                transactionId: "PPL-123456",
                amount: 8997,
                status: "completed"
            },
            shipping: {
                method: "standard",
                cost: 0,
                trackingNumber: null,
                estimatedDelivery: "2024-01-25"
            }
        },
        {
            id: 'ORD-004',
            date: '2024-01-17T16:45:00Z',
            status: 'processing',
            total: 25998,
            items: [
                {
                    id: 6,
                    name: "Gaming Laptop",
                    price: 25998,
                    quantity: 1,
                    image: "/api/placeholder/300/300",
                    category: "Electronics"
                }
            ],
            shippingAddress: {
                fullName: "John Doe",
                street: "123 Main Street",
                city: "Nairobi",
                state: "Nairobi County",
                zipCode: "00100",
                country: "Kenya",
                phone: "+254712345678"
            },
            payment: {
                method: "credit_card",
                cardLast4: "4242",
                cardBrand: "visa",
                transactionId: "TXN-345678",
                amount: 25998,
                status: "completed"
            },
            shipping: {
                method: "standard",
                cost: 0,
                trackingNumber: null,
                estimatedDelivery: "2024-01-24"
            }
        },
        {
            id: 'ORD-005',
            date: '2023-12-20T16:45:00Z',
            status: 'cancelled',
            total: 15999,
            items: [
                {
                    id: 7,
                    name: "Smartphone",
                    price: 15999,
                    quantity: 1,
                    image: "/api/placeholder/300/300",
                    category: "Electronics"
                }
            ],
            shippingAddress: {
                fullName: "John Doe",
                street: "123 Main Street",
                city: "Nairobi",
                state: "Nairobi County",
                zipCode: "00100",
                country: "Kenya",
                phone: "+254712345678"
            },
            payment: {
                method: "credit_card",
                cardLast4: "4242",
                cardBrand: "visa",
                transactionId: "TXN-345678",
                amount: 15999,
                status: "refunded"
            },
            shipping: {
                method: "standard",
                cost: 0,
                trackingNumber: null,
                estimatedDelivery: null
            }
        }
    ];

    useEffect(() => {
        // Simulate API call to fetch orders
        setTimeout(() => {
            setOrders(mockOrders);
            setLoading(false);
        }, 1000);
    }, []);

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
            case 'credit_card':
                return 'Credit Card';
            case 'mpesa':
                return 'M-Pesa';
            case 'paypal':
                return 'PayPal';
            case 'cash_on_delivery':
                return 'Cash on Delivery';
            default:
                return method;
        }
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'credit_card':
                return <CreditCard className="payment-icon" />;
            case 'mpesa':
                return <DollarSign className="payment-icon" />;
            case 'paypal':
                return <DollarSign className="payment-icon" />;
            case 'cash_on_delivery':
                return <DollarSign className="payment-icon" />;
            default:
                return <CreditCard className="payment-icon" />;
        }
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
                                    key={order.id}
                                    className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
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
                                        {order.items.slice(0, 2).map((item, index) => (
                                            <div key={index} className="preview-item">
                                                <img src={item.image} alt={item.name} className="preview-image" />
                                                <div className="preview-details">
                                                    <span className="preview-name">{item.name}</span>
                                                    <span className="preview-quantity">Qty: {item.quantity}</span>
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
                                            <span>{getPaymentMethodText(order.payment.method)}</span>
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
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="detail-section">
                                    <h3>Items ({selectedOrder.items.length})</h3>
                                    <div className="items-list">
                                        {selectedOrder.items.map((item) => (
                                            <div key={item.id} className="order-item">
                                                <img src={item.image} alt={item.name} className="item-image" />
                                                <div className="item-details">
                                                    <h4 className="item-name">{item.name}</h4>
                                                    <span className="item-category">{item.category}</span>
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
                                            {selectedOrder.payment.method === 'credit_card' && (
                                                <div className="card-info">
                                                    **** **** **** {selectedOrder.payment.cardLast4}
                                                    <span className="card-brand">({selectedOrder.payment.cardBrand})</span>
                                                </div>
                                            )}
                                            {selectedOrder.payment.method === 'mpesa' && (
                                                <div className="mpesa-info">
                                                    Phone: {selectedOrder.payment.phone}
                                                </div>
                                            )}
                                            {selectedOrder.payment.method === 'paypal' && (
                                                <div className="paypal-info">
                                                    Email: {selectedOrder.payment.email}
                                                </div>
                                            )}
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