import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, X, ArrowLeft } from 'lucide-react';
import './cart.css';

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

const CartPage = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([
        {
            id: '1',
            name: 'Wireless Bluetooth Headphones',
            price: 799.99,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
            quantity: 1,
        },
        {
            id: '2',
            name: 'Organic Cotton T-Shirt',
            price: 240,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
            quantity: 2,
        },
        {
            id: '3',
            name: 'Smart Coffee Maker',
            price: 1499.99,
            image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
            quantity: 1,
        },
    ]);

    const updateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        setCartItems(cartItems.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        ));
    };

    const removeItem = (id: string) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 150; // Flat rate shipping
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shipping + tax;

    return (
        <div className="cart-page">
            <div className="cart-container">
                <div className="cart-header">
                    <h1 className="cart-title">Your Shopping Cart</h1>
                </div>

                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <div className="empty-cart-icon">
                            <ShoppingCart size={48} />
                        </div>
                        <p className="empty-cart-message">Your cart is empty</p>
                        <Link to="/products" className="continue-shopping">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="cart-content">
                        <div className="cart-items">
                            {cartItems.map((item) => (
                                <div key={item.id} className="cart-item">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="cart-item-image"
                                    />
                                    <div className="cart-item-details">
                                        <h3 className="cart-item-title">{item.name}</h3>
                                        <p className="cart-item-price">KSh {item.price.toFixed(2)}</p>

                                        <div className="cart-item-actions">
                                            <div className="quantity-selector">
                                                <button
                                                    className="quantity-button"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    className="quantity-input"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                                    min="1"
                                                />
                                                <button
                                                    className="quantity-button"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                className="remove-button"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <X size={16} style={{ marginRight: '4px' }} />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <h3 className="summary-title">Order Summary</h3>

                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>KSh {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>KSh {shipping.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Tax</span>
                                <span>KSh {tax.toFixed(2)}</span>
                            </div>

                            <div className="summary-row summary-total">
                                <span>Total</span>
                                <span>KSh {total.toFixed(2)}</span>
                            </div>

                            <button className="checkout-button">
                                Proceed to Checkout
                            </button>

                            <Link to="/products" className="continue-shopping" style={{ display: 'block', textAlign: 'center', marginTop: '1rem' }}>
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;