import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { mockProducts, Product } from '@/hooks/product-data.ts';
import ProductTable from './ProductTable';
import EditProductDialog from './EditProductDialog';
import AnalyticsTab from './AnalyticsTab';
import './MasterDashboard.css';

const MasterDashboard = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>(mockProducts);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteProduct = (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter((p) => p.id !== id));
        }
    };

    return (
        <div className="master-dashboard">
            <div className="container">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1>Product Dashboard</h1>
                        <p>Manage your product inventory and listings</p>
                    </div>
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
                        />
                    </TabsContent>

                    <TabsContent value="analytics">
                        <AnalyticsTab />
                    </TabsContent>
                </Tabs>

                {/* Edit Product Dialog */}
                <EditProductDialog
                    editingProduct={editingProduct}
                    setEditingProduct={setEditingProduct}
                    setProducts={setProducts}
                />
            </div>
        </div>
    );
};

export default MasterDashboard;