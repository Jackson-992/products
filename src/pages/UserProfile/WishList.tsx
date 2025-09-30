import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './WishList.css'

const WishList = () => {
    const navigate = useNavigate();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data - replace with actual data from your backend
    const mockWishlist = [
        {
            id: 1,
            name: "Wireless Bluetooth Headphones",
            price: 7999,
            originalPrice: 9999,
            image: "/api/placeholder/300/300",
            rating: 4.5,
            reviews: 128,
            inStock: true,
            category: "Electronics"
        },
        {
            id: 2,
            name: "Smart Fitness Watch",
            price: 12999,
            originalPrice: 15999,
            image: "/api/placeholder/300/300",
            rating: 4.2,
            reviews: 89,
            inStock: true,
            category: "Electronics"
        },
        {
            id: 3,
            name: "Organic Cotton T-Shirt",
            price: 1499,
            originalPrice: 1999,
            image: "/api/placeholder/300/300",
            rating: 4.7,
            reviews: 256,
            inStock: false,
            category: "Clothing"
        }
    ];

    useEffect(() => {
        // Simulate API call to fetch wishlist
        setTimeout(() => {
            setWishlistItems(mockWishlist);
            setLoading(false);
        }, 1000);
    }, []);

    const removeFromWishlist = (itemId) => {
        setWishlistItems(prev => prev.filter(item => item.id !== itemId));
        // Here you would also call your API to remove from backend
    };

    const moveToCart = (item) => {
        if (!item.inStock) {
            alert('This item is currently out of stock');
            return;
        }
        // Add to cart logic here
        console.log('Moving to cart:', item);
        // After moving to cart, you might want to remove from wishlist
        removeFromWishlist(item.id);
    };

    const calculateDiscount = (price, originalPrice) => {
        return Math.round(((originalPrice - price) / originalPrice) * 100);
    };

    if (loading) {
        return (
            <div className="wishlist-container">
                <div className="wishlist-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your wishlist...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-container">
            <div className="wishlist-header">
                <button
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={20} />
                    Back
                </button>
                <div className="wishlist-title-section">
                    <Heart className="wishlist-icon" />
                    <h1 className="wishlist-title">My Wishlist</h1>
                    <span className="wishlist-count">({wishlistItems.length} items)</span>
                </div>
            </div>

            {wishlistItems.length === 0 ? (
                <div className="empty-wishlist">
                    <Heart className="empty-heart" />
                    <h2>Your wishlist is empty</h2>
                    <p>Start adding items you love to your wishlist</p>
                    <button
                        className="continue-shopping-btn"
                        onClick={() => navigate('/products')}
                    >
                        Continue Shopping
                    </button>
                </div>
            ) : (
                <div className="wishlist-content">
                    <div className="wishlist-grid">
                        {wishlistItems.map((item) => (
                            <div key={item.id} className="wishlist-card">
                                <div className="card-header">
                                    <span className={`stock-badge ${item.inStock ? 'in-stock' : 'out-of-stock'}`}>
                                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                    <button
                                        className="remove-btn"
                                        onClick={() => removeFromWishlist(item.id)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div
                                    className="product-image"
                                    onClick={() => navigate(`/product/${item.id}`)}
                                >
                                    <img src={item.image} alt={item.name} />
                                </div>

                                <div className="product-info">
                                    <span className="product-category">{item.category}</span>
                                    <h3 className="product-name">{item.name}</h3>

                                    <div className="rating-section">
                                        <div className="stars">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`star ${i < Math.floor(item.rating) ? 'filled' : 'empty'}`}
                                                    size={16}
                                                />
                                            ))}
                                        </div>
                                        <span className="rating-text">
                                            {item.rating} ({item.reviews})
                                        </span>
                                    </div>

                                    <div className="price-section">
                                        <span className="current-price">Ksh {item.price.toLocaleString()}</span>
                                        {item.originalPrice > item.price && (
                                            <div className="price-details">
                                                <span className="original-price">
                                                    Ksh {item.originalPrice.toLocaleString()}
                                                </span>
                                                <span className="discount">
                                                    {calculateDiscount(item.price, item.originalPrice)}% off
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="card-actions">
                                    <button
                                        className={`move-to-cart-btn ${!item.inStock ? 'disabled' : ''}`}
                                        onClick={() => moveToCart(item)}
                                        disabled={!item.inStock}
                                    >
                                        <ShoppingCart size={18} />
                                        Move to Cart
                                    </button>
                                    <button
                                        className="view-details-btn"
                                        onClick={() => navigate(`/product/${item.id}`)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="wishlist-actions">
                        <button
                            className="clear-all-btn"
                            onClick={() => setWishlistItems([])}
                        >
                            <Trash2 size={18} />
                            Clear All Items
                        </button>
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

export default WishList;