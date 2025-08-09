import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/hooks/product-data';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    // Use the first image as the main product image
    const mainImage = product.images[0];

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
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600 ml-1">
                            {product.rating} ({product.reviews} reviews)
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-green-600">
                            Ksh {product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                                Ksh {product.originalPrice.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="px-4 pb-4">
                <Button
                    className="w-full"
                    disabled={!product.inStock}
                    variant={product.inStock ? "default" : "secondary"}
                >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ProductCard;