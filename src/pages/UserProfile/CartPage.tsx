import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, ArrowLeft, Plus, Minus, Heart, Truck, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './cart.css'

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data - replace with actual data from your backend
    const mockCartItems = [
        {
            id: 1,
            productId: 101,
            name: "Wireless Bluetooth Headphones",
            price: 7999,
            originalPrice: 9999,
            image: "/api/placeholder/300/300",
            quantity: 2,
            inStock: true,
            maxStock: 10,
            category: "Electronics"
        },
        {
            id: 2,
            productId: 102,
            name: "Smart Fitness Watch",
            price: 12999,
            originalPrice: 15999,
            image: "/api/placeholder/300/300",
            quantity: 1,
            inStock: true,
            maxStock: 5,
            category: "Electronics"
        },
        {
            id: 3,
            productId: 103,
            name: "Organic Cotton T-Shirt",
            price: 1499,
            originalPrice: 1999,
            image: "/api/placeholder/300/300",
            quantity: 3,
            inStock: true,
            maxStock: 20,
            category: "Clothing"
        }
    ];

    useEffect(() => {
        // Simulate API call to fetch cart items
        setTimeout(() => {
            setCartItems(mockCartItems);
            setLoading(false);
        }, 1000);
    }, []);

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        setCartItems(prev => prev.map(item =>
            item.id === itemId
                ? { ...item, quantity: Math.min(newQuantity, item.maxStock) }
                : item
        ));
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
        // Here you would also call your API to remove from backend
    };

    const moveToWishlist = (item) => {
        // Move to wishlist logic here
        console.log('Moving to wishlist:', item);
        removeFromCart(item.id);
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
                                    onClick={() => setCartItems([])}
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
                                                    onClick={() => removeFromCart(item.id)}
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
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <span className="quantity-value">{item.quantity}</span>
                                                        <button
                                                            className="quantity-btn"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
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