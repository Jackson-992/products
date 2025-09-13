import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Edit, Trash2 } from 'lucide-react';
import { Product } from '@/types/Product.ts';
import AddProductDialog from './AddProductDialog';
import './ProductTable.css';

interface ProductTableProps {
    products: Product[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    setEditingProduct: (product: Product | null) => void;
    handleDeleteProduct: (id: string) => void;
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    isDeleting?: string | null; // Add optional isDeleting prop
}

const ProductTable: React.FC<ProductTableProps> = ({
                                                       products,
                                                       searchQuery,
                                                       setSearchQuery,
                                                       setEditingProduct,
                                                       handleDeleteProduct,
                                                       setProducts,
                                                       isDeleting
                                                   }) => {
    const getStatusBadge = (inStock: boolean, stockCount: number) => {
        if (!inStock || stockCount === 0) {
            return <Badge variant="destructive">Out of Stock</Badge>;
        }
        if (stockCount < 10) {
            return <Badge variant="secondary">Low Stock</Badge>;
        }
        return <Badge className="status-active">Active</Badge>;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Product Inventory</CardTitle>
                <CardDescription>{products.length} products found</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="table-controls">
                    <div className="search-container">
                        <Search className="search-icon" />
                        <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <AddProductDialog setProducts={setProducts} />
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="image-column">Image</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="actions-column">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="product-image"
                                            onError={(e) => {
                                                // Fallback if image fails to load
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="no-image-placeholder">No Image</div>
                                    )}
                                </TableCell>
                                <TableCell className="product-info">
                                    <div className="product-name">{product.name}</div>
                                    {product.description && (
                                        <div className="product-description">{product.description}</div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{product.category}</Badge>
                                </TableCell>
                                <TableCell>
                                    {product.originalPrice && product.originalPrice > product.price ? (
                                        <div className="price-container">
                                            <span className="discount-price">Ksh {product.price.toFixed(2)}</span>
                                            <span className="original-price">
                                                Ksh {product.originalPrice.toFixed(2)}
                                            </span>
                                        </div>
                                    ) : (
                                        <span>Ksh {product.price.toFixed(2)}</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={product.stockCount === 0 ? "destructive" : "outline"}
                                    >
                                        {product.stockCount} in stock
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(product.inStock, product.stockCount)}
                                </TableCell>
                                <TableCell>
                                    <div className="action-buttons">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setEditingProduct(product)}
                                                    className="edit-btn"
                                                >
                                                    <Edit className="icon" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit Product</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    disabled={isDeleting === product.id}
                                                    className="delete-btn"
                                                >
                                                    {isDeleting === product.id ? (
                                                        <div className="loading-spinner"></div>
                                                    ) : (
                                                        <Trash2 className="icon delete-icon" />
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {isDeleting === product.id ? 'Deleting...' : 'Delete Product'}
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default ProductTable;