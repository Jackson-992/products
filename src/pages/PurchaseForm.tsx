import React, { useState } from 'react';
import { ProductDetails } from "@/services/ProductService.ts";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import './PurchaseForm.css'

interface PurchaseFormProps {
    product: ProductDetails;
    quantity: number;
    onClose: () => void;
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({ product, quantity, onClose }) => {
    const { toast } = useToast();
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Generate a random order number (in real app, this would come from backend)
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const totalAmount = product.price * quantity;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phoneNumber.trim()) {
            toast({
                title: "Error",
                description: "Please enter your phone number",
                variant: "destructive",
            });
            return;
        }

        // Basic phone number validation
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

            toast({
                title: "Order Placed Successfully!",
                description: `Your order ${orderNumber} has been placed. We'll contact you on ${phoneNumber}.`,
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
                        <h3 className="section-title">Order Summary</h3>

                        <div className="product-info">
                            <div className="product-image-container">
                                <img
                                    src={product.images[0] || '/placeholder-image.jpg'}
                                    alt={product.name}
                                    className="product-images"
                                />
                            </div>
                            <div className="product-details">
                                <h4 className="product-name">{product.name}</h4>
                                <p className="product-category">{product.category}</p>
                                <div className="price-quantity">
                                    <span className="price">Ksh {product.price.toLocaleString()}</span>
                                    <span className="quantity">Qty: {quantity}</span>
                                </div>
                            </div>
                        </div>

                        <div className="order-details">
                            <div className="order-row">
                                <span className="order-label">Order Number:</span>
                                <span className="order-value">{orderNumber}</span>
                            </div>
                            <div className="order-row">
                                <span className="order-label">Unit Price:</span>
                                <span className="order-value">Ksh {product.price.toLocaleString()}</span>
                            </div>
                            <div className="order-row">
                                <span className="order-label">Quantity:</span>
                                <span className="order-value">{quantity}</span>
                            </div>
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
                        disabled={isSubmitting}
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