import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Edit, Trash2 } from 'lucide-react';
import { Product } from '@/hooks/product-data.ts';
import AddProductDialog from './AddProductDialog';
import './ProductTable.css';

interface ProductTableProps {
    products: Product[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    setEditingProduct: (product: Product | null) => void;
    handleDeleteProduct: (id: string) => void;
    setProducts: (products: Product[]) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
                                                       products,
                                                       searchQuery,
                                                       setSearchQuery,
                                                       setEditingProduct,
                                                       handleDeleteProduct,
                                                       setProducts
                                                   }) => {
    const getStatusBadge = (status: string, stockCount: number) => {
        if (status === 'out_of_stock' || stockCount === 0) {
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
                                    {product.images.length > 0 && (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="product-image"
                                        />
                                    )}
                                </TableCell>
                                <TableCell className="product-info">
                                    <div className="product-name">{product.name}</div>
                                    <div className="product-description">
                                        {product.description}
                                    </div>
                                </TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>
                                    {product.originalPrice ? (
                                        <div>
                                            <span className="discount-price">Ksh {product.price.toFixed(2)}</span>
                                            <span className="original-price">
                        Ksh {product.originalPrice.toFixed(2)}
                      </span>
                                        </div>
                                    ) : (
                                        <span>Ksh {product.price.toFixed(2)}</span>
                                    )}
                                </TableCell>
                                <TableCell>{product.stockCount}</TableCell>
                                <TableCell>
                                    {getStatusBadge(product.status, product.stockCount)}
                                </TableCell>
                                <TableCell>
                                    <div className="action-buttons">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setEditingProduct(product)}
                                                >
                                                    <Edit className="icon" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                >
                                                    <Trash2 className="icon delete-icon" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Delete</TooltipContent>
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