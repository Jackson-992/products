import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Trash2 } from 'lucide-react';
import { createOrder, checkVariationAvailability } from '@/services/OrderServices';
import { getProductVariations, getProductDetails } from '@/services/CheckOut.ts';
import './PurchaseForm.css';

interface ProductVariation {
    id: number;
    product_id: number;
    color: string;
    size: string;
    quantity: number;
    price_adjustment: number;
    sku?: string;
}

interface CartItem {
    id: string;
    productId: number;
    name: string;
    price: number; // This is the FINAL price (base + adjustment)
    originalPrice: number;
    image: string;
    quantity: number;
    inStock: boolean;
    category: string;
    variationId?: number;
    color?: string;
    size?: string;
    sku?: string;
    variationStock?: number;
}

interface PurchaseFormProps {
    cartItems: CartItem[];
    onClose: () => void;
    userId: string;
}

interface ProductDetails {
    id: number;
    name: string;
    price: number;
    originalprice: number;
    product_images: string[];
    category: string;
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({ cartItems, onClose, userId }) => {
    const { toast } = useToast();
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
    const [productVariations, setProductVariations] = useState<{[key: number]: ProductVariation[]}>({});
    const [productDetails, setProductDetails] = useState<{[key: number]: ProductDetails}>({});
    const [loading, setLoading] = useState<boolean>(true);
    const variationsLoadedRef = useRef<boolean>(false);

    // Fetch product details and variations directly from backend
    useEffect(() => {
        const loadProductData = async () => {
            if (variationsLoadedRef.current || cartItems.length === 0) {
                return;
            }

            try {
                setLoading(true);
                const variationsMap: {[key: number]: ProductVariation[]} = {};
                const detailsMap: {[key: number]: ProductDetails} = {};
                const updatedItems: CartItem[] = [];

                // Get unique product IDs
                const uniqueProductIds = Array.from(new Set(cartItems.map(item => item.productId)));

                // Load product details and variations for all unique products
                for (const productId of uniqueProductIds) {
                    try {
                        // Fetch product details
                        const productDetails = await getProductDetails(productId);
                        detailsMap[productId] = productDetails;

                        // Fetch product variations
                        const variations = await getProductVariations(productId);
                        variationsMap[productId] = variations;
                    } catch (error) {
                        console.error(`Error loading data for product ${productId}:`, error);
                        // Use fallback data from cart items
                        const cartItem = cartItems.find(item => item.productId === productId);
                        detailsMap[productId] = {
                            id: productId,
                            name: cartItem?.name || 'Product',
                            price: cartItem?.price || 0,
                            originalprice: cartItem?.originalPrice || cartItem?.price || 0,
                            product_images: [cartItem?.image || ''],
                            category: cartItem?.category || 'General'
                        };
                        variationsMap[productId] = [];
                    }
                }

                // Process each cart item with fresh data from backend
                for (const item of cartItems) {
                    const productDetail = detailsMap[item.productId];
                    const variations = variationsMap[item.productId] || [];

                    // Find the current variation from cart
                    let currentVariation: ProductVariation | undefined;
                    if (item.variationId) {
                        currentVariation = variations.find(v => v.id === item.variationId);
                    }

                    // If variation not found but we have color/size, try to find matching variation
                    if (!currentVariation && item.color && item.size) {
                        currentVariation = variations.find(v =>
                            v.color === item.color && v.size === item.size
                        );
                    }

                    // If still no variation found, use first available variation
                    if (!currentVariation && variations.length > 0) {
                        currentVariation = variations.find(v => v.quantity > 0) || variations[0];
                    }

                    let finalPrice = item.price; // Start with the cart's final price
                    let variationId = currentVariation?.id;
                    let color = currentVariation?.color || item.color;
                    let size = currentVariation?.size || item.size;
                    let sku = currentVariation?.sku || item.sku;
                    let variationStock = currentVariation?.quantity || 0;

                    // If we found a variation, use its data but KEEP the original cart price
                    // This prevents double-adding price adjustments
                    if (currentVariation) {
                        variationId = currentVariation.id;
                        color = currentVariation.color;
                        size = currentVariation.size;
                        sku = currentVariation.sku;
                        variationStock = currentVariation.quantity;

                        // DON'T recalculate price - use the cart's stored price
                        // The cart price should already include the variation adjustment
                    }

                    const updatedItem: CartItem = {
                        ...item,
                        name: productDetail.name,
                        price: finalPrice, // Keep the original cart price
                        originalPrice: productDetail.originalprice,
                        image: productDetail.product_images?.[0] || item.image,
                        category: productDetail.category,
                        inStock: variationStock > 0,
                        variationId,
                        color,
                        size,
                        sku,
                        variationStock
                    };

                    updatedItems.push(updatedItem);
                }

                setProductDetails(detailsMap);
                setProductVariations(variationsMap);
                setSelectedItems(updatedItems);
                variationsLoadedRef.current = true;
            } catch (error) {
                console.error('Error loading product data:', error);
                toast({
                    title: "Error",
                    description: "Failed to load product information",
                    variant: "destructive",
                });
                // Fallback to original cart items
                setSelectedItems(cartItems);
            } finally {
                setLoading(false);
            }
        };

        loadProductData();
    }, [cartItems, toast]);

    // Calculate totals
    const calculateSubtotal = () => {
        return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateTotalItems = () => {
        return selectedItems.reduce((total, item) => total + item.quantity, 0);
    };

    const shippingCost = calculateSubtotal() > 5000 ? 0 : 300;
    const totalAmount = calculateSubtotal() + shippingCost;

    const handleItemQuantityChange = (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        setSelectedItems(prev =>
            prev.map(item =>
                item.id === itemId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const handleRemoveItem = (itemId: string) => {
        setSelectedItems(prev => prev.filter(item => item.id !== itemId));

        if (selectedItems.length === 1) {
            toast({
                title: "No items selected",
                description: "Please add items to your cart",
                variant: "destructive",
            });
            onClose();
        }
    };

    const handleVariationChange = (itemId: string, variationId: number) => {
        setSelectedItems(prev =>
            prev.map(item => {
                if (item.id === itemId) {
                    const variations = productVariations[item.productId];
                    const selectedVariation = variations?.find(v => v.id === variationId);

                    if (selectedVariation) {
                        const productDetail = productDetails[item.productId];

                        // Calculate new price: base price + variation adjustment
                        const basePrice = productDetail?.price || item.price;
                        const finalPrice = basePrice + (selectedVariation.price_adjustment || 0);

                        console.log('Price calculation:', {
                            basePrice,
                            adjustment: selectedVariation.price_adjustment,
                            finalPrice,
                            previousPrice: item.price
                        });

                        return {
                            ...item,
                            variationId: selectedVariation.id,
                            color: selectedVariation.color,
                            size: selectedVariation.size,
                            sku: selectedVariation.sku,
                            variationStock: selectedVariation.quantity,
                            price: finalPrice,
                            quantity: Math.min(item.quantity, selectedVariation.quantity)
                        };
                    }
                }
                return item;
            })
        );
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
                price: item.price,
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
        } catch (error: any) {
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

    const getCurrentVariation = (itemId: string) => {
        const item = selectedItems.find(item => item.id === itemId);
        return item ? {
            variationId: item.variationId,
            color: item.color,
            size: item.size
        } : null;
    };

    // Helper function to display price
    const renderPrice = (item: CartItem) => {
        const hasDiscount = item.originalPrice > item.price;

        if (hasDiscount) {
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
    const getVariationDisplayPrice = (productId: number, variation: ProductVariation) => {
        const productDetail = productDetails[productId];
        if (!productDetail) return variation.price_adjustment || 0;

        const basePrice = productDetail?.price;

        return basePrice + (variation.price_adjustment || 0);
    };

    if (loading) {
        return (
            <div className="purchase-form">
                <div className="purchase-form-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading product information...</p>
                </div>
            </div>
        );
    }

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
                                const currentVariation = getCurrentVariation(item.id);

                                return (
                                    <div key={item.id} className="cart-item">
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
                                                            onChange={(e) => handleVariationChange(item.id, parseInt(e.target.value))}
                                                            className="variation-dropdown"
                                                            disabled={isSubmitting}
                                                        >
                                                            <option value="">Choose variation...</option>
                                                            {variations.map((variation) => {
                                                                const variationPrice = getVariationDisplayPrice(item.productId, variation);
                                                                return (
                                                                    <option
                                                                        key={variation.id}
                                                                        value={variation.id}
                                                                        disabled={variation.quantity === 0}
                                                                    >
                                                                        {variation.color} - {variation.size}
                                                                        {variation.quantity === 0 ? ' (Out of Stock)' : ` (${variation.quantity} available)`}
                                                                        {` - Ksh ${variationPrice.toLocaleString()}`}
                                                                        {variation.price_adjustment ? ` (${variation.price_adjustment > 0 ? '+' : ''}${variation.price_adjustment})` : ''}
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
                                                    onClick={() => handleRemoveItem(item.id)}
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
                                                            onClick={() => handleItemQuantityChange(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1 || isSubmitting}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="quantity-value">{item.quantity}</span>
                                                        <button
                                                            type="button"
                                                            className="quantity-btn"
                                                            onClick={() => handleItemQuantityChange(item.id, item.quantity + 1)}
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
                        disabled={isSubmitting || selectedItems.length === 0 || loading}
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