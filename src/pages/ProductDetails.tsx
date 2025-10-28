import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {ArrowLeft, Heart, ShoppingCart, Star, Truck, Shield, RotateCcw, AlertCircle, X} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Loader from '@/components/Loader';
import ReviewForm from './ReviewForm.tsx';
import './Product-details.css';
import { getProductDetails, ProductDetails, submitReview } from "@/services/ProductService.ts";
import { Review } from "@/types/Product.ts";
import { supabase } from '@/services/supabase';
import { addToCart } from '@/services/CartServices'; // Import the addToCart function
import { useToast } from '@/components/ui/use-toast'; // Import your toast hook
import {addToWishList} from "@/services/WishlistSerices.ts";
import PurchaseForm from "@/pages/PurchaseForm.tsx";

const ProductDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast(); // Initialize toast
    const navigate = useNavigate();
    const [productLoading, setProductLoading] = useState<boolean>(true);
    const [authLoading, setAuthLoading] = useState<boolean>(true);
    const [selectedImage, setSelectedImage] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(1);
    const [product, setProduct] = useState<ProductDetails | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null); // Add userProfile state
    const [addingToCart, setAddingToCart] = useState<boolean>(false); // Loading state for add to cart
    const [addingToWish, setAddingToWish] = useState<boolean>(false);
    const [showBuyForm,setShowBuyForm] = useState<boolean>(false)

    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!id) {
                setProductLoading(false);
                return;
            }

            setProductLoading(true);
            try {
                const { product: productData, reviews: reviewsData } = await getProductDetails(id);
                setProduct(productData);
                setReviews(reviewsData);
            } catch (error) {
                console.error('Error fetching product details:', error);
                setProduct(null);
                setReviews([]);
            } finally {
                setProductLoading(false);
            }
        };

        fetchProductDetails();
    }, [id]);

    useEffect(() => {
        // Get initial session and user profile
        const getSessionAndProfile = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);

                // If user is logged in, get their profile with integer ID
                if (session?.user) {
                    const { data: profile, error } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('auth_id', session.user.id) // Adjust this to match your column name
                        .single();

                    if (error) {
                        console.error('Error fetching user profile:', error);
                    } else {
                        setUserProfile(profile);
                    }
                }
            } catch (error) {
                console.error('Error in session setup:', error);
            } finally {
                setAuthLoading(false);
            }
        };

        getSessionAndProfile();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);

            // Update user profile when auth changes
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

    const handleBuyNow = () => {
        if (!product || !id) return;

        // Check if user is logged in
        if (!user || !userProfile) {
            toast({
                title: "Login Required",
                description: "Please log in to purchase items",
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

        // Check if product is in stock
        if (!product.inStock) {
            toast({
                title: "Out of Stock",
                description: "This product is out of stock and no longer available for purchase.",
                variant: "default",
            });
            return;
        }
        setShowBuyForm(true);
    };

    const handleCloseBuyForm = () => {
        setShowBuyForm(false);
    };

    // Add to Cart Handler
    const handleAddToCart = async () => {
        console.log('Add to cart clicked');
        console.log('User:', user);
        console.log('User Profile:', userProfile);
        console.log('Auth Loading:', authLoading);
        if (!product || !id) return;

        // Check if user is logged in
        if (!user || !userProfile) {
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

        // Check if product is in stock
        if (!product.inStock) {
            toast({
                title: "Out of Stock",
                description: "This product is out of stock and no longer available for purchase.",
                variant: "default",

            });
            return;
        }

        setAddingToCart(true);
        try {
            const result = await addToCart(userProfile.id, parseInt(id), quantity);

            if (result.success) {
                toast({
                    title: "Added to Cart!",
                    description: `${product.name} has been added to your cart`,
                    variant: "default",
                    duration: 3000,
                });

            } else {
                //console.error('Failed to add to cart:', result.error);
                toast({
                    title: "Error adding to cart",
                    description: "Failed to add item to cart. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast({
                title: "Error adding to cart",
                description: "Failed to add item to cart. Please try again.",
                variant: "destructive",
            });
        } finally {
            setAddingToCart(false);
        }
    };

    const handleAddToWishlist = async () => {
        if (!product || !id) return;

        // Check if user is logged in
        if (!user || !userProfile) {
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

        setAddingToWish(true);
        try {
            const result = await addToWishList(userProfile.id, parseInt(id));

            if (result.success) {
                toast({
                    title: "Added to Wishlist!",
                    description: `${product.name} has been added to your wishlist`,
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
        } finally {
            setAddingToWish(false);
        }
    };

    const handleReviewSubmit = async (reviewData: { rating: number; comment: string }) => {
        if (!id || !product) return;

        if (!user) {
            alert('Please log in to submit a review');
            return;
        }

        setIsSubmittingReview(true);
        try {
            const newReview = await submitReview(id, reviewData);

            setReviews(prevReviews => [newReview, ...prevReviews]);

            setProduct(prevProduct => {
                if (!prevProduct) return null;

                const newReviewCount = prevProduct.reviews + 1;
                const newRating = ((prevProduct.rating * prevProduct.reviews) + reviewData.rating) / newReviewCount;

                return {
                    ...prevProduct,
                    rating: parseFloat(newRating.toFixed(1)),
                    reviews: newReviewCount
                };
            });

            console.log('Review submitted successfully!');
            toast({
                title: "Review added",
                description: "Your review has been added.",
                variant: "default",
            });

        } catch (error: any) {
            console.error('Error submitting review:', error);

            if (error.message.includes('logged in') || error.message.includes('auth')) {
                alert('Please log in to submit a review');
            } else {
                toast({
                    title: "Error submitting review",
                    description: "Failed to submit your review. Try again later.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsSubmittingReview(false);
        }
    };

    // Show loading spinner while product data is loading
    if (productLoading) {
        return (
            <div className="loading-container">
                <Loader />
            </div>
        );
    }

    // Show error if product not found
    if (!product) {
        return (
            <div className="product-details-container">
                <div className="product-details-wrapper">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="back-button"
                    >
                        <ArrowLeft className="button-icon" />
                        Back to Products
                    </Button>
                    <div className="error-message">
                        <AlertCircle className="error-icon" />
                        <h2>Product not found</h2>
                        <p>The product you're looking for doesn't exist or has been removed.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="product-details-container">
            <div className="product-details-wrapper">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="back-Button"
                >
                    <ArrowLeft className="button-icon" />
                    Back to Products
                </Button>

                <div className="product-grid">
                    {/* Product Images */}
                    <div className="product-images-section">
                        <div className="main-image-container">
                            <img
                                src={product.images[selectedImage] || '/placeholder-image.jpg'}
                                alt={product.name}
                                className="main-image"
                            />
                        </div>
                        {product.images.length > 1 && (
                            <div className="thumbnail-container">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`thumbnail-button ${
                                            selectedImage === index ? 'thumbnail-active' : ''
                                        }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.name} ${index + 1}`}
                                            className="thumbnail-image"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="product-info-section">
                        <div className="product-header">
                            <Badge variant="secondary" className="category-badge">
                                {product.category}
                            </Badge>
                            <h1 className="product-title">
                                {product.name}
                            </h1>
                            <div className="rating-container">
                                <div className="stars-container">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`star-icon ${
                                                i < Math.floor(product.rating)
                                                    ? 'star-filled'
                                                    : 'star-empty'
                                            }`}
                                        />
                                    ))}
                                    <span className="Rating-text">
                                        {product.rating} ({product.reviews} reviews)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="price-container">
                            <span className="current-price">
                                Ksh {product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <>
                                    <span className="original-price">
                                        Ksh {product.originalPrice.toLocaleString()}
                                    </span>
                                    <Badge variant="destructive" className="discount-badge">
                                        Save Ksh {(product.originalPrice - product.price).toLocaleString()}
                                    </Badge>
                                </>
                            )}
                        </div>

                        {/* Stock and Quantity */}
                        <div className="stock-quantity-section">
                            <div className="stock-status">
                                <span className="stock-text">
                                    {product.inStock ? (
                                        <span className="in-stock">
                                            ✓ In Stock ({product.stockCount} available)
                                        </span>
                                    ) : (
                                        <span className="out-of-stock">✗ Out of Stock</span>
                                    )}
                                </span>
                            </div>

                            {product.inStock && (
                                <div className="quantity-selector">
                                    <label className="quantity-label">Quantity:</label>
                                    <div className="quantity-controls">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="quantity-button"
                                            disabled={quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="quantity-value">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                                            className="quantity-button"
                                            disabled={quantity >= product.stockCount}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <Button
                                size="lg"
                                className="add-to-cart-button"
                                disabled={!product.inStock || addingToCart}
                                onClick={handleAddToCart}
                            >
                                {addingToCart ? (
                                    <>
                                        <div className="spinner"></div>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="cart-icon" />
                                        Add to Cart
                                    </>
                                )}
                            </Button>
                            <div className="secondary-buttons">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="wishlist-button"
                                    onClick={handleAddToWishlist}
                                    disabled={addingToWish}
                                >
                                    {addingToWish ? (
                                        <>
                                            <div className="spinner"></div>
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Heart className="wishlist-icon" />
                                            Save
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="buy-now-button"
                                    onClick={handleBuyNow}
                                    disabled={!product.inStock}
                                >
                                    Buy Now
                                </Button>
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div className="shipping-info">
                            <div className="shipping-item">
                                <Truck className="shipping-icon truck-icon" />
                                <div>
                                    <p className="shipping-title">Free Shipping</p>
                                    <p className="shipping-subtitle">On orders over $50</p>
                                </div>
                            </div>
                            <div className="shipping-item">
                                <Shield className="shipping-icon shield-icon" />
                                <div>
                                    <p className="shipping-title">Secure Payment</p>
                                    <p className="shipping-subtitle">SSL Protected</p>
                                </div>
                            </div>
                            <div className="shipping-item">
                                <RotateCcw className="shipping-icon return-icon" />
                                <div>
                                    <p className="shipping-title">30-Day Returns</p>
                                    <p className="shipping-subtitle">Money back guarantee</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <Tabs defaultValue="description" className="product-tabs">
                    <TabsList className="tabs-list">
                        <TabsTrigger value="description">Description</TabsTrigger>
                        <TabsTrigger value="specifications">Specifications</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="description" className="tab-content">
                        <Card className="description-card">
                            <CardContent className="description-content">
                                <h3 className="description-title">Product Description</h3>
                                <p className="description-text">{product.description}</p>

                                {product.features.length > 0 && (
                                    <>
                                        <h4 className="features-title">Key Features:</h4>
                                        <ul className="features-list">
                                            {product.features.map((feature, index) => (
                                                <li key={index} className="feature-item">
                                                    <span className="feature-bullet"></span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="specifications" className="tab-content">
                        <Card className="specs-card">
                            <CardContent className="specs-content">
                                <h3 className="specs-title">Technical Specifications</h3>
                                {Object.keys(product.specifications).length > 0 ? (
                                    <dl className="specs-list">
                                        {Object.entries(product.specifications).map(([key, value]) => (
                                            <div key={key} className="spec-item">
                                                <dd className="spec-value">{value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                ) : (
                                    <p>No specifications available for this product.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reviews" className="tab-content">
                        <div className="reviews-tab-content">
                            {/* Review Form - Only show if user is logged in and auth has loaded */}
                            {!authLoading && user && (
                                <ReviewForm
                                    productId={id!}
                                    onSubmit={handleReviewSubmit}
                                    isSubmitting={isSubmittingReview}
                                />
                            )}

                            {/* Existing Reviews */}
                            <Card className="reviews-card">
                                <CardContent className="reviews-content">
                                    <h3 className="reviews-title">Customer Reviews ({reviews.length})</h3>
                                    {reviews.length > 0 ? (
                                        <div className="reviews-list">
                                            {reviews.map((review) => (
                                                <div key={review.id} className="review-item">
                                                    <div className="review-header">
                                                        <div className="reviewer-info">
                                                            <span className="reviewer-name">{review.user}</span>
                                                            <div className="review-stars">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`review-star ${
                                                                            i < review.rating
                                                                                ? 'star-filled'
                                                                                : 'star-empty'
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <span className="review-date">{review.date}</span>
                                                    </div>
                                                    {review.comment && (
                                                        <p className="review-comment">{review.comment}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="no-reviews-message">
                                            No reviews yet. Be the first to review this product!
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {showBuyForm && (
                    <div className="purchase-form-overlay">
                        <div className="purchase-form-container">
                            <div className="purchase-form-header">
                                <h2>Complete Your Purchase</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCloseBuyForm}
                                    className="close-button"
                                >
                                    <X className="close-icon" />
                                </Button>
                            </div>
                            <PurchaseForm
                                cartItems={[{
                                    id: `temp-${product.id}`,
                                    productId: product.id,
                                    name: product.name,
                                    price: product.price,
                                    originalPrice: product.originalPrice || product.price,
                                    image: product.images[0] || '/placeholder-image.jpg',
                                    quantity: quantity,
                                    inStock: product.inStock,
                                    category: product.category
                                }]}
                                onClose={handleCloseBuyForm}
                                userId={userProfile.id}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailsPage;