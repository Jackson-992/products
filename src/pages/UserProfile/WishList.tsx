import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    fetchWishListItems,
    removeFromWishList,
    clearWishList
} from '@/services/WishlistSerices';
import './WishList.css';
import { supabase } from "@/services/supabase.ts";
import { useToast } from '@/components/ui/use-toast'; // Import your toast hook

const WishList = () => {
    const navigate = useNavigate();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
                    setError('Please log in to view your wishlist');
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
                    setError('Failed to load user profile');
                    setLoading(false);
                    return;
                }

                setUserProfile(profile);
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setError('Failed to load user profile');
                setLoading(false);
            }
        };

        getUserProfile();
    }, []);

    // Load wishlist items when userProfile is available
    useEffect(() => {
        if (userProfile && userProfile.id) {
            loadWishlistItems();
        }
    }, [userProfile]); // Only run when userProfile changes

    const loadWishlistItems = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!userProfile || !userProfile.id) {
                setError('User not authenticated');
                setLoading(false);
                return;
            }

            const result = await fetchWishListItems(userProfile.id);

            if (result.success) {
                // First transform basic product data
                const itemsWithBasicData = result.data.map(item => ({
                    wishlist_item_id: item.wishlist_item_id,
                    id: item.product_id,
                    name: item.products?.name || 'Product Name Not Available',
                    price: item.products?.price || 0,
                    originalPrice: item.products?.originalprice || item.products?.price || 0,
                    image: item.products?.product_images?.[0] || '/api/placeholder/300/300',
                    inStock: (item.products?.stock_number || 0) > 0,
                    category: item.products?.category || 'Uncategorized',
                    // Temporary placeholder values
                    rating: 0,
                    reviews: 0
                }));

                // Fetch reviews for all products
                const productsWithReviews = await Promise.all(
                    itemsWithBasicData.map(async (item) => {
                        try {
                            const reviewsResult = await supabase
                                .from('reviews')
                                .select('rating')
                          .eq('product_id', item.id);

                    if (reviewsResult.data && reviewsResult.data.length > 0) {
                                const averageRating = reviewsResult.data.reduce((sum, review) => sum + review.rating, 0) / reviewsResult.data.length;
                                return {
                                    ...item,
                                    rating: parseFloat(averageRating.toFixed(1)),
                                    reviews: reviewsResult.data.length
                                };
                            }
                            return item;
                        } catch (error) {
                            console.error(`Error fetching reviews for product ${item.id}:`, error);
                            return item;
                        }
                    })
                );

                setWishlistItems(productsWithReviews);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to load wishlist items');
            console.error('Error loading wishlist:', err);
        } finally {
            setLoading(false);
        }
    };
    const removeFromWishlist = async (productId) => {
        try {
            if (!userProfile?.id) {
                setError('User not authenticated');
                return;
            }

            const result = await removeFromWishList(userProfile.id, productId);
            if (result.success) {
                setWishlistItems(prev => prev.filter(item => item.id !== productId));
            } else {
                setError('Failed to remove item from wishlist');
            }
        } catch (err) {
            setError('Error removing item from wishlist');
            console.error('Error removing from wishlist:', err);
        }
    };

    const clearAllWishlist = async () => {
        if (!userProfile?.id) {
            setError('User not authenticated');
            return;
        }

        if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
            try {
                const result = await clearWishList(userProfile.id);
                if (result.success) {
                    setWishlistItems([]);
                } else {
                    setError('Failed to clear wishlist');
                }
            } catch (err) {
                setError('Error clearing wishlist');
                console.error('Error clearing wishlist:', err);
            }
        }
    };

    const calculateDiscount = (price, originalPrice) => {
        if (!originalPrice || originalPrice <= price) return 0;
        return Math.round(((originalPrice - price) / originalPrice) * 100);
    };

    // Show loading state only when initially loading and userProfile is not yet set
    if (loading && !userProfile) {
        return (
            <div className="wishlist-container">
                <div className="wishlist-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your wishlist...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="wishlist-container">
                <div className="wishlist-error">
                    <p>Error: {error}</p>
                    <button
                        className="retry-btn"
                        onClick={loadWishlistItems}
                    >
                        Retry
                    </button>
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
                            <div key={item.wishlist_item_id} className="wishlist-card">
                                <div className="card-header">
                                    <span className={`Stock-badge ${item.inStock ? 'in-stock' : 'out-of-stock'}`}>
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
                                    {!item.inStock && (
                                        <div className="out-of-stock-overlay">
                                            Out of Stock
                                        </div>
                                    )}
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
                                            {item.rating.toFixed(1)} ({item.reviews} reviews)
                                        </span>
                                    </div>

                                    <div className="Price-section">
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
                            onClick={clearAllWishlist}
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