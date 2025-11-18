import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ShoppingCart, Check } from 'lucide-react';
import { getProductVariations, ProductVariation } from '@/services/AdminServices/adminProductService.ts';
import { addToCart } from '@/services/CommonServices/CartServices.ts';
import useUserProfile from '@/hooks/userProfile';
import './AddToCartForm.css';

interface AddToCartFormProps {
    product: {
        id: number;
        name: string;
        price: number;
        originalPrice?: number;
        images: string[];
    };
    onCartUpdate?: () => void;
}

const AddToCartForm: React.FC<AddToCartFormProps> = ({ product, onCartUpdate }) => {
    const { toast } = useToast();
    const [variations, setVariations] = useState<ProductVariation[]>([]);
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [addingToCart, setAddingToCart] = useState<boolean>(false);

    // Use the custom hook for user profile
    const { userProfile, loading: profileLoading } = useUserProfile();

    useEffect(() => {
        loadVariations();
    }, [product.id]);

    const loadVariations = async () => {
        try {
            setLoading(true);
            const productVariations = await getProductVariations(product.id);
            setVariations(productVariations);

            // Auto-select first available variation
            if (productVariations.length > 0) {
                const availableVariation = productVariations.find(v => v.quantity > 0) || productVariations[0];
                setSelectedColor(availableVariation.color);
                setSelectedSize(availableVariation.size);
            }
        } catch (error) {
            console.error('Error loading variations:', error);
            toast({
                title: "Error",
                description: "Failed to load product variations",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Get available colors and sizes based on selection
    const availableColors = Array.from(new Set(variations.map(v => v.color)));
    const availableSizes = Array.from(new Set(
        variations
            .filter(v => !selectedColor || v.color === selectedColor)
            .map(v => v.size)
    ));

    // Get selected variation details
    const selectedVariation = variations.find(v =>
        v.color === selectedColor && v.size === selectedSize
    );

    // Calculate final price
    const finalPrice = selectedVariation
        ? product.price + (selectedVariation.price_adjustment || 0)
        : product.price;

    // Check if selected variation is in stock
    const isInStock = selectedVariation ? selectedVariation.quantity > 0 : false;
    const maxQuantity = selectedVariation ? selectedVariation.quantity : 0;

    const handleAddToCart = async () => {
        if (!userProfile) {
            toast({
                title: "Authentication Required",
                description: "Please log in to add items to cart",
                variant: "destructive",
            });
            return;
        }

        if (!selectedColor || !selectedSize) {
            toast({
                title: "Please select options",
                description: "Please choose color and size before adding to cart",
                variant: "destructive",
            });
            return;
        }

        if (!selectedVariation) {
            toast({
                title: "Invalid selection",
                description: "Please select available options",
                variant: "destructive",
            });
            return;
        }

        if (!isInStock) {
            toast({
                title: "Out of Stock",
                description: "This variation is currently out of stock",
                variant: "destructive",
            });
            return;
        }

        setAddingToCart(true);

        try {
            // Prepare variation data for the service
            const variationData = {
                variation_id: selectedVariation.id,
                color: selectedColor,
                size: selectedSize,
                product_sku: selectedVariation.sku,
                price: finalPrice
            };

            // Use the actual addToCart service
            const result = await addToCart(
                userProfile.id,
                product.id,
                quantity,
                variationData
            );

            if (result.success) {
                toast({
                    title: "Added to Cart",
                    description: `${product.name} (${selectedColor}, ${selectedSize}) added to cart`,
                    variant: "default",
                });

                if (onCartUpdate) {
                    onCartUpdate();
                }
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            console.error('Error adding to cart:', error);

            // Handle specific foreign key constraint error
            if (error.message?.includes('foreign key constraint') || error.message?.includes('carts_user_id_fkey')) {
                toast({
                    title: "Account Setup Required",
                    description: "Please complete your profile setup before adding items to cart",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: error.message || "Failed to add item to cart",
                    variant: "destructive",
                });
            }
        } finally {
            setAddingToCart(false);
        }
    };

    // Simple add to cart for products without variations
    const handleSimpleAddToCart = async () => {
        if (!userProfile) {
            toast({
                title: "Authentication Required",
                description: "Please log in to add items to cart",
                variant: "destructive",
            });
            return;
        }

        setAddingToCart(true);

        try {
            // For products without variations, pass empty variation data
            const result = await addToCart(
                userProfile.id,
                product.id,
                quantity,
                {} // No variation data
            );

            if (result.success) {
                toast({
                    title: "Added to Cart",
                    description: `${product.name} added to cart`,
                    variant: "default",
                });

                if (onCartUpdate) {
                    onCartUpdate();
                }
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            console.error('Error adding to cart:', error);

            // Handle specific foreign key constraint error
            if (error.message?.includes('foreign key constraint') || error.message?.includes('carts_user_id_fkey')) {
                toast({
                    title: "Account Setup Required",
                    description: "Please complete your profile setup before adding items to cart",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: error.message || "Failed to add item to cart",
                    variant: "destructive",
                });
            }
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading || profileLoading) {
        return <div className="add-to-cart-loading">Loading options...</div>;
    }

    // If no variations, show simple add to cart button
    if (variations.length === 0) {
        return (
            <div className="add-to-cart-simple">
                <div className="price-section">
                    <span className="current-price">Ksh {product.price.toLocaleString()}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span className="original-price">Ksh {product.originalPrice.toLocaleString()}</span>
                    )}
                </div>
                <Button
                    onClick={handleSimpleAddToCart}
                    disabled={addingToCart || !userProfile}
                    className="add-to-cart-btn"
                    size="lg"
                >
                    <ShoppingCart className="btn-icon" />
                    {!userProfile ? 'Login Required' : addingToCart ? 'Adding...' : 'Add to Cart'}
                </Button>
            </div>
        );
    }

    return (
        <div className="add-to-cart-form">
            {/* Price Display */}
            <div className="price-section">
                <span className="current-price">Ksh {finalPrice.toLocaleString()}</span>
                {product.originalPrice && product.originalPrice > finalPrice && (
                    <span className="original-price">Ksh {product.originalPrice.toLocaleString()}</span>
                )}
            </div>

            {/* Color Selection */}
            <div className="option-section">
                <label className="option-label">Color</label>
                <div className="color-options">
                    {availableColors.map(color => {
                        const colorVariations = variations.filter(v => v.color === color);
                        const hasStock = colorVariations.some(v => v.quantity > 0);

                        return (
                            <button
                                key={color}
                                type="button"
                                className={`color-option ${selectedColor === color ? 'selected' : ''} ${!hasStock ? 'out-of-stock' : ''}`}
                                onClick={() => {
                                    setSelectedColor(color);
                                    // Reset size when color changes
                                    const availableSizesForColor = colorVariations.map(v => v.size);
                                    if (!availableSizesForColor.includes(selectedSize)) {
                                        setSelectedSize('');
                                    }
                                }}
                                disabled={!hasStock}
                                title={!hasStock ? 'Out of stock' : color}
                            >
                                {color}
                                {!hasStock && <span className="stock-badge">Out of stock</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Size Selection */}
            {selectedColor && (
                <div className="option-section">
                    <label className="option-label">Size</label>
                    <div className="size-options">
                        {availableSizes.map(size => {
                            const sizeVariation = variations.find(v =>
                                v.color === selectedColor && v.size === size
                            );
                            const hasStock = sizeVariation ? sizeVariation.quantity > 0 : false;

                            return (
                                <button
                                    key={size}
                                    type="button"
                                    className={`size-option ${selectedSize === size ? 'selected' : ''} ${!hasStock ? 'out-of-stock' : ''}`}
                                    onClick={() => setSelectedSize(size)}
                                    disabled={!hasStock}
                                    title={!hasStock ? 'Out of stock' : size}
                                >
                                    {size}
                                    {!hasStock && <span className="stock-badge">Out of stock</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quantity Selector */}
            {selectedColor && selectedSize && isInStock && (
                <div className="option-section">
                    <label className="option-label">Quantity</label>
                    <div className="Quantity-selector">
                        <button
                            type="button"
                            className="quantity-btn"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                        >
                            -
                        </button>
                        <span className="quantity-value">{quantity}</span>
                        <button
                            type="button"
                            className="quantity-btn"
                            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                            disabled={quantity >= maxQuantity}
                        >
                            +
                        </button>
                        <span className="quantity-note">Max: {maxQuantity}</span>
                    </div>
                </div>
            )}

            {/* Stock Status */}
            {selectedColor && selectedSize && (
                <div className="stock-status">
                    {isInStock ? (
                        <div className="in-stock">
                            <Check className="stock-icon" />
                            In Stock ({maxQuantity} available)
                        </div>
                    ) : (
                        <div className="out-of-stock">
                            Out of Stock
                        </div>
                    )}
                </div>
            )}

            {/* Add to Cart Button */}
            <Button
                onClick={handleAddToCart}
                disabled={!userProfile || !selectedColor || !selectedSize || !isInStock || addingToCart}
                className="add-to-cart-btn"
                size="lg"
            >
                <ShoppingCart className="btn-icon" />
                {!userProfile ? 'Login Required' :
                    addingToCart ? 'Adding...' :
                        !selectedColor || !selectedSize ? 'Select Options' : 'Add to Cart'}
            </Button>
        </div>
    );
};

export default AddToCartForm;