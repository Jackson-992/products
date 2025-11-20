import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { Product } from '@/types/Product.ts';
import ProductTable from './Products/ProductTable.tsx';
import EditProductDialog from './Products/EditProductDialog.tsx';
import AnalyticsTab from './Analytics/AnalyticsTab.tsx';
import UsersTable from './Users/UsersTable.tsx';
import OrderTable from './Orders/OrderTable.tsx';
import AffilliatesTable from './Affilliates/AffilliatesTable.tsx';
import Payment from './Payment/Payment.tsx'
import {getProducts} from '@/services/CommonServices/ProductService.ts';
import { deleteProduct } from '@/services/AdminServices/adminProductService.ts';
import { useIsAdmin } from '@/hooks/userIsAdmin';
import './MasterDashboard.css';

const MasterDashboard = () => {
    const navigate = useNavigate();
    const { isAdmin, loading: adminLoading, error: adminError } = useIsAdmin();

    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Check admin status and redirect if not admin
    useEffect(() => {
        if (!adminLoading && !isAdmin) {
            navigate('/', { replace: true });
        }
    }, [isAdmin, adminLoading, navigate]);

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

        if (isAdmin) {
            fetchProducts();
        }
    }, [isAdmin]);

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
            const productId = parseInt(id);
            await deleteProduct(productId);
            setProducts(products.filter((p) => p.id !== id));
            alert('Product deleted successfully!');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product. Please try again.');
        } finally {
            setIsDeleting(null);
        }
    };

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

    // Show generic loading while checking admin status (no admin-specific text)
    if (adminLoading) {
        return (
            <div className="master-dashboard">
                <div className="container">
                    <div className="dashboard-header">
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Redirect is happening, show nothing or minimal loading
    if (!isAdmin) {
        return null;
    }

    // Show error if admin check failed (only admins will see this)
    if (adminError) {
        return (
            <div className="master-dashboard">
                <div className="container">
                    <div className="dashboard-header">
                        <h1>Admin Dashboard</h1>
                        <p className="error-message">Error verifying admin status: {adminError}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Products loading state
    if (loading) {
        return (
            <div className="master-dashboard">
                <div className="container">
                    <div className="dashboard-header">
                        <h1>Admin Dashboard</h1>
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Products error state
    if (error) {
        return (
            <div className="master-dashboard">
                <div className="container">
                    <div className="dashboard-header">
                        <h1>Admin Dashboard</h1>
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

    // Main admin dashboard content
    return (
        <div className="master-dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1>Admin Dashboard</h1>
                    </div>
                    <button
                        onClick={refreshProducts}
                        className="refresh-button"
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                <Tabs defaultValue="products">
                    <div className="tabs-scroll-container">
                        <TabsList className="Tabs-list">
                            <TabsTrigger value="products">Products</TabsTrigger>
                            <TabsTrigger value="users">Users</TabsTrigger>
                            <TabsTrigger value="orders">Orders</TabsTrigger>
                            <TabsTrigger value="sellers">Affiliates</TabsTrigger>
                            <TabsTrigger value="payments">Payments</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        </TabsList>
                    </div>

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

                    <TabsContent value="users">
                        <UsersTable />
                    </TabsContent>

                    <TabsContent value="orders">
                        <OrderTable />
                    </TabsContent>

                    <TabsContent value="analytics">
                        <AnalyticsTab products={products} />
                    </TabsContent>

                    <TabsContent value="sellers">
                        <AffilliatesTable/>
                    </TabsContent>

                    <TabsContent value="payments">
                        <Payment/>
                    </TabsContent>

                </Tabs>

                <EditProductDialog
                    editingProduct={editingProduct}
                    setEditingProduct={setEditingProduct}
                    setProducts={setProducts}
                    refreshProducts={refreshProducts}
                />
            </div>
        </div>
    );
};

export default MasterDashboard;