// Products.jsx
import React, { useState, useEffect } from 'react';
import './AvailableProducts.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Mock affiliate product data
    const mockProducts = [
        {
            id: 1,
            name: "Wireless Earbuds Pro",
            clicks: 1247,
            conversions: 89,
            commission: "$4.50",
            price: "$129.99",
            status: "Active",
            category: "Electronics"
        },
        {
            id: 2,
            name: "Fitness Tracker Watch",
            clicks: 892,
            conversions: 45,
            commission: "$3.20",
            price: "$79.99",
            status: "Active",
            category: "Fitness"
        },
        {
            id: 3,
            name: "Organic Skincare Set",
            clicks: 567,
            conversions: 23,
            commission: "$8.75",
            price: "$49.99",
            status: "Low",
            category: "Beauty"
        },
        {
            id: 4,
            name: "Gaming Keyboard RGB",
            clicks: 2103,
            conversions: 156,
            commission: "$6.25",
            price: "$89.99",
            status: "High",
            category: "Gaming"
        },
        {
            id: 5,
            name: "Yoga Mat Premium",
            clicks: 431,
            conversions: 34,
            commission: "$5.50",
            price: "$34.99",
            status: "Active",
            category: "Fitness"
        },
        {
            id: 6,
            name: "Smart Home Speaker",
            clicks: 1789,
            conversions: 67,
            commission: "$7.80",
            price: "$199.99",
            status: "Active",
            category: "Electronics"
        },
        {
            id: 7,
            name: "Blender Professional",
            clicks: 324,
            conversions: 18,
            commission: "$12.50",
            price: "$159.99",
            status: "Active",
            category: "Home"
        },
        {
            id: 8,
            name: "Running Shoes",
            clicks: 756,
            conversions: 42,
            commission: "$9.99",
            price: "$119.99",
            status: "High",
            category: "Fitness"
        }
    ];

    // Get unique categories for filter
    const categories = ['All', ...new Set(mockProducts.map(product => product.category))];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setProducts(mockProducts);
            setFilteredProducts(mockProducts);
            setLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        if (selectedCategory === 'All') {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(product => product.category === selectedCategory));
        }
    }, [selectedCategory, products]);

    const calculateConversionRate = (clicks, conversions) => {
        return clicks > 0 ? ((conversions / clicks) * 100).toFixed(1) : '0.0';
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

                        <button className="copy-link-btn">
                            Copy Link
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Products;