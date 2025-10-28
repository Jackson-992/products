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
import { updateProduct, uploadProductImage, deleteProductImage, getProductDetails, getProductVariations, ProductVariation } from '@/services/adminProductService.ts';
import './EditProductDialog.css';

interface EditProductDialogProps {
    editingProduct: Product | null;
    setEditingProduct: (product: Product | null) => void;
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    refreshProducts: () => void;
}

interface ImageWithSource {
    url: string;
    isNew: boolean;
    file?: File; // Only for new images
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
        category: '',
        description: '',
        features: [''],
        specifications: [''],
        inStock: true
    });
    const [variations, setVariations] = useState<ProductVariation[]>([
        { color: '', size: '', quantity: 0, price_adjustment: 0 }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [currentImages, setCurrentImages] = useState<ImageWithSource[]>([]);

    // Initialize form data when editingProduct changes
    useEffect(() => {
        const loadProductData = async () => {
            if (editingProduct) {
                setLoadingDetails(true);

                try {
                    // First set the basic product data
                    setFormData({
                        name: editingProduct.name || '',
                        price: editingProduct.price || 0,
                        originalPrice: editingProduct.originalPrice || 0,
                        category: editingProduct.category || '',
                        description: '', // Will be loaded from database
                        features: [''], // Will be loaded from database
                        specifications: [''], // Will be loaded from database
                        inStock: editingProduct.inStock !== undefined ? editingProduct.inStock : true
                    });

                    // Initialize current images
                    setCurrentImages(
                        (editingProduct.images || []).map(url => ({
                            url,
                            isNew: false
                        }))
                    );

                    // Fetch product details from database
                    const productDetails = await getProductDetails(editingProduct.id);

                    // Fetch product variations
                    const productVariations = await getProductVariations(editingProduct.id);

                    // Update form data with the fetched details
                    setFormData(prevData => ({
                        ...prevData,
                        description: productDetails.description || '',
                        features: productDetails.features || [''],
                        specifications: productDetails.specifications || ['']
                    }));

                    // Set variations (if none exist, keep the default one)
                    if (productVariations.length > 0) {
                        setVariations(productVariations);
                    }

                } catch (error) {
                    console.error('Error loading product details:', error);
                    // If there's an error, use empty defaults
                    setFormData(prevData => ({
                        ...prevData,
                        description: '',
                        features: [''],
                        specifications: ['']
                    }));
                } finally {
                    setLoadingDetails(false);
                }
            }
        };

        loadProductData();
    }, [editingProduct]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;

        const files = Array.from(e.target.files);

        // Create preview URLs for immediate display
        const newImages = files.map(file => ({
            url: URL.createObjectURL(file),
            isNew: true,
            file
        }));

        setCurrentImages(prev => [...prev, ...newImages]);

        // Clear the input
        e.target.value = '';
    };

    const handleRemoveImage = (image: ImageWithSource) => {
        if (image.isNew) {
            // Revoke the blob URL to avoid memory leaks
            URL.revokeObjectURL(image.url);
        }

        setCurrentImages(prev => prev.filter(img => img.url !== image.url));
    };

    // Variation management functions
    const addVariation = () => {
        setVariations(prev => [
            ...prev,
            { color: '', size: '', quantity: 0, price_adjustment: 0 }
        ]);
    };

    const removeVariation = (index: number) => {
        if (variations.length > 1) {
            setVariations(prev => prev.filter((_, i) => i !== index));
        }
    };

    const updateVariation = (index: number, field: keyof ProductVariation, value: string | number) => {
        setVariations(prev => {
            const newVariations = [...prev];
            newVariations[index] = {
                ...newVariations[index],
                [field]: value
            };
            return newVariations;
        });
    };

    const calculateTotalStock = () => {
        return variations.reduce((total, variation) => total + (variation.quantity || 0), 0);
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
            setUploadingImages(true);

            // Validate variations
            const validVariations = variations.filter(v =>
                v.color.trim() !== '' &&
                v.size.trim() !== '' &&
                v.quantity >= 0
            );

            if (validVariations.length === 0) {
                alert('Please add at least one valid variation with color, size, and quantity.');
                setIsSubmitting(false);
                setUploadingImages(false);
                return;
            }

            // First, upload new images
            const uploadedUrls = [];
            const newImages = currentImages.filter(img => img.isNew);

            for (const image of newImages) {
                try {
                    if (image.file) {
                        const url = await uploadProductImage(image.file);
                        uploadedUrls.push(url);

                        // Revoke the blob URL now that we've uploaded the file
                        URL.revokeObjectURL(image.url);
                    }
                } catch (error) {
                    console.error('Error uploading image:', error);
                    alert(`Failed to upload image. Please try again.`);
                }
            }

            // Identify images to delete (existing images that are no longer in currentImages)
            const originalImageUrls = editingProduct.images || [];
            const remainingImageUrls = currentImages
                .filter(img => !img.isNew)
                .map(img => img.url);

            const imagesToDelete = originalImageUrls.filter(url =>
                !remainingImageUrls.includes(url)
            );

            // Delete removed images
            for (const imageUrl of imagesToDelete) {
                try {
                    await deleteProductImage(editingProduct.id, imageUrl);
                } catch (error) {
                    console.error('Error deleting image:', error);
                    alert(`Failed to delete image. Please try again.`);
                }
            }

            // Prepare the final image list
            const finalImages = [
                ...remainingImageUrls,
                ...uploadedUrls
            ];

            // Prepare the update data with variations
            const updateData = {
                name: formData.name,
                price: formData.price,
                originalPrice: formData.originalPrice,
                category: formData.category,
                inStock: validVariations.some(v => v.quantity > 0),
                description: formData.description,
                features: formData.features.filter(f => f.trim() !== ''),
                specifications: formData.specifications.filter(s => s.trim() !== ''),
                images: finalImages,
                variations: validVariations
            };

            // Update the product with variations
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
            setUploadingImages(false);
        }
    };

    // Clean up blob URLs when component unmounts
    useEffect(() => {
        return () => {
            currentImages.forEach(image => {
                if (image.isNew) {
                    URL.revokeObjectURL(image.url);
                }
            });
        };
    }, [currentImages]);

    if (!editingProduct) return null;

    const totalStock = calculateTotalStock();

    return (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
            <DialogContent className="dialog-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>

                {loadingDetails && (
                    <div className="loading-message">Loading product details...</div>
                )}

                <form onSubmit={handleSubmit} className="form">
                    <div className="form-grid">
                        <div className="form-field">
                            <Label htmlFor="edit-name">Product Name *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                disabled={isSubmitting || loadingDetails}
                            />
                        </div>
                        <div className="form-field">
                            <Label htmlFor="edit-price">Base Price (Ksh) *</Label>
                            <Input
                                id="edit-price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price || ''}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                required
                                disabled={isSubmitting || loadingDetails}
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
                                disabled={isSubmitting || loadingDetails}
                            />
                        </div>
                        <div className="form-field">
                            <Label htmlFor="edit-category">Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                                disabled={isSubmitting || loadingDetails}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="electronics">Electronics</SelectItem>
                                    <SelectItem value="furniture">Furniture</SelectItem>
                                    <SelectItem value="beauty">Beauty</SelectItem>
                                    <SelectItem value="clothing">Clothing</SelectItem>
                                    <SelectItem value="home">Home</SelectItem>
                                    <SelectItem value="sports">Sports</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Variations Section */}
                    <div className="form-field">
                        <div className="field-header">
                            <Label>Product Variations *</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addVariation}
                                disabled={isSubmitting || loadingDetails}
                            >
                                <Plus className="btn-icon" />
                                Add Variation
                            </Button>
                        </div>
                        <div className="variations-list">
                            {variations.map((variation, index) => (
                                <div key={variation.id || index} className="variation-item">
                                    <div className="variation-grid">
                                        <div className="variation-field">
                                            <Label htmlFor={`edit-color-${index}`}>Color *</Label>
                                            <Input
                                                id={`edit-color-${index}`}
                                                value={variation.color}
                                                onChange={(e) => updateVariation(index, 'color', e.target.value)}
                                                placeholder="e.g., Red, Blue, Black"
                                                required
                                                disabled={isSubmitting || loadingDetails}
                                            />
                                        </div>
                                        <div className="variation-field">
                                            <Label htmlFor={`edit-size-${index}`}>Size *</Label>
                                            <Input
                                                id={`edit-size-${index}`}
                                                value={variation.size}
                                                onChange={(e) => updateVariation(index, 'size', e.target.value)}
                                                placeholder="e.g., S, M, L, XL"
                                                required
                                                disabled={isSubmitting || loadingDetails}
                                            />
                                        </div>
                                        <div className="variation-field">
                                            <Label htmlFor={`edit-quantity-${index}`}>Quantity *</Label>
                                            <Input
                                                id={`edit-quantity-${index}`}
                                                type="number"
                                                min="0"
                                                value={variation.quantity}
                                                onChange={(e) => updateVariation(index, 'quantity', parseInt(e.target.value) || 0)}
                                                required
                                                disabled={isSubmitting || loadingDetails}
                                            />
                                        </div>
                                        <div className="variation-field">
                                            <Label htmlFor={`edit-price-adjustment-${index}`}>Price Adjustment (Ksh)</Label>
                                            <Input
                                                id={`edit-price-adjustment-${index}`}
                                                type="number"
                                                step="0.01"
                                                value={variation.price_adjustment || 0}
                                                onChange={(e) => updateVariation(index, 'price_adjustment', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                                disabled={isSubmitting || loadingDetails}
                                            />
                                        </div>
                                        <div className="variation-actions">
                                            {variations.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeVariation(index)}
                                                    disabled={isSubmitting || loadingDetails}
                                                    className="remove-variation-btn"
                                                >
                                                    <X className="remove-icon" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {variation.price_adjustment !== 0 && (
                                        <div className="price-preview">
                                            Final Price: Ksh {(formData.price + (variation.price_adjustment || 0)).toFixed(2)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="stock-summary">
                            Total Stock: <strong>{totalStock}</strong> units across {variations.length} variation(s)
                        </div>
                        <div className="in-stock-status">
                            <Label htmlFor="edit-inStock" className="flex items-center gap-2">
                                <span>Product In Stock (automatically set based on variations)</span>
                                <Switch
                                    id="edit-inStock"
                                    checked={formData.inStock}
                                    disabled={true}
                                    className="opacity-50"
                                />
                            </Label>
                            <div className="status-note">
                                This is automatically determined by whether any variation has stock
                            </div>
                        </div>
                    </div>

                    <div className="form-field">
                        <Label>Product Images</Label>
                        <div className="image-grid">
                            {currentImages.map((image, index) => (
                                <div key={index} className="image-preview">
                                    <img
                                        src={image.url}
                                        alt={`Preview ${index}`}
                                        className="preview-Image"
                                    />
                                    <button
                                        type="button"
                                        className="remove-image-btn"
                                        onClick={() => handleRemoveImage(image)}
                                        disabled={isSubmitting || loadingDetails}
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
                                disabled={isSubmitting || uploadingImages || loadingDetails}
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
                            disabled={isSubmitting || loadingDetails}
                            placeholder={loadingDetails ? "Loading description..." : "Describe your product in detail..."}
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
                                disabled={isSubmitting || loadingDetails}
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
                                        placeholder={loadingDetails ? "Loading..." : "Enter product feature"}
                                        disabled={isSubmitting || loadingDetails}
                                    />
                                    {formData.features.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFeatureField(index)}
                                            disabled={isSubmitting || loadingDetails}
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
                                disabled={isSubmitting || loadingDetails}
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
                                        placeholder={loadingDetails ? "Loading..." : "Enter specification (e.g., 65 inch, Super Oled Display)"}
                                        disabled={isSubmitting || loadingDetails}
                                        className="spec-input"
                                    />
                                    {formData.specifications.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeSpecificationField(index)}
                                            disabled={isSubmitting || loadingDetails}
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
                            disabled={isSubmitting || loadingDetails}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || loadingDetails}>
                            {isSubmitting ? 'Saving...' : loadingDetails ? 'Loading...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditProductDialog;