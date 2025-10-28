import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, ArrowLeft, Plus, Minus, Heart, Truck, Shield, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    fetchCartItems,
    removeFromCart,
    clearCart,
    updateCartQuantity
} from '@/services/CartServices';
import { supabase } from '@/services/supabase';
import './cart.css';
import { addToWishList } from "@/services/WishlistSerices";
import { useToast } from '@/components/ui/use-toast';
import PurchaseForm from "@/pages/PurchaseForm";
import { Button } from '@/components/ui/button';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const { toast } = useToast();
    const [showBuyForm, setShowBuyForm] = useState(false);

    // Get user profile with integer ID
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

                if (error) {
                    console.error('Error fetching user profile:', error);
                    setLoading(false);
                    return;
                }
                setUserProfile(profile);
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setLoading(false);
            }
        };

        getUserProfile();
    }, []);

    // Fetch cart items from Supabase
    const loadCartItems = async () => {
        if (!userProfile) return;

        try {
            setLoading(true);
            const result = await fetchCartItems(userProfile.id);

            if (result.success && result.data) {
                // Transform the data to match your component structure
                const transformedData = result.data.map(item => ({
                    id: item.cart_item_id,
                    productId: item.product_id,
                    variationId: item.variation_id,
                    name: item.products?.name || 'Product',
                    price: item.price || item.products?.price || 0,
                    originalPrice: item.products?.originalprice || item.products?.price || 0,
                    image: item.products?.product_images?.[0] || '/api/placeholder/300/300',
                    quantity: item.quantity,
                    inStock: (item.products?.stock_number || 0) > 0,
                    maxStock: item.products?.stock_number || 10,
                    category: item.products?.category || 'General',
                    color: item.color,
                    size: item.size,
                    productSku: item.product_sku
                }));

                setCartItems(transformedData);
            } else {
                console.error('Error loading cart:', result.error);
                setCartItems([]);
            }
        } catch (error) {
            console.error('Error loading cart items:', error);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userProfile) {
            loadCartItems();
        }
    }, [userProfile]);

    // Handle quantity updates using cart_item_id
    const handleUpdateQuantity = async (cartItemId, newQuantity) => {
        if (!userProfile) return;
        if (newQuantity < 1) return;

        const result = await updateCartQuantity(cartItemId, newQuantity);
        if (result.success) {
            // Update local state
            setCartItems(prev => prev.map(item =>
                item.id === cartItemId
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        } else {
            console.error('Failed to update quantity:', result.error);
            toast({
                title: "Error",
                description: "Failed to update quantity",
                variant: "destructive",
            });
        }
    };

    // Handle remove item using cart_item_id
    const handleRemoveItem = async (cartItemId) => {
        if (!userProfile) return;

        const result = await removeFromCart(cartItemId);
        if (result.success) {
            // Update local state
            setCartItems(prev => prev.filter(item => item.id !== cartItemId));
            toast({
                title: "Item Removed",
                description: "Item has been removed from your cart",
                variant: "default",
            });
        } else {
            console.error('Failed to remove item:', result.error);
            toast({
                title: "Error",
                description: "Failed to remove item from cart",
                variant: "destructive",
            });
        }
    };

    // Handle clear cart
    const handleClearCart = async () => {
        if (!userProfile) return;

        const result = await clearCart(userProfile.id);
        if (result.success) {
            setCartItems([]);
            toast({
                title: "Cart Cleared",
                description: "All items have been removed from your cart",
                variant: "default",
            });
        } else {
            console.error('Failed to clear cart:', result.error);
            toast({
                title: "Error",
                description: "Failed to clear cart",
                variant: "destructive",
            });
        }
    };

    // Handle decrement quantity
    const handleDecrement = async (cartItemId, currentQuantity) => {
        if (currentQuantity === 1) {
            await handleRemoveItem(cartItemId);
        } else {
            await handleUpdateQuantity(cartItemId, currentQuantity - 1);
        }
    };

    // Handle increment quantity
    const handleIncrement = async (cartItemId, currentQuantity, maxStock) => {
        if (currentQuantity < maxStock) {
            await handleUpdateQuantity(cartItemId, currentQuantity + 1);
        } else {
            toast({
                title: "Maximum Quantity",
                description: "You've reached the maximum available quantity for this item",
                variant: "default",
            });
        }
    };

    const handleBuyNow = () => {
        // Check if any items are out of stock
        const outOfStockItems = cartItems.filter(item => !item.inStock);
        if (outOfStockItems.length > 0) {
            toast({
                title: "Out of Stock Items",
                description: "Some items in your cart are out of stock. Please remove them to proceed.",
                variant: "destructive",
            });
            return;
        }

        // Check if cart is empty
        if (cartItems.length === 0) {
            toast({
                title: "Cart is Empty",
                description: "Please add items to your cart before proceeding to checkout",
                variant: "destructive",
            });
            return;
        }

        setShowBuyForm(true);
    };

    const moveToWishlist = async (item) => {
        if (!userProfile) return;

        try {
            const result = await addToWishList(userProfile.id, item.productId);

            if (result.success) {
                toast({
                    title: "Added to Wishlist!",
                    description: `${item.name} has been added to your wishlist`,
                    variant: "default",
                    duration: 3000,
                });
                // Remove from cart after successful wishlist addition
                await handleRemoveItem(item.id);
            } else {
                toast({
                    title: "Error adding to wishlist",
                    description: result.error || "Failed to add item to wishlist. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            toast({
                title: "Error adding to wishlist",
                description: "Failed to add item to wishlist. Please try again.",
                variant: "destructive",
            });
        }
    };

    const calculateItemTotal = (price, quantity) => {
        return price * quantity;
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateDiscount = () => {
        return cartItems.reduce((total, item) => {
            if (item.originalPrice > item.price) {
                return total + ((item.originalPrice - item.price) * item.quantity);
            }
            return total;
        }, 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() - calculateDiscount();
    };

    const shippingCost = calculateSubtotal() > 5000 ? 0 : 300;

    // Get variation display text
    const getVariationDisplay = (item) => {
        const variations = [];
        if (item.color) variations.push(item.color);
        if (item.size) variations.push(item.size);

        return variations.length > 0 ? variations.join(' • ') : null;
    };

    if (loading) {
        return (
            <div className="cart-container">
                <div className="cart-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your cart...</p>
                </div>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="cart-container">
                <div className="empty-cart">
                    <ShoppingCart className="empty-cart-icon" />
                    <h2>Please log in to view your cart</h2>
                    <p>Sign in to see your saved items and continue shopping</p>
                    <button
                        className="continue-shopping-btn"
                        onClick={() => navigate('/login')}
                    >
                        Login to Continue
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <div className="cart-header">
                <button
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={20} />
                    Back
                </button>
                <div className="cart-title-section">
                    <ShoppingCart className="cart-icon" />
                    <h1 className="cart-title">Shopping Cart</h1>
                    <span className="cart-count">({cartItems.length} items)</span>
                </div>
            </div>

            {cartItems.length === 0 ? (
                <div className="empty-cart">
                    <ShoppingCart className="empty-cart-icon" />
                    <h2>Your cart is empty</h2>
                    <p>Add some items to your cart to get started</p>
                    <button
                        className="continue-shopping-btn"
                        onClick={() => navigate('/products')}
                    >
                        Continue Shopping
                    </button>
                </div>
            ) : (
                <div className="cart-content">
                    <div className="cart-layout">
                        {/* Cart Items */}
                        <div className="cart-items-section">
                            <div className="cart-items-header">
                                <h2>Cart Items</h2>
                                <button
                                    className="clear-cart-btn"
                                    onClick={handleClearCart}
                                    disabled={cartItems.length === 0}
                                >
                                    <Trash2 size={16} />
                                    Clear Cart
                                </button>
                            </div>

                            <div className="cart-items-list">
                                {cartItems.map((item) => {
                                    const variationDisplay = getVariationDisplay(item);
                                    return (
                                        <div key={item.id} className="cart-item">
                                            <div className="item-image">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    onClick={() => navigate(`/product/${item.productId}`)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </div>

                                            <div className="item-details">
                                                <div className="item-header">
                                                    <h3
                                                        className="item-name"
                                                        onClick={() => navigate(`/product/${item.productId}`)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {item.name}
                                                    </h3>
                                                    <button
                                                        className="remove-item-btn"
                                                        onClick={() => handleRemoveItem(item.id)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>

                                                <span className="item-category">{item.category}</span>

                                                {variationDisplay && (
                                                    <div className="item-variation">
                                                        {variationDisplay}
                                                    </div>
                                                )}

                                                <div className="item-price">
                                                    <span className="current-price">Ksh {item.price.toLocaleString()}</span>
                                                    {item.originalPrice > item.price && (
                                                        <span className="original-price">
                                                            Ksh {item.originalPrice.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="stock-status">
                                                    {item.inStock ? (
                                                        <span className="in-stock">✓ In Stock</span>
                                                    ) : (
                                                        <span className="out-of-stock">✗ Out of Stock</span>
                                                    )}
                                                </div>

                                                <div className="item-actions">
                                                    <div className="quantity-controls">
                                                        <label>Quantity:</label>
                                                        <div className="quantity-buttons">
                                                            <button
                                                                className="quantity-btn"
                                                                onClick={() => handleDecrement(item.id, item.quantity)}
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                <Minus size={16} />
                                                            </button>
                                                            <span className="quantity-value">{item.quantity}</span>
                                                            <button
                                                                className="quantity-btn"
                                                                onClick={() => handleIncrement(item.id, item.quantity, item.maxStock)}
                                                                disabled={item.quantity >= item.maxStock}
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <button
                                                        className="wishlist-btn"
                                                        onClick={() => moveToWishlist(item)}
                                                    >
                                                        <Heart size={16} />
                                                        Save for Later
                                                    </button>
                                                </div>

                                                <div className="item-total">
                                                    Total: <strong>Ksh {calculateItemTotal(item.price, item.quantity).toLocaleString()}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="order-summary-section">
                            <div className="order-summary">
                                <h2>Order Summary</h2>

                                <div className="summary-row">
                                    <span>Subtotal ({cartItems.reduce((total, item) => total + item.quantity, 0)} items)</span>
                                    <span>Ksh {calculateSubtotal().toLocaleString()}</span>
                                </div>

                                {calculateDiscount() > 0 && (
                                    <div className="summary-row discount">
                                        <span>Discount</span>
                                        <span>- Ksh {calculateDiscount().toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span>
                                        {shippingCost === 0 ? (
                                            <span className="free-shipping">FREE</span>
                                        ) : (
                                            `Ksh ${shippingCost.toLocaleString()}`
                                        )}
                                    </span>
                                </div>

                                <div className="summary-divider"></div>

                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>Ksh {(calculateTotal() + shippingCost).toLocaleString()}</span>
                                </div>

                                {shippingCost > 0 && (
                                    <div className="shipping-note">
                                        Add Ksh {(5000 - calculateSubtotal()).toLocaleString()} more for FREE shipping!
                                    </div>
                                )}

                                <button
                                    className="checkout-btn"
                                    onClick={handleBuyNow}
                                    disabled={cartItems.length === 0}
                                >
                                    Proceed to Checkout
                                </button>

                                <div className="security-features">
                                    <div className="security-item">
                                        <Shield size={16} />
                                        <span>Secure checkout</span>
                                    </div>
                                    <div className="security-item">
                                        <Truck size={16} />
                                        <span>Free shipping over Ksh 5,000</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Continue Shopping */}
                    <div className="cart-footer">
                        <button
                            className="continue-shopping-btn"
                            onClick={() => navigate('/products')}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            )}

            {/* Purchase Form Modal */}
            {showBuyForm && (
                <div className="purchase-form-overlay">
                    <div className="purchase-form-container">
                        <div className="purchase-form-header">
                            <h2>Complete Your Purchase</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowBuyForm(false)}
                                className="close-button"
                            >
                                <X className="close-icon" />
                            </Button>
                        </div>
                        <PurchaseForm
                            cartItems={cartItems}
                            onClose={() => setShowBuyForm(false)}
                            userId={userProfile.id}
                            subtotal={calculateSubtotal()}
                            shippingCost={shippingCost}
                            total={calculateTotal() + shippingCost}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;