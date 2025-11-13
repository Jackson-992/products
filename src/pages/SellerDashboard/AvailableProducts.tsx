import React, { useState, useEffect } from 'react';
import { getProducts } from '@/services/CommonServices/ProductService.ts';
import { useAffiliateCode } from '@/hooks/checkAffiliateCode.ts';
import './AvailableProducts.css';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { toast } = useToast();
    const { affiliateCode } = useAffiliateCode();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const supabaseProducts = await getProducts();

                const transformedProducts = supabaseProducts.map(product => ({
                    id: product.id,
                    name: product.name,
                    conversions: 0,
                    commission: "8%",
                    price: `Ksh ${product.price}`,
                    status: product.inStock ? "Active" : "Inactive",
                    category: product.category || "Uncategorized"
                }));

                setProducts(transformedProducts);
                setFilteredProducts(transformedProducts);
            } catch (error) {
                console.error('Error fetching products:', error);
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

    const categories = ['All', ...new Set(products.map(product => product.category))];

    const copyAffiliateLink = async (productId, productName, event) => {
        event.stopPropagation(); // Prevent navigation when clicking the button

        try {
            const baseUrl = window.location.origin;
            const affiliateLink = `${baseUrl}/product/${productId}?affiliate=${affiliateCode}`;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(affiliateLink);
                toast({
                    title: "Link Copied",
                    description: "Link for " + productName + " copied to clipboard",
                    variant: "default",
                });
            } else {
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
            const baseUrl = window.location.origin;
            const affiliateLink = `${baseUrl}/product/${productId}?affiliate=${affiliateCode}`;
            alert(`Please copy this link manually:\n\n${affiliateLink}`);
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
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
                        <div
                            key={product.id}
                            className="product-card-compact"
                            onClick={() => handleProductClick(product.id)}
                        >
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
                                    <span className="metric-value conversions">{product.conversions}</span>
                                    <span className="metric-label">Sales</span>
                                </div>
                                <div className="metric-compact">
                                    <span className="metric-value commission">{product.commission}</span>
                                    <span className="metric-label">Commission</span>
                                </div>
                            </div>

                            <button
                                className="copy-link-btn"
                                onClick={(e) => copyAffiliateLink(product.id, product.name, e)}
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