import React, { useState } from 'react';
import { Plus, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { Product } from '@/hooks/product-data.ts';
import './AddProductDialog.css';

interface AddProductDialogProps {
    setProducts: (products: Product[]) => void;
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({ setProducts }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        inStock: false,
        name: '',
        price: 0,
        originalPrice: undefined as number | undefined,
        images: [] as string[],
        category: '',
        stockCount: 0,
        description: '',
        features: [''],
        specifications: { '': '' }
    });

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

    const handleAddProduct = (e: React.FormEvent) => {
        e.preventDefault();
        const product: Product = {
            ...newProduct,
            id: Date.now().toString(),
            status: newProduct.stockCount > 0 ? 'active' : 'out_of_stock',
            rating: 0,
            reviews: 0,
            seller: {
                name: 'My Store',
                rating: 5,
                totalSales: '0'
            },
            features: newProduct.features.filter(f => f.trim() !== ''),
            specifications: Object.fromEntries(
                Object.entries(newProduct.specifications)
                    .filter(([key, value]) => key.trim() !== '' && value.trim() !== '')
            ),
        };

        setProducts(prev => [...prev, product]);
        setIsOpen(false);
        resetNewProduct();
    };

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

    const addFeatureField = () => {
        setNewProduct(prev => ({
            ...prev,
            features: [...prev.features, '']
        }));
    };

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

    const addSpecificationField = () => {
        setNewProduct(prev => ({
            ...prev,
            specifications: { ...prev.specifications, '': '' }
        }));
    };

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

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="add-product-btn">
                    <Plus className="btn-icon" />
                    Add Product
                </Button>
            </DialogTrigger>
            <DialogContent className="dialog-content">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddProduct} className="form">
                    <div className="form-grid">
                        <div className="form-field">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-field">
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

                    <div className="form-grid">
                        <div className="form-field">
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
                        <div className="form-field">
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

                    <div className="form-grid">
                        <div className="form-field">
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

                    <div className="form-field">
                        <Label>Product Images</Label>
                        <div className="image-grid">
                            {newProduct.images.map((image, index) => (
                                <div key={index} className="image-preview">
                                    <img
                                        src={image}
                                        alt={`Preview ${index}`}
                                        className="preview-image"
                                    />
                                    <button
                                        type="button"
                                        className="remove-image-btn"
                                        onClick={() => setNewProduct(prev => ({
                                            ...prev,
                                            images: prev.images.filter((_, i) => i !== index)
                                        }))}
                                    >
                                        <X className="remove-icon" />
                                    </button>
                                </div>
                            ))}
                            <Label
                                htmlFor="image-upload"
                                className="image-upload-label"
                            >
                                <div className="upload-content">
                                    <ImageIcon className="upload-icon" />
                                    <p className="upload-text">Add Images</p>
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
                        <div className="image-note">
                            JPEG, PNG, or WEBP (Max 2MB each)
                        </div>
                    </div>

                    <div className="form-field">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            rows={4}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <div className="field-header">
                            <Label>Features</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addFeatureField}
                            >
                                <Plus className="btn-icon" />
                                Add Feature
                            </Button>
                        </div>
                        <div className="feature-list">
                            {newProduct.features.map((feature, index) => (
                                <div key={index} className="feature-item">
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
                                            <X className="remove-icon" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-field">
                        <div className="field-header">
                            <Label>Specifications</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addSpecificationField}
                            >
                                <Plus className="btn-icon" />
                                Add Specification
                            </Button>
                        </div>
                        <div className="spec-list">
                            {Object.entries(newProduct.specifications).map(([key, value], index) => (
                                <div key={index} className="spec-item">
                                    <Input
                                        className="spec-key"
                                        value={key}
                                        onChange={(e) => updateSpecification(key, e.target.value, value)}
                                        placeholder="Spec name"
                                    />
                                    <span className="spec-colon">:</span>
                                    <Input
                                        className="spec-value"
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
                                            <X className="remove-icon" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-actions">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsOpen(false);
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
    );
};

export default AddProductDialog;