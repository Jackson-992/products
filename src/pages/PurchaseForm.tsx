import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Trash2 } from 'lucide-react';
import './PurchaseForm.css';

interface CartItem {
    id: string;
    productId: number;
    name: string;
    price: number;
    originalPrice: number;
    image: string;
    quantity: number;
    inStock: boolean;
    category: string;
}

interface PurchaseFormProps {
    cartItems: CartItem[];
    onClose: () => void;
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({ cartItems, onClose }) => {
    const { toast } = useToast();
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [selectedItems, setSelectedItems] = useState<CartItem[]>(cartItems);

    // Generate a random order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Calculate totals
    const calculateSubtotal = () => {
        return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateTotalItems = () => {
        return selectedItems.reduce((total, item) => total + item.quantity, 0);
    };

    const shippingCost = calculateSubtotal() > 5000 ? 0 : 300;
    const totalAmount = calculateSubtotal() + shippingCost;

    const handleItemQuantityChange = (productId: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        setSelectedItems(prev =>
            prev.map(item =>
                item.productId === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const handleRemoveItem = (productId: number) => {
        setSelectedItems(prev => prev.filter(item => item.productId !== productId));

        if (selectedItems.length === 1) {
            toast({
                title: "No items selected",
                description: "Please add items to your cart",
                variant: "destructive",
            });
            onClose();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedItems.length === 0) {
            toast({
                title: "Error",
                description: "Please select at least one item to purchase",
                variant: "destructive",
            });
            return;
        }

        if (!phoneNumber.trim()) {
            toast({
                title: "Error",
                description: "Please enter your phone number",
                variant: "destructive",
            });
            return;
        }

        const phoneRegex = /^[0-9+\-\s()]{10,}$/;
        if (!phoneRegex.test(phoneNumber)) {
            toast({
                title: "Error",
                description: "Please enter a valid phone number",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API call to process purchase
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Here you would typically send the order to your backend
            const orderData = {
                orderNumber,
                phoneNumber,
                items: selectedItems,
                subtotal: calculateSubtotal(),
                shipping: shippingCost,
                total: totalAmount,
                timestamp: new Date().toISOString()
            };

            console.log('Order data:', orderData); // For debugging

            toast({
                title: "Order Placed Successfully!",
                description: `Your order ${orderNumber} for ${calculateTotalItems()} items has been placed. We'll contact you on ${phoneNumber}.`,
                variant: "default",
            });

            onClose();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to place order. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="purchase-form">
            <form onSubmit={handleSubmit} className="purchase-form-content">
                <Card className="order-summary-card">
                    <CardContent>
                        <h3 className="section-title">
                            Order Summary ({calculateTotalItems()} items)
                        </h3>

                        <div className="cart-items-list">
                            {selectedItems.map((item) => (
                                <div key={item.productId} className="cart-item">
                                    <div className="product-image-container">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="product-image"
                                        />
                                    </div>
                                    <div className="product-details">
                                        <div className="product-header">
                                            <h4 className="product-name">{item.name}</h4>
                                            <button
                                                type="button"
                                                className="remove-item-btn"
                                                onClick={() => handleRemoveItem(item.productId)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <p className="product-category">{item.category}</p>
                                        <div className="price-quantity">
                                            <span className="price">Ksh {item.price.toLocaleString()}</span>
                                            <div className="quantity-controls">
                                                <label>Qty:</label>
                                                <div className="quantity-buttons">
                                                    <button
                                                        type="button"
                                                        className="quantity-btn"
                                                        onClick={() => handleItemQuantityChange(item.productId, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="quantity-value">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        className="quantity-btn"
                                                        onClick={() => handleItemQuantityChange(item.productId, item.quantity + 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="item-total">
                                            Item Total: <strong>Ksh {(item.price * item.quantity).toLocaleString()}</strong>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="order-details">
                            <div className="order-row">
                                <span className="order-label">Order Number:</span>
                                <span className="order-value">{orderNumber}</span>
                            </div>
                            <div className="order-row">
                                <span className="order-label">Subtotal ({calculateTotalItems()} items):</span>
                                <span className="order-value">Ksh {calculateSubtotal().toLocaleString()}</span>
                            </div>
                            <div className="order-row">
                                <span className="order-label">Shipping:</span>
                                <span className="order-value">
                                    {shippingCost === 0 ? (
                                        <span className="free-shipping">FREE</span>
                                    ) : (
                                        `Ksh ${shippingCost.toLocaleString()}`
                                    )}
                                </span>
                            </div>
                            {shippingCost > 0 && calculateSubtotal() < 5000 && (
                                <div className="shipping-note">
                                    Add Ksh {(5000 - calculateSubtotal()).toLocaleString()} more for FREE shipping!
                                </div>
                            )}
                            <div className="order-row total">
                                <span className="order-label">Total Amount:</span>
                                <span className="order-value">Ksh {totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="customer-info-card">
                    <CardContent>
                        <h3 className="section-title">Customer Information</h3>

                        <div className="form-group">
                            <label htmlFor="phoneNumber" className="form-label">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Enter your phone number"
                                className="form-input"
                                disabled={isSubmitting}
                                required
                            />
                            <p className="form-help">
                                We'll use this number to contact you about your order
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="form-actions">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="cancel-button"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || selectedItems.length === 0}
                        className="submit-button"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="spinner"></div>
                                Processing...
                            </>
                        ) : (
                            `Pay Ksh ${totalAmount.toLocaleString()}`
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default PurchaseForm;