import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Loader from '@/components/Loader';
import './Product-details.css';
import { getProductDetails, ProductDetails } from "@/services/ProductService.ts";
import {Review} from "@/types/Product.ts";

const ProductDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedImage, setSelectedImage] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(1);
    const [product, setProduct] = useState<ProductDetails | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const { product: productData, reviews: reviewsData } = await getProductDetails(id);
                setProduct(productData);
                setReviews(reviewsData);
            } catch (error) {
                console.error('Error fetching product details:', error);
                setProduct(null);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="loading-container">
                <Loader />
            </div>
        );
    }

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
                    className="back-button"
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
                                    <span className="rating-text">
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
                                        >
                                            -
                                        </button>
                                        <span className="quantity-value">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                                            className="quantity-button"
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
                                disabled={!product.inStock}
                            >
                                <ShoppingCart className="cart-icon" />
                                Add to Cart
                            </Button>
                            <div className="secondary-buttons">
                                <Button variant="outline" size="lg" className="wishlist-button">
                                    <Heart className="wishlist-icon" />
                                    Save
                                </Button>
                                <Button variant="outline" size="lg" className="buy-now-button">
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
                                                {/*<dt className="spec-key">{key}</dt>*/}
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
                        <Card className="reviews-card">
                            <CardContent className="reviews-content">
                                <h3 className="reviews-title">Customer Reviews</h3>
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
                                    <p>No reviews yet. Be the first to review this product!</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default ProductDetailsPage;