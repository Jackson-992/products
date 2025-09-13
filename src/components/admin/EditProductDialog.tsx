import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Plus, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { Product } from '@/types/Product.ts';
import { updateProduct, uploadProductImage, deleteProductImage, updateProductImages } from '@/services/adminProductService';
import './EditProductDialog.css';

interface EditProductDialogProps {
    editingProduct: Product | null;
    setEditingProduct: (product: Product | null) => void;
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    refreshProducts: () => void;
}

const EditProductDialog: React.FC<EditProductDialogProps> = ({
                                                                 editingProduct,
                                                                 setEditingProduct,
                                                                 setProducts,
                                                                 refreshProducts
                                                             }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        originalPrice: 0,
        stockCount: 0,
        category: '',
        description: '',
        features: [''],
        specifications: [''],
        inStock: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);

    // Initialize form data when editingProduct changes
    useEffect(() => {
        if (editingProduct) {
            setFormData({
                name: editingProduct.name || '',
                price: editingProduct.price || 0,
                originalPrice: editingProduct.originalPrice || 0,
                stockCount: editingProduct.stockCount || 0,
                category: editingProduct.category || '',
                description: editingProduct.description || '',
                features: editingProduct.features && editingProduct.features.length > 0
                    ? editingProduct.features
                    : [''],
                specifications: editingProduct.specifications && editingProduct.specifications.length > 0
                    ? editingProduct.specifications
                    : [''],
                inStock: editingProduct.inStock !== undefined ? editingProduct.inStock : true
            });
        }
    }, [editingProduct]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editingProduct || !e.target.files || !e.target.files[0]) return;

        try {
            setUploadingImages(true);
            const files = Array.from(e.target.files);

            // Upload each image
            const uploadPromises = files.map(file => uploadProductImage(file));
            const uploadedUrls = await Promise.all(uploadPromises);

            // Update the product with new images using the correct function
            const updatedImages = [...editingProduct.images, ...uploadedUrls];
            await updateProductImages(editingProduct.id, updatedImages);

            // Refresh the product list
            refreshProducts();
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Failed to upload images. Please try again.');
        } finally {
            setUploadingImages(false);
        }
    };

    const handleRemoveImage = async (imageUrl: string) => {
        if (!editingProduct) return;

        try {
            // Remove image from product using the correct function
            const updatedImages = editingProduct.images.filter(img => img !== imageUrl);
            await updateProductImages(editingProduct.id, updatedImages);

            // Delete image from storage
            await deleteProductImage(editingProduct.id, imageUrl);

            // Refresh the product list
            refreshProducts();
        } catch (error) {
            console.error('Error removing image:', error);
            alert('Failed to remove image. Please try again.');
        }
    };

    const addFeatureField = () => {
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, '']
        }));
    };

    const removeFeatureField = (index: number) => {
        setFormData(prev => {
            const newFeatures = [...prev.features];
            newFeatures.splice(index, 1);
            return {
                ...prev,
                features: newFeatures.length > 0 ? newFeatures : ['']
            };
        });
    };

    const updateFeature = (index: number, value: string) => {
        setFormData(prev => {
            const newFeatures = [...prev.features];
            newFeatures[index] = value;
            return {
                ...prev,
                features: newFeatures
            };
        });
    };

    const addSpecificationField = () => {
        setFormData(prev => ({
            ...prev,
            specifications: [...prev.specifications, '']
        }));
    };

    const removeSpecificationField = (index: number) => {
        setFormData(prev => {
            const newSpecs = [...prev.specifications];
            newSpecs.splice(index, 1);
            return {
                ...prev,
                specifications: newSpecs.length > 0 ? newSpecs : ['']
            };
        });
    };

    const updateSpecification = (index: number, value: string) => {
        setFormData(prev => {
            const newSpecs = [...prev.specifications];
            newSpecs[index] = value;
            return {
                ...prev,
                specifications: newSpecs
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        try {
            setIsSubmitting(true);

            // Prepare the update data (only the properties that updateProduct accepts)
            const updateData = {
                name: formData.name,
                price: formData.price,
                originalPrice: formData.originalPrice,
                stockCount: formData.stockCount,
                category: formData.category,
                inStock: formData.inStock,
                description: formData.description,
                features: formData.features.filter(f => f.trim() !== ''),
                specifications: formData.specifications.filter(s => s.trim() !== '')
            };

            // Update the product
            await updateProduct(editingProduct.id, updateData);

            // Refresh the product list
            refreshProducts();

            // Close the dialog
            setEditingProduct(null);

            alert('Product updated successfully!');
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!editingProduct) return null;

    return (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
            <DialogContent className="dialog-content">
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-grid">
                        <div className="form-field">
                            <Label htmlFor="edit-name">Product Name *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="form-field">
                            <Label htmlFor="edit-price">Price (Ksh) *</Label>
                            <Input
                                id="edit-price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price || ''}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                required
                                disabled={isSubmitting}
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
                                min="0"
                                value={formData.originalPrice || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    originalPrice: e.target.value ? parseFloat(e.target.value) : 0
                                })}
                                placeholder="Optional"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="form-field">
                            <Label htmlFor="edit-category">Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="electronics">Electronics</SelectItem>
                                    <SelectItem value="furniture">Furniture</SelectItem>
                                    <SelectItem value="beauty">Beauty</SelectItem>
                                    <SelectItem value="clothing">Clothing</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-field">
                            <Label htmlFor="edit-stock">Stock Quantity *</Label>
                            <Input
                                id="edit-stock"
                                type="number"
                                min="0"
                                value={formData.stockCount}
                                onChange={(e) => setFormData({ ...formData, stockCount: parseInt(e.target.value) || 0 })}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="form-field">
                            <Label htmlFor="edit-inStock" className="flex items-center gap-2">
                                <span>In Stock</span>
                                <Switch
                                    id="edit-inStock"
                                    checked={formData.inStock}
                                    onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
                                    disabled={isSubmitting}
                                />
                            </Label>
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
                                        onClick={() => handleRemoveImage(image)}
                                        disabled={isSubmitting}
                                    >
                                        <Trash2 className="remove-icon" />
                                    </button>
                                </div>
                            ))}
                            <Label
                                htmlFor="edit-image-upload"
                                className="image-upload-label"
                            >
                                <div className="upload-content">
                                    {uploadingImages ? (
                                        <div className="uploading-spinner">Uploading...</div>
                                    ) : (
                                        <>
                                            <Upload className="upload-icon" />
                                            <p className="upload-text">Add Images</p>
                                        </>
                                    )}
                                </div>
                            </Label>
                            <Input
                                id="edit-image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                                multiple
                                disabled={isSubmitting || uploadingImages}
                            />
                        </div>
                        <div className="image-note">
                            JPEG, PNG, or WEBP (Max 5MB each)
                        </div>
                    </div>

                    <div className="form-field">
                        <Label htmlFor="edit-description">Description *</Label>
                        <Textarea
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            required
                            disabled={isSubmitting}
                            placeholder="Describe your product in detail..."
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
                                disabled={isSubmitting}
                            >
                                <Plus className="btn-icon" />
                                Add Feature
                            </Button>
                        </div>
                        <div className="feature-list">
                            {formData.features.map((feature, index) => (
                                <div key={index} className="feature-item">
                                    <Input
                                        value={feature}
                                        onChange={(e) => updateFeature(index, e.target.value)}
                                        placeholder="Enter product feature"
                                        disabled={isSubmitting}
                                    />
                                    {formData.features.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFeatureField(index)}
                                            disabled={isSubmitting}
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
                                disabled={isSubmitting}
                            >
                                <Plus className="btn-icon" />
                                Add Specification
                            </Button>
                        </div>
                        <div className="spec-list">
                            {formData.specifications.map((spec, index) => (
                                <div key={index} className="spec-item">
                                    <Input
                                        value={spec}
                                        onChange={(e) => updateSpecification(index, e.target.value)}
                                        placeholder="Enter specification (e.g., 65 inch, Super Oled Display)"
                                        disabled={isSubmitting}
                                        className="spec-input"
                                    />
                                    {formData.specifications.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeSpecificationField(index)}
                                            disabled={isSubmitting}
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
                            onClick={() => setEditingProduct(null)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditProductDialog;