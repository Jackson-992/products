import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/Product';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { addToWishList, isInWishList, removeFromWishList } from '@/services/CommonServices/WishlistSerices.ts';
import AddToCartForm from '@/pages/UserProfile/AddToCartForm';
import './ProductCard.css';

interface ProductCardProps {
    product: Product;
    onCartUpdate?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onCartUpdate }) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { userProfile, isLoading } = useAuth();
    const [addingToWishlist, setAddingToWishlist] = useState(false);
    const [showAddToCartForm, setShowAddToCartForm] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [checkingWishlist, setCheckingWishlist] = useState(false);

    const mainImage = product.images.length > 0 ? product.images[0] : "/placeholder.png";

    // Check if product is in wishlist when component mounts or user changes
    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (!userProfile || isLoading) {
                setIsInWishlist(false);
                return;
            }

            setCheckingWishlist(true);
            try {
                const result = await isInWishList(userProfile.id, product.id);
                if (result.success) {
                    setIsInWishlist(result.isInWishlist);
                }
            } catch (error) {
                console.error('Error checking wishlist status:', error);
                setIsInWishlist(false);
            } finally {
                setCheckingWishlist(false);
            }
        };

        checkWishlistStatus();
    }, [userProfile, isLoading, product.id]);

    const handleAddToCartClick = () => {
        if (isLoading) {
            toast({
                title: "Please wait",
                description: "Checking authentication...",
                variant: "default",
            });
            return;
        }

        if (!userProfile) {
            toast({
                title: "Login Required",
                description: "Please log in to add items to your cart",
                variant: "destructive",
                action: (
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate('/login')}
                    >
                        Login
                    </Button>
                ),
            });
            return;
        }

        if (!product.inStock) {
            toast({
                title: "Out of Stock",
                description: "This product is currently out of stock",
                variant: "destructive",
            });
            return;
        }

        setShowAddToCartForm(true);
    };

    const handleWishlistToggle = async () => {
        if (isLoading || checkingWishlist) {
            toast({
                title: "Please wait",
                description: "Checking authentication...",
                variant: "default",
            });
            return;
        }

        if (!userProfile) {
            toast({
                title: "Login Required",
                description: "Please log in to manage your wishlist",
                variant: "destructive",
                action: (
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate('/login')}
                    >
                        Login
                    </Button>
                ),
            });
            return;
        }

        setAddingToWishlist(true);
        try {
            if (isInWishlist) {
                // Remove from wishlist
                const result = await removeFromWishList(userProfile.id, product.id);
                if (result.success) {
                    setIsInWishlist(false);
                    toast({
                        title: "Removed from Wishlist",
                        description: `${product.name} has been removed from your wishlist`,
                        variant: "default",
                        duration: 3000,
                    });
                } else {
                    throw new Error(result.error);
                }
            } else {
                // Add to wishlist
                const result = await addToWishList(userProfile.id, product.id);
                if (result.success) {
                    setIsInWishlist(true);
                    toast({
                        title: "Added to Wishlist!",
                        description: `${product.name} has been added to your wishlist`,
                        variant: "default",
                        duration: 3000,
                    });
                } else {
                    throw new Error(result.error);
                }
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            toast({
                title: "Error",
                description: "An error occurred while updating wishlist",
                variant: "destructive",
            });
        } finally {
            setAddingToWishlist(false);
        }
    };

    const handleCartFormSuccess = () => {
        setShowAddToCartForm(false);
        onCartUpdate?.();
    };

    const handleCloseForm = () => {
        setShowAddToCartForm(false);
    };

    const discountPercent = product.originalPrice
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0;

    return (
        <>
            <div className="product-Card">
                <div className="product-Image-container">
                    <Link to={`/product/${product.id}`}>
                        <img
                            src={mainImage}
                            alt={product.name}
                            className="product-image"
                        />
                    </Link>

                    <button
                        className={`wishlist-Btn ${isInWishlist ? 'in-wishlist' : ''}`}
                        onClick={handleWishlistToggle}
                        disabled={addingToWishlist || isLoading || checkingWishlist}
                        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        {addingToWishlist || checkingWishlist ? (
                            <div className="spinner-small"></div>
                        ) : (
                            <Heart
                                className={`icon-sm ${isInWishlist ? 'heart-filled' : 'heart-empty'}`}
                                fill={isInWishlist ? 'currentColor' : 'none'}
                            />
                        )}
                    </button>

                    {!product.inStock && (
                        <span className="badge badge-out-of-stock">Out of Stock</span>
                    )}

                    {discountPercent > 0 && (
                        <span className="badge badge-discount">{discountPercent}% OFF</span>
                    )}
                </div>

                <div className="product-content">
                    <div className="Product-category">{product.category}</div>
                    <Link to={`/product/${product.id}`} className="product-title-link">
                        <p className="product-Title">{product.name}</p>
                    </Link>

                    <div className="product-rating">
                        <div className="stars">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={i < Math.round(product.rating) ? 'star-filled' : 'star-empty'}
                                    size={14}
                                />
                            ))}
                        </div>
                        <span className="rating-Text">({product.reviews}) reviews</span>
                    </div>

                    <div className="Product-price">
                        <span className="price-current">Ksh {product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                            <span className="price-original">Ksh {product.originalPrice.toLocaleString()}</span>
                        )}
                    </div>

                    <button
                        className={`add-to-cart-btn ${!product.inStock ? 'disabled' : ''}`}
                        disabled={!product.inStock || isLoading}
                        onClick={handleAddToCartClick}
                    >
                        <ShoppingCart className="icon-sm" />
                        <span>
                            {isLoading ? "Checking..." : (!product.inStock ? "Out of Stock" : "Add to Cart")}
                        </span>
                    </button>
                </div>
            </div>

            {showAddToCartForm && (
                <div className="add-to-cart-modal-overlay" onClick={handleCloseForm}>
                    <div className="add-to-cart-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-product-info">
                                <img
                                    src={mainImage}
                                    alt={product.name}
                                    className="modal-product-image"
                                />
                                <div className="modal-product-details">
                                    <h3>{product.name}</h3>
                                    <div className="modal-price">
                                        <span className="price-current">Ksh {product.price.toLocaleString()}</span>
                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <span className="price-original">Ksh {product.originalPrice.toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                className="close-button"
                                onClick={handleCloseForm}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-content">
                            <AddToCartForm
                                product={{
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    originalPrice: product.originalPrice,
                                    images: product.images
                                }}
                                onCartUpdate={handleCartFormSuccess}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductCard;