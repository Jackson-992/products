import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/Product';
import { supabase } from '@/services/supabase';
import { useToast } from '@/components/ui/use-toast';
import { addToWishList } from '@/services/WishlistSerices';
import AddToCartForm from '@/pages/UserProfile/AddToCartForm';
import './ProductCard.css';

interface ProductCardProps {
    product: Product;
    onCartUpdate?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onCartUpdate }) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [userProfile, setUserProfile] = useState(null);
    const [addingToWishlist, setAddingToWishlist] = useState(false);
    const [showAddToCartForm, setShowAddToCartForm] = useState(false);

    const mainImage = product.images.length > 0 ? product.images[0] : "/placeholder.png";

    React.useEffect(() => {
        const getUserProfile = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const { data: profile, error } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('auth_id', session.user.id)
                        .single();

                    if (!error) {
                        setUserProfile(profile);
                    }
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        getUserProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const { data: profile, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('auth_id', session.user.id)
                    .single();

                if (!error) {
                    setUserProfile(profile);
                }
            } else {
                setUserProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleAddToCartClick = () => {
        // Always show the form - no direct adding to cart
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

        // Show the form for ALL products
        setShowAddToCartForm(true);
    };

    const handleAddToWishlist = async () => {
        if (!userProfile) {
            toast({
                title: "Login Required",
                description: "Please log in to add items to your wishlist",
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
            const result = await addToWishList(userProfile.id, product.id);

            if (result.success) {
                toast({
                    title: "Added to Wishlist!",
                    description: `${product.name} has been added to your wishlist`,
                    variant: "default",
                    duration: 3000,
                });
            } else {
                toast({
                    title: "Failed to Add to Wishlist",
                    description: "Please try again",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            toast({
                title: "Error",
                description: "An error occurred while adding to wishlist",
                variant: "destructive",
            });
        } finally {
            setAddingToWishlist(false);
        }
    };

    const handleCartFormSuccess = () => {
        setShowAddToCartForm(false);
        if (onCartUpdate) {
            onCartUpdate();
        }
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
                        className="wishlist-Btn"
                        onClick={handleAddToWishlist}
                        disabled={addingToWishlist}
                        aria-label="Add to wishlist"
                    >
                        {addingToWishlist ? (
                            <div className="spinner-small"></div>
                        ) : (
                            <Heart className="icon-sm" />
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
                        disabled={!product.inStock}
                        onClick={handleAddToCartClick}
                    >
                        <ShoppingCart className="icon-sm" />
                        <span>
                            {!product.inStock ? "Out of Stock" : "Add to Cart"}
                        </span>
                    </button>
                </div>
            </div>

            {/* Add to Cart Form Modal - ALWAYS show when clicking Add to Cart */}
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