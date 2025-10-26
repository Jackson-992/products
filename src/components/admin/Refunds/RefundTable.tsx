import './RefundTable.css';
import { useState } from 'react';

const RefundPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [refundItems, setRefundItems] = useState([]);
    const [refundData, setRefundData] = useState({
        reason: '',
        notes: '',
        refundMethod: 'original',
        notifyCustomer: true,
        customMessage: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);

    // Mock order data - replace with actual API
    const mockOrders = [
        {
            id: 1,
            order_id: 'ORD-001',
            user_name: 'John Doe',
            email: 'john@example.com',
            phone: '+1-555-0101',
            amount: 149.99,
            status: 'completed',
            payment_method: 'credit_card',
            created_at: '2024-01-15T10:30:00Z',
            items: [
                { id: 1, name: 'Wireless Headphones', price: 99.99, quantity: 1, refundable_quantity: 1 },
                { id: 2, name: 'Phone Case', price: 25.00, quantity: 2, refundable_quantity: 2 }
            ]
        },
        {
            id: 2,
            order_id: 'ORD-002',
            user_name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+1-555-0102',
            amount: 299.50,
            status: 'completed',
            payment_method: 'paypal',
            created_at: '2024-01-16T14:45:00Z',
            items: [
                { id: 3, name: 'Smart Watch', price: 199.99, quantity: 1, refundable_quantity: 1 },
                { id: 4, name: 'Screen Protector', price: 99.51, quantity: 1, refundable_quantity: 0 }
            ]
        }
    ];

    const refundReasons = [
        'Product defective or not working',
        'Wrong item received',
        'Item damaged during shipping',
        'Customer changed mind',
        'Item not as described',
        'Late delivery',
        'Duplicate order',
        'Other'
    ];

    const handleSearch = () => {
        // Simulate API search
        const foundOrder = mockOrders.find(order =>
            order.order_id.toLowerCase() === searchTerm.toLowerCase() ||
            order.phone.includes(searchTerm) ||
            order.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (foundOrder) {
            setSelectedOrder(foundOrder);
            // Initialize refund items with 0 quantities
            setRefundItems(foundOrder.items.map(item => ({
                ...item,
                refund_quantity: 0
            })));
        } else {
            setSelectedOrder(null);
            alert('Order not found');
        }
    };

    const updateRefundQuantity = (itemId, quantity) => {
        setRefundItems(prev => prev.map(item =>
            item.id === itemId
                ? { ...item, refund_quantity: Math.min(quantity, item.refundable_quantity) }
                : item
        ));
    };

    const calculateRefundAmount = () => {
        return refundItems.reduce((total, item) =>
            total + (item.price * item.refund_quantity), 0
        );
    };

    const handleInputChange = (field, value) => {
        setRefundData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const processRefund = async () => {
        if (calculateRefundAmount() <= 0) {
            alert('Please select items to refund');
            return;
        }

        if (!refundData.reason) {
            alert('Please select a refund reason');
            return;
        }

        setIsProcessing(true);

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Here you would call your actual refund API
            console.log('Processing refund:', {
                order_id: selectedOrder.order_id,
                items: refundItems.filter(item => item.refund_quantity > 0),
                amount: calculateRefundAmount(),
                ...refundData
            });

            alert('Refund processed successfully!');
            resetForm();
        } catch (error) {
            alert('Error processing refund: ' + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const resetForm = () => {
        setSearchTerm('');
        setSelectedOrder(null);
        setRefundItems([]);
        setRefundData({
            reason: '',
            notes: '',
            refundMethod: 'original',
            notifyCustomer: true,
            customMessage: ''
        });
    };

    const refundAmount = calculateRefundAmount();

    return (
        <div className="refund-page">
            <div className="refund-header">
                <h1>Process Refund</h1>
                <p>Search for an order to process a refund</p>
            </div>

            {/* Order Search Section */}
            <div className="search-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Enter Order ID, Email, or Phone Number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="search-input"
                    />
                    <button onClick={handleSearch} className="search-btn">
                        Search Order
                    </button>
                </div>
            </div>

            {selectedOrder && (
                <div className="refund-container">
                    <div className="refund-layout">
                        {/* Order Details & Items Section */}
                        <div className="order-section">
                            <div className="order-header">
                                <h3>Order Details</h3>
                                <span className="order-id">{selectedOrder.order_id}</span>
                            </div>

                            <div className="order-info">
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Customer:</label>
                                        <span>{selectedOrder.user_name}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Email:</label>
                                        <span>{selectedOrder.email}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Phone:</label>
                                        <span>{selectedOrder.phone}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Original Amount:</label>
                                        <span>${selectedOrder.amount}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Payment Method:</label>
                                        <span className="payment-method">
                      {selectedOrder.payment_method === 'credit_card' ? 'Credit Card' : 'PayPal'}
                    </span>
                                    </div>
                                </div>
                            </div>

                            {/* Refund Items Selection */}
                            <div className="items-section">
                                <h4>Select Items to Refund</h4>
                                <div className="items-list">
                                    {refundItems.map(item => (
                                        <div key={item.id} className="refund-item">
                                            <div className="item-info">
                                                <div className="item-name">{item.name}</div>
                                                <div className="item-details">
                                                    <span>Price: ${item.price}</span>
                                                    <span>Max refundable: {item.refundable_quantity}</span>
                                                </div>
                                            </div>
                                            <div className="quantity-selector">
                                                <label>Quantity to refund:</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={item.refundable_quantity}
                                                    value={item.refund_quantity}
                                                    onChange={(e) => updateRefundQuantity(item.id, parseInt(e.target.value) || 0)}
                                                    className="quantity-input"
                                                />
                                                <span className="quantity-hint">
                          ${(item.price * item.refund_quantity).toFixed(2)}
                        </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Refund Details Section */}
                        <div className="refund-details-section">
                            <div className="refund-summary">
                                <h3>Refund Summary</h3>

                                <div className="amount-breakdown">
                                    <div className="amount-row">
                                        <span>Items Subtotal:</span>
                                        <span>${refundAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="amount-row total">
                                        <span>Refund Amount:</span>
                                        <span className="refund-total">${refundAmount.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Refund Options */}
                                <div className="refund-options">
                                    <div className="option-group">
                                        <label>Refund Reason *</label>
                                        <select
                                            value={refundData.reason}
                                            onChange={(e) => handleInputChange('reason', e.target.value)}
                                            className="reason-select"
                                        >
                                            <option value="">Select a reason</option>
                                            {refundReasons.map(reason => (
                                                <option key={reason} value={reason}>{reason}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="option-group">
                                        <label>Refund Method</label>
                                        <select
                                            value={refundData.refundMethod}
                                            onChange={(e) => handleInputChange('refundMethod', e.target.value)}
                                            className="method-select"
                                        >
                                            <option value="original">Original Payment Method</option>
                                            <option value="store_credit">Store Credit</option>
                                            <option value="manual">Manual Refund</option>
                                        </select>
                                    </div>

                                    <div className="option-group">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={refundData.notifyCustomer}
                                                onChange={(e) => handleInputChange('notifyCustomer', e.target.checked)}
                                            />
                                            Notify Customer via Email
                                        </label>
                                    </div>

                                    {refundData.notifyCustomer && (
                                        <div className="option-group">
                                            <label>Custom Message (Optional)</label>
                                            <textarea
                                                placeholder="Add a custom message to include in the refund notification..."
                                                value={refundData.customMessage}
                                                onChange={(e) => handleInputChange('customMessage', e.target.value)}
                                                className="message-textarea"
                                                rows="3"
                                            />
                                        </div>
                                    )}

                                    <div className="option-group">
                                        <label>Internal Notes</label>
                                        <textarea
                                            placeholder="Add internal notes about this refund..."
                                            value={refundData.notes}
                                            onChange={(e) => handleInputChange('notes', e.target.value)}
                                            className="notes-textarea"
                                            rows="2"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="action-buttons">
                                    <button
                                        onClick={processRefund}
                                        disabled={isProcessing || refundAmount <= 0 || !refundData.reason}
                                        className="btn-process-refund"
                                    >
                                        {isProcessing ? 'Processing Refund...' : `Process Refund - $${refundAmount.toFixed(2)}`}
                                    </button>
                                    <button
                                        onClick={resetForm}
                                        disabled={isProcessing}
                                        className="btn-cancel"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RefundPage;