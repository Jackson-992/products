import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/Product';
import { addToCart } from '@/services/CartServices';
import { supabase } from '@/services/supabase';
import { useToast } from '@/components/ui/use-toast'; // Import your toast hook

interface ProductCardProps {
    product: Product;
    onCartUpdate?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onCartUpdate }) => {
    const navigate = useNavigate();
    const { toast } = useToast(); // Initialize toast
    const [addingToCart, setAddingToCart] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

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

    const handleAddToCart = async () => {
        // Check if user is logged in
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

        // Check if product is in stock
        if (!product.inStock) {
            toast({
                title: "Out of Stock",
                description: "This product is currently out of stock",
                variant: "destructive",
            });
            return;
        }

        setAddingToCart(true);
        try {
            const result = await addToCart(userProfile.id, product.id, 1);

            if (result.success) {
                console.log('Product added to cart:', result.cartItem);

                toast({
                    title: "Added to Cart!",
                    description: `${product.name} has been added to your cart`,
                    variant: "default",
                    duration: 3000,
                });

                // Call the callback if provided to refresh cart in parent component
                if (onCartUpdate) {
                    onCartUpdate();
                }
            } else {
                console.error('Failed to add to cart:', result.error);
                toast({
                    title: "Failed to Add to Cart",
                    description: "Please try again",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast({
                title: "Error",
                description: "An error occurred while adding to cart",
                variant: "destructive",
            });
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="relative overflow-hidden">
                <Link to={`/product/${product.id}`}>
                    <img
                        src={mainImage}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </Link>
                <div className="absolute top-2 right-2 space-y-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="w-8 h-8 p-0 rounded-full bg-white/80 hover:bg-white"
                    >
                        <Heart className="h-4 w-4" />
                    </Button>
                    {!product.inStock && (
                        <Badge variant="destructive" className="absolute top-2 left-2">
                            Out of Stock
                        </Badge>
                    )}
                </div>
                {product.originalPrice && (
                    <Badge variant="outline" className="absolute bottom-2 left-2 bg-red-500 text-white">
                        {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </Badge>
                )}
            </div>

            <CardContent className="p-4">
                <div className="mb-2">
                    <Badge variant="secondary" className="text-xs">
                        {product.category}
                    </Badge>
                </div>

                <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center mb-2">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`star ${i < Math.round(product.rating) ? 'filled' : 'empty'}`}
                                size={16}
                            />
                        ))}

                        <span className="text-sm text-gray-600 ml-1">
                            {product.rating.toFixed(1)} ({product.reviews} reviews)
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-green-600">
                            Ksh {product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                                Ksh {product.originalPrice.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="px-4 pb-4">
                <Button
                    className="w-full"
                    disabled={!product.inStock || addingToCart}
                    variant={product.inStock ? "default" : "secondary"}
                    onClick={handleAddToCart}
                >
                    {addingToCart ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Adding...
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {product.inStock ? "Add to Cart" : "Out of Stock"}
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ProductCard;