import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Users, Shield, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import Loader from "@/components/Loader";
import { getProducts } from "@/services/ProductService";
import { Product } from "@/types/Product"; // keep same interface

interface ProductCardProps {
    product: Product;
}
const Home:React.FC<ProductCardProps> = ({ product }) => {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const features = [
        {
            icon: ShoppingBag,
            title: "Wide Selection",
            description: "Thousands of products from trusted sellers worldwide",
        },
        {
            icon: Shield,
            title: "Secure Shopping",
            description: "Your payments and personal data are always protected",
        },
        {
            icon: Truck,
            title: "Fast Delivery",
            description: "Quick and reliable shipping to your doorstep",
        },
        {
            icon: Users,
            title: "Community",
            description: "Join millions of satisfied customers and sellers",
        },
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const products = await getProducts();

                // sort by rating, take top 4
                const topRated = [...products]
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 4);

                setFeaturedProducts(topRated);
            } catch (err: any) {
                console.error("Failed to load products:", err);
                setError("Could not load products. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Welcome to 254_Connect
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100">
                            Discover amazing products from sellers around the world
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/products">
                                <Button size="lg" variant="secondary" className="text-lg px-8">
                                    Start Shopping
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="join">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="text-lg px-8 text-black border-white hover:bg-white hover:text-blue-600"
                                >
                                    Become a Seller
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Why Choose 254_Connect?
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            We're committed to providing the best shopping experience for both
                            buyers and sellers
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className="text-center p-6 hover:shadow-lg transition-shadow"
                            >
                                <CardContent className="p-0">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <feature.icon className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600">{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Top Rated Products
                            </h2>
                            <p className="text-lg text-gray-600">
                                Our highest-rated items loved by customers
                            </p>
                        </div>
                        <Link to="/products">
                            <Button variant="outline">
                                View All Products
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
