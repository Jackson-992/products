import React from 'react';
import { X, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { Product } from '@/hooks/product-data.ts';
import './EditProductDialog.css';

interface EditProductDialogProps {
    editingProduct: Product | null;
    setEditingProduct: (product: Product | null) => void;
    setProducts: (products: Product[]) => void;
}

const EditProductDialog: React.FC<EditProductDialogProps> = ({
                                                                 editingProduct,
                                                                 setEditingProduct,
                                                                 setProducts
                                                             }) => {
    if (!editingProduct) return null;

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
                    setEditingProduct({
                        ...editingProduct,
                        images: [...editingProduct.images, ...images]
                    });
                } else {
                    setEditingProduct({
                        ...editingProduct,
                        images: [...images]
                    });
                }
            });
        }
    };

    const handleEditProduct = (e: React.FormEvent) => {
        e.preventDefault();

        const updatedProduct: Product = {
            ...editingProduct,
            features: editingProduct.features.filter(f => f.trim() !== ''),
            specifications: Object.fromEntries(
                Object.entries(editingProduct.specifications)
                    .filter(([key, value]) => key.trim() !== '' && value.trim() !== '')
            ),
        };

        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        setEditingProduct(null);
    };

    return (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
            <DialogContent className="dialog-content">
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditProduct} className="form">
                    <div className="form-grid">
                        <div className="form-field">
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
                        <div className="form-field">
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

                    <div className="form-grid">
                        <div className="form-field">
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
                        <div className="form-field">
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

                    <div className="form-grid">
                        <div className="form-field">
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

                    <div className="form-field">
                        <Label>Product Images</Label>
                        <div className="image-grid">
                            {editingProduct.images.map((image, index) => (
                                <div key={index} className="image-preview">
                                    <img
                                        src={image}
                                        alt={`Preview ${index}`}
                                        className="preview-image"
                                    />
                                    <button
                                        type="button"
                                        className="remove-image-btn"
                                        onClick={() => setEditingProduct(prev => ({
                                            ...prev!,
                                            images: prev!.images.filter((_, i) => i !== index)
                                        }))}
                                    >
                                        <X className="remove-icon" />
                                    </button>
                                </div>
                            ))}
                            <Label
                                htmlFor="edit-image-upload"
                                className="image-upload-label"
                            >
                                <div className="upload-content">
                                    <ImageIcon className="upload-icon" />
                                    <p className="upload-text">Add Images</p>
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
                        <div className="image-note">
                            JPEG, PNG, or WEBP (Max 2MB each)
                        </div>
                    </div>

                    <div className="form-field">
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

                    <div className="form-field">
                        <div className="field-header">
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
                                <Plus className="btn-icon" />
                                Add Feature
                            </Button>
                        </div>
                        <div className="feature-list">
                            {editingProduct.features.map((feature, index) => (
                                <div key={index} className="feature-item">
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
                                onClick={() => setEditingProduct(prev => ({
                                    ...prev!,
                                    specifications: { ...prev!.specifications, '': '' }
                                }))}
                            >
                                <Plus className="btn-icon" />
                                Add Specification
                            </Button>
                        </div>
                        <div className="spec-list">
                            {Object.entries(editingProduct.specifications).map(([key, value], index) => (
                                <div key={index} className="spec-item">
                                    <Input
                                        className="spec-key"
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
                                    <span className="spec-colon">:</span>
                                    <Input
                                        className="spec-value"
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
                                        <X className="remove-icon" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-actions">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingProduct(null)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditProductDialog;