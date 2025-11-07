import React, { useState, useEffect } from 'react';
import { getProducts } from '@/services/ProductService.ts'; // Adjust import path as needed
import './AvailableProducts.css';
import { useToast } from '@/components/ui/use-toast';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { toast } = useToast();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const supabaseProducts = await getProducts();

                // Transform Supabase products to match your mock data structure
                const transformedProducts = supabaseProducts.map(product => ({
                    id: product.id,
                    name: product.name,
                    clicks: 0, // Default value since this data isn't available
                    conversions: 0, // Default value since this data isn't available
                    commission: "8%", // Default value
                    price: `Ksh ${product.price}`,
                    status: product.inStock ? "Active" : "Inactive",
                    category: product.category || "Uncategorized"
                }));

                setProducts(transformedProducts);
                setFilteredProducts(transformedProducts);
            } catch (error) {
                console.error('Error fetching products:', error);
                // Fallback to empty array if there's an error
                setProducts([]);
                setFilteredProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        if (selectedCategory === 'All') {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(product => product.category === selectedCategory));
        }
    }, [selectedCategory, products]);

    // Get unique categories for filter
    const categories = ['All', ...new Set(products.map(product => product.category))];

    const calculateConversionRate = (clicks, conversions) => {
        return clicks > 0 ? ((conversions / clicks) * 100).toFixed(1) : '0.0';
    };

    const copyAffiliateLink = async (productId, productName) => {
        try {
            // Generate affiliate link - you'll need to implement your affiliate code logic
            const affiliateCode = "AFF23M"; // You'll need to get this from user's profile
            const baseUrl = window.location.origin;
            const affiliateLink = `${baseUrl}/product/${productId}?affiliate=${affiliateCode}`;

            // Check if clipboard API is available
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(affiliateLink);
                toast({
                    title: "Link Copied",
                    description: "Link for " + productName + " copied to clipboard",
                    variant: "default",
                });
            } else {
                // Fallback for browsers that don't support clipboard API
                const textArea = document.createElement('textarea');
                textArea.value = affiliateLink;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                toast({
                    title: "Link Copied",
                    description: "Link for " + productName + " copied to clipboard",
                    variant: "default",
                });
            }
        } catch (err) {
            console.error('Failed to copy link:', err);
            // Alternative fallback - show the link for manual copy
            const affiliateCode = "AFF23M";
            const baseUrl = window.location.origin;
            const affiliateLink = `${baseUrl}/product/${productId}?affiliate=${affiliateCode}`;
            alert(`Please copy this link manually:\n\n${affiliateLink}`);
        }
    };

    if (loading) {
        return (
            <div className="products-loading">
                Loading products...
            </div>
        );
    }

    return (
        <div className="affiliate-products">
            <div className="products-header">
                <h2>Affiliate Products ({filteredProducts.length})</h2>
                <div className="category-filter">
                    <label htmlFor="category-select">Category: </label>
                    <select
                        id="category-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="filter-select"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="no-products">
                    No products available for affiliate program.
                </div>
            ) : (
                <div className="products-grid-compact">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="product-card-compact">
                            <div className="product-main-row">
                                <div className="product-title">
                                    <h3>{product.name}</h3>
                                    <div className="product-meta">
                                        <span className="category-tag">{product.category}</span>
                                        <span className="product-price">{product.price}</span>
                                    </div>
                                </div>
                                <span className={`status-dot status-${product.status.toLowerCase()}`}></span>
                            </div>

                            <div className="Metrics-grid">
                                <div className="metric-compact">
                                    <span className="metric-value clicks">{product.clicks.toLocaleString()}</span>
                                    <span className="metric-label">Clicks</span>
                                </div>
                                <div className="metric-compact">
                                    <span className="metric-value conversions">{product.conversions}</span>
                                    <span className="metric-label">Sales</span>
                                </div>
                                <div className="metric-compact">
                                    <span className="metric-value conversions">
                                        {calculateConversionRate(product.clicks, product.conversions)}%
                                    </span>
                                    <span className="metric-label">Rate</span>
                                </div>
                                <div className="metric-compact">
                                    <span className="metric-value commission">{product.commission}</span>
                                    <span className="metric-label">Commission</span>
                                </div>
                            </div>

                            <button
                                className="copy-link-btn"
                                onClick={() => copyAffiliateLink(product.id, product.name)}
                            >
                                Copy Link
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Products;