import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Trash2 } from 'lucide-react';
import { createOrder, checkVariationAvailability } from '@/services/OrderServices';
import { getProductVariations } from '@/services/adminProductService';
import './PurchaseForm.css';

interface ProductVariation {
    id: number;
    color: string;
    size: string;
    quantity: number;
    price_adjustment?: number;
    sku?: string;
}

interface CartItem {
    id: string;
    productId: number;
    name: string;
    price: number; // This should be the FINAL price (base price or sale price)
    originalPrice: number; // Original price before any discounts
    image: string;
    quantity: number;
    inStock: boolean;
    category: string;
    // New variation fields
    variationId?: number;
    color?: string;
    size?: string;
    sku?: string;
    variationStock?: number;
    basePrice?: number; // Add base price to track the product's base price without variations
}

interface PurchaseFormProps {
    cartItems: CartItem[];
    onClose: () => void;
    userId: string;
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({ cartItems, onClose, userId }) => {
    const { toast } = useToast();
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
    const [productVariations, setProductVariations] = useState<{[key: number]: ProductVariation[]}>({});
    const [loadingVariations, setLoadingVariations] = useState<boolean>(true);

    // Initialize selectedItems with base prices
    useEffect(() => {
        const initializedItems = cartItems.map(item => ({
            ...item,
            basePrice: item.price // Store the current price as base price
        }));
        setSelectedItems(initializedItems);
    }, [cartItems]);

    // Load product variations when component mounts
    useEffect(() => {
        const loadVariations = async () => {
            try {
                setLoadingVariations(true);
                const variationsMap: {[key: number]: ProductVariation[]} = {};

                for (const item of selectedItems) {
                    try {
                        const variations = await getProductVariations(item.productId);
                        variationsMap[item.productId] = variations;

                        // Auto-select first available variation if none selected
                        if (!item.variationId && variations.length > 0) {
                            const availableVariation = variations.find(v => v.quantity > 0) || variations[0];
                            const finalPrice = item.basePrice! + (availableVariation.price_adjustment || 0);

                            setSelectedItems(prev => prev.map(prevItem =>
                                prevItem.productId === item.productId
                                    ? {
                                        ...prevItem,
                                        variationId: availableVariation.id,
                                        color: availableVariation.color,
                                        size: availableVariation.size,
                                        sku: availableVariation.sku,
                                        variationStock: availableVariation.quantity,
                                        price: finalPrice // Update price with variation adjustment
                                    }
                                    : prevItem
                            ));
                        }
                    } catch (error) {
                        console.error(`Error loading variations for product ${item.productId}:`, error);
                        variationsMap[item.productId] = [];
                    }
                }

                setProductVariations(variationsMap);
            } catch (error) {
                console.error('Error loading product variations:', error);
                toast({
                    title: "Error",
                    description: "Failed to load product variations",
                    variant: "destructive",
                });
            } finally {
                setLoadingVariations(false);
            }
        };

        if (selectedItems.length > 0) {
            loadVariations();
        }
    }, [selectedItems, toast]);

    // Calculate totals - use the current price which includes variation adjustments
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

    const handleVariationChange = (productId: number, variationId: number) => {
        const variations = productVariations[productId];
        const selectedVariation = variations.find(v => v.id === variationId);

        if (selectedVariation) {
            const originalItem = selectedItems.find(item => item.productId === productId);
            if (!originalItem || !originalItem.basePrice) return;

            // Calculate final price: base price + variation adjustment
            const finalPrice = originalItem.basePrice + (selectedVariation.price_adjustment || 0);

            setSelectedItems(prev =>
                prev.map(item =>
                    item.productId === productId
                        ? {
                            ...item,
                            variationId: selectedVariation.id,
                            color: selectedVariation.color,
                            size: selectedVariation.size,
                            sku: selectedVariation.sku,
                            variationStock: selectedVariation.quantity,
                            price: finalPrice
                        }
                        : item
                )
            );
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

        // Check if all items have variations selected
        const itemsWithoutVariations = selectedItems.filter(item => !item.variationId);
        if (itemsWithoutVariations.length > 0) {
            toast({
                title: "Error",
                description: "Please select variations for all products",
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
            // Check variation availability before creating order
            const availabilityCheck = await checkVariationAvailability(selectedItems);

            if (!availabilityCheck.success) {
                throw new Error(availabilityCheck.error);
            }

            if (!availabilityCheck.allAvailable) {
                const unavailableItems = availabilityCheck.availability.filter(item => !item.available);
                const errorMessage = unavailableItems.map(item =>
                    `${item.color} ${item.size}: Only ${item.currentStock} available`
                ).join(', ');

                toast({
                    title: "Insufficient Stock",
                    description: `Some items are no longer available: ${errorMessage}`,
                    variant: "destructive",
                });
                return;
            }

            // Prepare order items with variation data
            const orderItems = selectedItems.map(item => ({
                productId: item.productId,
                variationId: item.variationId!,
                color: item.color!,
                size: item.size!,
                sku: item.sku!,
                name: item.name,
                price: item.price, // This is the final price including variation adjustments
                quantity: item.quantity,
                variationStock: item.variationStock!,
                affiliate_id: null,
                commission_earned: 0
            }));

            // Create order in database
            const orderResult = await createOrder({
                user_id: userId,
                phone_number: phoneNumber,
                items: orderItems
            });

            if (!orderResult.success) {
                throw new Error(orderResult.error);
            }

            toast({
                title: "Order Placed Successfully!",
                description: `Your order #${orderResult.order.id} for ${calculateTotalItems()} items has been placed. We'll contact you on ${phoneNumber}.`,
                variant: "default",
            });

            onClose();
        } catch (error) {
            console.error('Order creation error:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to place order. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAvailableVariations = (productId: number) => {
        return productVariations[productId] || [];
    };

    const getCurrentVariation = (productId: number) => {
        const item = selectedItems.find(item => item.productId === productId);
        return item ? {
            variationId: item.variationId,
            color: item.color,
            size: item.size
        } : null;
    };

    // Helper function to display price with original price if available
    const renderPrice = (item: CartItem) => {
        // Show original price only if it's different from base price (sale scenario)
        const shouldShowOriginalPrice = item.originalPrice > item.basePrice!;

        if (shouldShowOriginalPrice) {
            return (
                <div className="price-display">
                    <span className="current-price">Ksh {item.price.toLocaleString()}</span>
                    <span className="original-price">Ksh {item.originalPrice.toLocaleString()}</span>
                </div>
            );
        }
        return <span className="price">Ksh {item.price.toLocaleString()}</span>;
    };

    // Calculate variation price for dropdown display
    const getVariationDisplayPrice = (item: CartItem, variation: ProductVariation) => {
        const basePrice = item.basePrice || item.price;
        return basePrice + (variation.price_adjustment || 0);
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
                            {selectedItems.map((item) => {
                                const variations = getAvailableVariations(item.productId);
                                const currentVariation = getCurrentVariation(item.productId);

                                return (
                                    <div key={item.productId} className="cart-item">
                                        <div className="product-image-container">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="product-image"
                                            />
                                        </div>
                                        <div className="product-details">
                                            <div className="inner-div">
                                                <div className="product-Header">
                                                    <h4 className="product-name">{item.name}</h4>
                                                </div>
                                                <p className="product-category">{item.category}</p>

                                                {/* Variation Selector */}
                                                {variations.length > 0 && (
                                                    <div className="variation-selector">
                                                        <label className="variation-label">Select Variation:</label>
                                                        <select
                                                            value={currentVariation?.variationId || ''}
                                                            onChange={(e) => handleVariationChange(item.productId, parseInt(e.target.value))}
                                                            className="variation-dropdown"
                                                            disabled={isSubmitting || loadingVariations}
                                                        >
                                                            <option value="">Choose variation...</option>
                                                            {variations.map((variation) => {
                                                                const variationPrice = getVariationDisplayPrice(item, variation);
                                                                return (
                                                                    <option
                                                                        key={variation.id}
                                                                        value={variation.id}
                                                                        disabled={variation.quantity === 0}
                                                                    >
                                                                        {variation.color} - {variation.size}
                                                                        {variation.quantity === 0 ? ' (Out of Stock)' : ` (${variation.quantity} available)`}
                                                                        {` - Ksh ${variationPrice.toLocaleString()}`}
                                                                    </option>
                                                                );
                                                            })}
                                                        </select>
                                                    </div>
                                                )}

                                                {currentVariation?.color && currentVariation?.size && (
                                                    <div className="selected-variation">
                                                        Selected: <strong>{currentVariation.color} - {currentVariation.size}</strong>
                                                        {item.variationStock !== undefined && (
                                                            <span className="stock-info">
                                                                ({item.variationStock} available)
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                <button
                                                    type="button"
                                                    className="remove-Item-btn"
                                                    onClick={() => handleRemoveItem(item.productId)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="price-quantity">
                                                {renderPrice(item)}
                                                <div className="quantity-controls">
                                                    <label>Qty:</label>
                                                    <div className="quantity-buttons">
                                                        <button
                                                            type="button"
                                                            className="quantity-btn"
                                                            onClick={() => handleItemQuantityChange(item.productId, item.quantity - 1)}
                                                            disabled={item.quantity <= 1 || isSubmitting}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="quantity-value">{item.quantity}</span>
                                                        <button
                                                            type="button"
                                                            className="quantity-btn"
                                                            onClick={() => handleItemQuantityChange(item.productId, item.quantity + 1)}
                                                            disabled={isSubmitting || (item.variationStock !== undefined && item.quantity >= item.variationStock)}
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
                                );
                            })}
                        </div>

                        <div className="order-details">
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
                        disabled={isSubmitting || selectedItems.length === 0 || loadingVariations}
                        className="submit-button"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="spinner"></div>
                                Processing...
                            </>
                        ) : loadingVariations ? (
                            "Loading variations..."
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