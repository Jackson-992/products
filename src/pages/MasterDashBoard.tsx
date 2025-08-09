import React, { useState } from 'react';
import { Plus, Package, Edit, Trash2, Image as ImageIcon, DollarSign, Tag, Info, Search, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { mockProducts, Product } from '@/hooks/product-data';
import './MasterDashboard.css';

const MasterDashboard = () => {
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>(mockProducts); // Use imported mockProducts

    const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'status' | 'rating' | 'reviews' | 'seller'>>({
        inStock: false,
        name: '',
        price: 0,
        originalPrice: undefined,
        images: [],
        category: '',
        stockCount: 0,
        description: '',
        features: [''],
        specifications: { '': '' }
    });

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Filter products based on search
    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle image upload (mock function)
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isMultiple = false) => {
        if (e.target.files && e.target.files[0]) {
            const files = Array.from(e.target.files);
            const readers = files.map(file => {
                const reader = new FileReader();
                return new Promise<string>((resolve) => {
                    reader.onload = (event) => {
                        if (event.target?.result) {
                            resolve(event.target.result as string);
                        }
                    };
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(readers).then((images) => {
                if (isMultiple) {
                    setNewProduct(prev => ({
                        ...prev,
                        images: [...prev.images, ...images]
                    }));
                } else {
                    setNewProduct(prev => ({
                        ...prev,
                        images: [...images]
                    }));
                }
            });
        }
    };

    // Add new product
    const handleAddProduct = (e: React.FormEvent) => {
        e.preventDefault();
        const product: Product = {
            ...newProduct,
            id: Date.now().toString(),
            status: newProduct.stockCount > 0 ? 'active' : 'out_of_stock',
            rating: 0, // Default rating
            reviews: 0, // Default reviews count
            seller: { // Default seller info
                name: 'My Store',
                rating: 5,
                totalSales: '0'
            },
            // Clean empty features and specifications
            features: newProduct.features.filter(f => f.trim() !== ''),
            specifications: Object.fromEntries(
                Object.entries(newProduct.specifications)
                    .filter(([key, value]) => key.trim() !== '' && value.trim() !== '')
            ),
        };
        setProducts([...products, product]);
        setIsAddProductOpen(false);
        resetNewProduct();
    };

    // Edit product
    const handleEditProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        const updatedProduct: Product = {
            ...editingProduct,
            // Clean empty features and specifications
            features: editingProduct.features.filter(f => f.trim() !== ''),
            specifications: Object.fromEntries(
                Object.entries(editingProduct.specifications)
                    .filter(([key, value]) => key.trim() !== '' && value.trim() !== '')
            ),
        };

        const updatedProducts = products.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
        );
        setProducts(updatedProducts);
        setEditingProduct(null);
    };

    // Delete product
    const handleDeleteProduct = (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter((p) => p.id !== id));
        }
    };

    // Reset new product form
    const resetNewProduct = () => {
        setNewProduct({
            inStock: false,
            name: '',
            price: 0,
            originalPrice: undefined,
            images: [],
            category: '',
            stockCount: 0,
            description: '',
            features: [''],
            specifications: { '': '' }
        });
    };

    // Add new feature field
    const addFeatureField = () => {
        setNewProduct(prev => ({
            ...prev,
            features: [...prev.features, '']
        }));
    };

    // Remove feature field
    const removeFeatureField = (index: number) => {
        setNewProduct(prev => {
            const newFeatures = [...prev.features];
            newFeatures.splice(index, 1);
            return {
                ...prev,
                features: newFeatures.length > 0 ? newFeatures : ['']
            };
        });
    };

    // Update feature value
    const updateFeature = (index: number, value: string) => {
        setNewProduct(prev => {
            const newFeatures = [...prev.features];
            newFeatures[index] = value;
            return {
                ...prev,
                features: newFeatures
            };
        });
    };

    // Add new specification field
    const addSpecificationField = () => {
        setNewProduct(prev => ({
            ...prev,
            specifications: { ...prev.specifications, '': '' }
        }));
    };

    // Remove specification field
    const removeSpecificationField = (key: string) => {
        setNewProduct(prev => {
            const newSpecs = { ...prev.specifications };
            delete newSpecs[key];
            return {
                ...prev,
                specifications: Object.keys(newSpecs).length > 0 ? newSpecs : { '': '' }
            };
        });
    };

    // Update specification key or value
    const updateSpecification = (oldKey: string, newKey: string, value: string) => {
        setNewProduct(prev => {
            const newSpecs = { ...prev.specifications };
            if (oldKey !== newKey) {
                delete newSpecs[oldKey];
                newSpecs[newKey] = value;
            } else {
                newSpecs[newKey] = value;
            }
            return {
                ...prev,
                specifications: newSpecs
            };
        });
    };

    // Get status badge
    const getStatusBadge = (status: string, stockCount: number) => {
        if (status === 'out_of_stock' || stockCount === 0) {
            return <Badge variant="destructive">Out of Stock</Badge>;
        }
        if (stockCount < 10) {
            return <Badge variant="secondary">Low Stock</Badge>;
        }
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
    };

    return (
        <div className="master-dashboard bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage your product inventory and listings
                        </p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search products..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                            <DialogTrigger asChild>
                                <Button className="shrink-0">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Product
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Add New Product</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAddProduct} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Product Name</Label>
                                            <Input
                                                id="name"
                                                value={newProduct.name}
                                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Price (Ksh)</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                value={newProduct.price || ''}
                                                onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="originalPrice">Original Price (Ksh)</Label>
                                            <Input
                                                id="originalPrice"
                                                type="number"
                                                step="0.01"
                                                value={newProduct.originalPrice || ''}
                                                onChange={(e) => setNewProduct({
                                                    ...newProduct,
                                                    originalPrice: e.target.value ? parseFloat(e.target.value) : undefined
                                                })}
                                                placeholder="Optional"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category</Label>
                                            <Select
                                                value={newProduct.category}
                                                onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Electronics">Electronics</SelectItem>
                                                    <SelectItem value="Fashion">Fashion</SelectItem>
                                                    <SelectItem value="Home & Kitchen">Home & Kitchen</SelectItem>
                                                    <SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="stock">Stock Quantity</Label>
                                            <Input
                                                id="stock"
                                                type="number"
                                                value={newProduct.stockCount}
                                                onChange={(e) => setNewProduct({ ...newProduct, stockCount: parseInt(e.target.value) || 0 })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Product Images</Label>
                                        <div className="flex flex-wrap gap-4">
                                            {newProduct.images.map((image, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={image}
                                                        alt={`Preview ${index}`}
                                                        className="w-24 h-24 rounded-lg object-cover border"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                                                        onClick={() => setNewProduct(prev => ({
                                                            ...prev,
                                                            images: prev.images.filter((_, i) => i !== index)
                                                        }))}
                                                    >
                                                        <X className="h-4 w-4 text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                            <Label
                                                htmlFor="image-upload"
                                                className="border-2 border-dashed rounded-lg w-24 h-24 flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <div className="text-center p-2">
                                                    <ImageIcon className="h-6 w-6 mx-auto text-gray-400" />
                                                    <p className="text-xs text-gray-500 mt-1">Add Images</p>
                                                </div>
                                            </Label>
                                            <Input
                                                id="image-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleImageUpload(e, true)}
                                                multiple
                                            />
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            JPEG, PNG, or WEBP (Max 2MB each)
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={newProduct.description}
                                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                            rows={4}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label>Features</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addFeatureField}
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add Feature
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {newProduct.features.map((feature, index) => (
                                                <div key={index} className="flex gap-2 items-center">
                                                    <Input
                                                        value={feature}
                                                        onChange={(e) => updateFeature(index, e.target.value)}
                                                        placeholder="Enter product feature"
                                                    />
                                                    {newProduct.features.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeFeatureField(index)}
                                                        >
                                                            <X className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label>Specifications</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addSpecificationField}
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add Specification
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {Object.entries(newProduct.specifications).map(([key, value], index) => (
                                                <div key={index} className="grid grid-cols-5 gap-2 items-center">
                                                    <Input
                                                        className="col-span-2"
                                                        value={key}
                                                        onChange={(e) => updateSpecification(key, e.target.value, value)}
                                                        placeholder="Spec name"
                                                    />
                                                    <span className="text-center">:</span>
                                                    <Input
                                                        className="col-span-2"
                                                        value={value}
                                                        onChange={(e) => updateSpecification(key, key, e.target.value)}
                                                        placeholder="Spec value"
                                                    />
                                                    {Object.keys(newProduct.specifications).length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeSpecificationField(key)}
                                                        >
                                                            <X className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsAddProductOpen(false);
                                                resetNewProduct();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit">Add Product</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="products">
                    <TabsList className="grid w-full grid-cols-2 max-w-xs mb-6">
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="products">
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Inventory</CardTitle>
                                <CardDescription>
                                    {filteredProducts.length} products found
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Image</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProducts.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    {product.images.length > 0 && (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            className="w-12 h-12 rounded-md object-cover"
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="line-clamp-1">{product.name}</div>
                                                    <div className="text-sm text-gray-500 line-clamp-1">
                                                        {product.description}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{product.category}</TableCell>
                                                <TableCell>
                                                    {product.originalPrice ? (
                                                        <div>
                                                            <span className="text-green-600">Ksh {product.price.toFixed(2)}</span>
                                                            <span className="text-sm text-gray-500 line-through ml-2">
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
                                                <TableCell className="text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => setEditingProduct(product)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
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
                                                                    <Trash2 className="h-4 w-4 text-red-500" />
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
                    </TabsContent>

                    <TabsContent value="analytics">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sales Analytics</CardTitle>
                                <CardDescription>
                                    View product performance and sales trends
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-96 flex items-center justify-center">
                                <div className="text-center text-gray-500 dark:text-gray-400">
                                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <h3 className="text-lg font-medium">Analytics Coming Soon</h3>
                                    <p className="mt-1">Sales charts and metrics will appear here</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Edit Product Dialog */}
            {editingProduct && (
                <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditProduct} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Product Name</Label>
                                    <Input
                                        id="edit-name"
                                        value={editingProduct.name}
                                        onChange={(e) =>
                                            setEditingProduct({ ...editingProduct, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-price">Price (Ksh)</Label>
                                    <Input
                                        id="edit-price"
                                        type="number"
                                        step="0.01"
                                        value={editingProduct.price}
                                        onChange={(e) =>
                                            setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-originalPrice">Original Price (Ksh)</Label>
                                    <Input
                                        id="edit-originalPrice"
                                        type="number"
                                        step="0.01"
                                        value={editingProduct.originalPrice || ''}
                                        onChange={(e) =>
                                            setEditingProduct({
                                                ...editingProduct,
                                                originalPrice: e.target.value ? parseFloat(e.target.value) : undefined
                                            })
                                        }
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-category">Category</Label>
                                    <Select
                                        value={editingProduct.category}
                                        onValueChange={(value) =>
                                            setEditingProduct({ ...editingProduct, category: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Electronics">Electronics</SelectItem>
                                            <SelectItem value="Fashion">Fashion</SelectItem>
                                            <SelectItem value="Home & Kitchen">Home & Kitchen</SelectItem>
                                            <SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-stock">Stock Quantity</Label>
                                    <Input
                                        id="edit-stock"
                                        type="number"
                                        value={editingProduct.stockCount}
                                        onChange={(e) =>
                                            setEditingProduct({
                                                ...editingProduct,
                                                stockCount: parseInt(e.target.value) || 0,
                                                status: parseInt(e.target.value) > 0 ? 'active' : 'out_of_stock',
                                            })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Product Images</Label>
                                <div className="flex flex-wrap gap-4">
                                    {editingProduct.images.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={image}
                                                alt={`Preview ${index}`}
                                                className="w-24 h-24 rounded-lg object-cover border"
                                            />
                                            <button
                                                type="button"
                                                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                                                onClick={() => setEditingProduct(prev => ({
                                                    ...prev!,
                                                    images: prev!.images.filter((_, i) => i !== index)
                                                }))}
                                            >
                                                <X className="h-4 w-4 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                    <Label
                                        htmlFor="edit-image-upload"
                                        className="border-2 border-dashed rounded-lg w-24 h-24 flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <div className="text-center p-2">
                                            <ImageIcon className="h-6 w-6 mx-auto text-gray-400" />
                                            <p className="text-xs text-gray-500 mt-1">Add Images</p>
                                        </div>
                                    </Label>
                                    <Input
                                        id="edit-image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e, true)}
                                        multiple
                                    />
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    JPEG, PNG, or WEBP (Max 2MB each)
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editingProduct.description}
                                    onChange={(e) =>
                                        setEditingProduct({ ...editingProduct, description: e.target.value })
                                    }
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>Features</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingProduct(prev => ({
                                            ...prev!,
                                            features: [...prev!.features, '']
                                        }))}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Feature
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {editingProduct.features.map((feature, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <Input
                                                value={feature}
                                                onChange={(e) => {
                                                    const newFeatures = [...editingProduct.features];
                                                    newFeatures[index] = e.target.value;
                                                    setEditingProduct({
                                                        ...editingProduct,
                                                        features: newFeatures
                                                    });
                                                }}
                                                placeholder="Enter product feature"
                                            />
                                            {editingProduct.features.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        const newFeatures = [...editingProduct.features];
                                                        newFeatures.splice(index, 1);
                                                        setEditingProduct({
                                                            ...editingProduct,
                                                            features: newFeatures.length > 0 ? newFeatures : ['']
                                                        });
                                                    }}
                                                >
                                                    <X className="h-4 w-4 text-red-500" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>Specifications</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingProduct(prev => ({
                                            ...prev!,
                                            specifications: { ...prev!.specifications, '': '' }
                                        }))}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Specification
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {Object.entries(editingProduct.specifications).map(([key, value], index) => (
                                        <div key={index} className="grid grid-cols-5 gap-2 items-center">
                                            <Input
                                                className="col-span-2"
                                                value={key}
                                                onChange={(e) => {
                                                    const newSpecs = { ...editingProduct.specifications };
                                                    delete newSpecs[key];
                                                    newSpecs[e.target.value] = value;
                                                    setEditingProduct({
                                                        ...editingProduct,
                                                        specifications: newSpecs
                                                    });
                                                }}
                                                placeholder="Spec name"
                                            />
                                            <span className="text-center">:</span>
                                            <Input
                                                className="col-span-2"
                                                value={value}
                                                onChange={(e) => {
                                                    const newSpecs = { ...editingProduct.specifications };
                                                    newSpecs[key] = e.target.value;
                                                    setEditingProduct({
                                                        ...editingProduct,
                                                        specifications: newSpecs
                                                    });
                                                }}
                                                placeholder="Spec value"
                                            />
                                            {Object.keys(editingProduct.specifications).length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        const newSpecs = { ...editingProduct.specifications };
                                                        delete newSpecs[key];
                                                        setEditingProduct({
                                                            ...editingProduct,
                                                            specifications: Object.keys(newSpecs).length > 0 ? newSpecs : { '': '' }
                                                        });
                                                    }}
                                                >
                                                    <X className="h-4 w-4 text-red-500" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingProduct(null)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Save Changes</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default MasterDashboard;