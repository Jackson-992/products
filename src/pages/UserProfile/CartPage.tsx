import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, ArrowLeft, Plus, Minus, Heart, Truck, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    fetchCartItems,
    removeFromCart,
    clearCart,
    updateCartQuantity
} from '@/services/CartServices.ts';
import { supabase } from '@/services/supabase.ts';
import './cart.css';
import {addToWishList} from "@/services/WishlistSerices.ts";
import { useToast } from '@/components/ui/use-toast'; // Import your toast hook

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const { toast } = useToast(); // Initialize toast

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
                    .eq('auth_id', user.id) // or whatever links to auth.users
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

    // Fetch cart items from Supabase
    const loadCartItems = async () => {
        if (!userProfile) return;

        try {
            setLoading(true);
            const result = await fetchCartItems(userProfile.id); // Use integer ID from user_profiles

            if (result.success) {
                // Transform the data to match your component structure
                const transformedData = result.data.map(item => ({
                    id: item.cart_item_id || item.id,
                    productId: item.product_id,
                    name: item.products.name,
                    price: item.products.price,
                    originalPrice: item.products.originalprice || item.products.price,
                    image: item.products.product_images ? item.products.product_images[0] : '/api/placeholder/300/300',
                    quantity: item.quantity,
                    inStock: item.products.stock_number > 0,
                    maxStock: item.products.stock_number || 10,
                    category: item.products.category
                }));

                setCartItems(transformedData);
            } else {
                console.error('Error loading cart:', result.error);
            }
        } catch (error) {
            console.error('Error loading cart items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userProfile) {
            loadCartItems();
        }
    }, [userProfile]);

    // Handle quantity updates
    const handleUpdateQuantity = async (productId, newQuantity) => {
        if (!userProfile) return;
        if (newQuantity < 1) return;

        const result = await updateCartQuantity(userProfile.id, productId, newQuantity);
        if (result.success) {
            // Update local state
            setCartItems(prev => prev.map(item =>
                item.productId === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        } else {
            console.error('Failed to update quantity:', result.error);
        }
    };

    // Handle remove item
    const handleRemoveItem = async (productId) => {
        if (!userProfile) return;

        const result = await removeFromCart(userProfile.id, productId);
        if (result.success) {
            // Update local state
            setCartItems(prev => prev.filter(item => item.productId !== productId));
        } else {
            console.error('Failed to remove item:', result.error);
        }
    };

    // Handle clear cart
    const handleClearCart = async () => {
        if (!userProfile) return;

        const result = await clearCart(userProfile.id);
        if (result.success) {
            setCartItems([]);
        } else {
            console.error('Failed to clear cart:', result.error);
        }
    };

    // Handle decrement quantity
    const handleDecrement = async (productId, currentQuantity) => {
        if (currentQuantity === 1) {
            await handleRemoveItem(productId);
        } else {
            await handleUpdateQuantity(productId, currentQuantity - 1);
        }
    };

    // Handle increment quantity
    const handleIncrement = async (productId, currentQuantity, maxStock) => {
        if (currentQuantity < maxStock) {
            await handleUpdateQuantity(productId, currentQuantity + 1);
        }
    };

    const moveToWishlist = async (item) => {
        // Move to wishlist logic here
        try {
            const result = await addToWishList(userProfile.id, item.productId);

            if (result.success) {
                toast({
                    title: "Added to Wishlist!",
                    description: `Product has been added to your wishlist`,
                    variant: "default",
                    duration: 3000,
                });
            } else {
                toast({
                    title: "Error adding to wishlist",
                    description: "Failed to add item to wishlist. Please try again.",
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
        console.log('Moving to wishlist:', item);
        handleRemoveItem(item.productId);
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
        return calculateSubtotal();
    };

    const shippingCost = calculateSubtotal() > 5000 ? 0 : 300;

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
                    <h2>Please log in to view your cart</h2>
                    <button
                        className="continue-shopping-btn"
                        onClick={() => navigate('/login')}
                    >
                        Login
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
                                >
                                    <Trash2 size={16} />
                                    Clear Cart
                                </button>
                            </div>

                            <div className="cart-items-list">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="cart-item">
                                        <div className="item-image">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                onClick={() => navigate(`/product/${item.productId}`)}
                                            />
                                        </div>

                                        <div className="item-details">
                                            <div className="item-header">
                                                <h3 className="item-name">{item.name}</h3>
                                                <button
                                                    className="remove-item-btn"
                                                    onClick={() => handleRemoveItem(item.productId)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <span className="item-category">{item.category}</span>

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
                                                            onClick={() => handleDecrement(item.productId, item.quantity)}
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <span className="quantity-value">{item.quantity}</span>
                                                        <button
                                                            className="quantity-btn"
                                                            onClick={() => handleIncrement(item.productId, item.quantity, item.maxStock)}
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
                                ))}
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

                                <button className="checkout-btn">
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

                    {/* Recommended Products or Continue Shopping */}
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
        </div>
    );
};

export default Cart;