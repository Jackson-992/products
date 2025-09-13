import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { Product } from '@/types/Product.ts';
import ProductTable from './ProductTable';
import EditProductDialog from './EditProductDialog';
import AnalyticsTab from './AnalyticsTab';
import {getProducts} from '@/services/ProductService.ts';
import { deleteProduct } from '@/services/adminProductService'; // Import delete function
import './MasterDashboard.css';

const MasterDashboard = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null); // Track which product is being deleted

    // Fetch products from Supabase
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const supabaseProducts = await getProducts();
                setProducts(supabaseProducts);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteProduct = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        try {
            setIsDeleting(id);

            // Convert string ID to number (assuming your IDs are numbers)
            const productId = parseInt(id);

            // Call the delete function from your service
            await deleteProduct(productId);

            // Remove the product from local state
            setProducts(products.filter((p) => p.id !== id));

            // Show success message
            alert('Product deleted successfully!');

        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product. Please try again.');
        } finally {
            setIsDeleting(null);
        }
    };

    // Refresh products function
    const refreshProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const supabaseProducts = await getProducts();
            setProducts(supabaseProducts);
        } catch (err) {
            console.error('Error refreshing products:', err);
            setError('Failed to refresh products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="master-dashboard">
                <div className="container">
                    <div className="dashboard-header">
                        <h1>Product Dashboard</h1>
                        <p>Loading products...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="master-dashboard">
                <div className="container">
                    <div className="dashboard-header">
                        <h1>Product Dashboard</h1>
                        <p className="error-message">{error}</p>
                        <button
                            onClick={refreshProducts}
                            className="retry-button"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="master-dashboard">
            <div className="container">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1>Product Dashboard</h1>
                    </div>
                    <button
                        onClick={refreshProducts}
                        className="refresh-button"
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : 'Refresh Products'}
                    </button>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="products">
                    <TabsList className="tabs-list">
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="products">
                        <ProductTable
                            products={filteredProducts}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            setEditingProduct={setEditingProduct}
                            handleDeleteProduct={handleDeleteProduct}
                            setProducts={setProducts}
                            isDeleting={isDeleting}
                        />
                    </TabsContent>

                    <TabsContent value="analytics">
                        <AnalyticsTab products={products} />
                    </TabsContent>
                </Tabs>

                {/* Edit Product Dialog */}
                <EditProductDialog
                    editingProduct={editingProduct}
                    setEditingProduct={setEditingProduct}
                    setProducts={setProducts}
                    refreshProducts={refreshProducts} // Pass refresh function
                />
            </div>
        </div>
    );
};

export default MasterDashboard;