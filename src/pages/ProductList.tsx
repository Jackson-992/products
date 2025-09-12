import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ProductCard from "@/components/ProductCard";
import Loader from "@/components/Loader";
import "./product-list.css";
import { Product } from "@/types/Product";
import { getProducts } from "@/services/ProductService";

const ProductList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);

    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
                {/* Header */}
                <div className="product-list-header">
                    {/* Search + Filters */}
                    <div className="search-filters-container">
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

                {/* Results Info */}
                <div className="results-info">
                    <p className="results-info-text">
                        Showing {filteredProducts.length} of {products.length} products
                        {searchQuery && <span> for "{searchQuery}"</span>}
                    </p>
                </div>

                {/* Products Grid */}
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
                    <div
                        className={`products-grid ${
                            viewMode === "grid" ? "grid-view" : "list-view"
                        }`}
                    >
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
