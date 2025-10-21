import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Flame, Star, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/ProductCard";
import Loader from "@/components/Loader";
import "./product-list.css";
import { Product } from "@/types/Product";
import { getProducts } from "@/services/ProductService";

const ProductList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);

    const [sortBy, setSortBy] = useState("name");
    const [filterCategory, setFilterCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

    // ✅ Fetch products from Supabase
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (err) {
                console.error("Failed to load products:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // ✅ Get unique categories from products
    const categories = ["all", ...new Set(products.map((p) => p.category))];

    // ✅ Filter + Sort
    const filteredProducts = products
        .filter((product) => {
            const matchesCategory =
                filterCategory === "all" || product.category === filterCategory;
            const matchesSearch =
                !searchQuery ||
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "price-low":
                    return a.price - b.price;
                case "price-high":
                    return b.price - a.price;
                case "rating":
                    return b.rating - a.rating;
                case "name":
                default:
                    return a.name.localeCompare(b.name);
            }
        });

    // Get featured products for different sections
    const hotDeals = products.filter(product => product.rating >= 4.5).slice(0, 8);
    const newArrivals = products.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()).slice(0, 8);
    const bestSellers = products.filter(product => product.rating >= 4).slice(0, 8);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchParams(searchQuery ? { search: searchQuery } : {});
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Loader />
            </div>
        );
    }

    return (
        <div className="product-list-container">
            <div className="product-list-inner">
                {/* Promotional Banner */}
                <div className="promotional-banner">
                    <div className="banner-content">
                        <h2>Summer Sale! Up to 50% Off</h2>
                        <p>Limited time offer on selected items</p>
                        <button className="banner-cta">Shop Now</button>
                    </div>
                </div>

                {/* Header with Search and Filters */}
                <div className="product-list-header">
                    <div className="search-filters-container">
                        <form onSubmit={handleSearch} className="search-Form">
                            <div className="search-input-Container">
                                <Search className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        </form>

                        <div className="filters-container">
                            {/* Category Filter */}
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger className="select-trigger">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category === "all" ? "All Categories" : category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Sort */}
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="select-trigger">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Name A-Z</SelectItem>
                                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                                    <SelectItem value="rating">Highest Rated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Featured Sections */}
                {!searchQuery && filterCategory === "all" && (
                    <>
                        {/* Hot Deals Section */}
                        {hotDeals.length > 0 && (
                            <section className="featured-section">
                                <div className="section-header">
                                    <Flame className="section-icon" />
                                    <h2 className="section-title">Hot Deals</h2>
                                </div>
                                <div className="horizontal-scroll-container">
                                    <div className="horizontal-scroll">
                                        {hotDeals.map((product) => (
                                            <div key={`hot-${product.id}`} className="scroll-item">
                                                <ProductCard product={product} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* New Arrivals Section */}
                        {newArrivals.length > 0 && (
                            <section className="featured-section">
                                <div className="section-header">
                                    <Clock className="section-icon" />
                                    <h2 className="section-title">New Arrivals</h2>
                                </div>
                                <div className="horizontal-scroll-container">
                                    <div className="horizontal-scroll">
                                        {newArrivals.map((product) => (
                                            <div key={`new-${product.id}`} className="scroll-item">
                                                <ProductCard product={product} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Promotional Slot */}
                        <div className="promo-slot">
                            <div className="promo-card">
                                <h3>Free Shipping</h3>
                                <p>On orders over $50</p>
                            </div>
                            <div className="promo-card promo-card-highlight">
                                <h3>Member Discount</h3>
                                <p>Extra 10% off for members</p>
                            </div>
                            <div className="promo-card">
                                <h3>Easy Returns</h3>
                                <p>30-day return policy</p>
                            </div>
                        </div>

                        {/* Best Sellers Section */}
                        {bestSellers.length > 0 && (
                            <section className="featured-section">
                                <div className="section-header">
                                    <Star className="section-icon" />
                                    <h2 className="section-title">Best Sellers</h2>
                                </div>
                                <div className="horizontal-scroll-container">
                                    <div className="horizontal-scroll">
                                        {bestSellers.map((product) => (
                                            <div key={`best-${product.id}`} className="scroll-item">
                                                <ProductCard product={product} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}
                    </>
                )}

                {/* Results Info */}
                <div className="results-info">
                    <p className="results-info-text">
                        Showing {filteredProducts.length} of {products.length} products
                        {searchQuery && <span> for "{searchQuery}"</span>}
                    </p>
                </div>

                {/* Main Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="no-products">
                        <div className="no-products-icon">
                            <Search />
                        </div>
                        <h3 className="no-products-title">No products found</h3>
                        <p className="no-products-message">
                            Try adjusting your search or filter criteria
                        </p>
                    </div>
                ) : (
                    <div className="products-Grid grid-view">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;