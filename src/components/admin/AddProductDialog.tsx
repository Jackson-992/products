import React, { useState, useRef } from 'react';
import { Plus, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { Product } from '@/types/Product';
import { createProduct, uploadProductImage, updateProductImages } from '@/services/adminProductService';
import './AddProductDialog.css';

interface AddProductDialogProps {
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

interface ImageFile {
    file: File;
    previewUrl: string;
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({ setProducts }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [newProduct, setNewProduct] = useState({
        name: '',
        price: 0,
        originalPrice: undefined as number | undefined,
        stockCount: 0,
        category: '',
        description: '',
        features: [''],
        specifications: ['']
    });

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const files = Array.from(e.target.files);
            const newImageFiles = files.map(file => ({
                file,
                previewUrl: URL.createObjectURL(file)
            }));

            setImageFiles(prev => [...prev, ...newImageFiles]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (index: number) => {
        URL.revokeObjectURL(imageFiles[index].previewUrl);
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadImages = async (): Promise<string[]> => {
        if (imageFiles.length === 0) return [];

        const uploadPromises = imageFiles.map(imageFile =>
            uploadProductImage(imageFile.file)
        );

        return await Promise.all(uploadPromises);
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // First, upload all images
            let uploadedImageUrls: string[] = [];
            if (imageFiles.length > 0) {
                uploadedImageUrls = await uploadImages();
            }

            // Then create the product with the image URLs
            const product = await createProduct({
                name: newProduct.name,
                price: newProduct.price,
                originalPrice: newProduct.originalPrice,
                stockCount: newProduct.stockCount,
                category: newProduct.category,
                description: newProduct.description,
                images: uploadedImageUrls, // Pass the uploaded image URLs
                features: newProduct.features.filter(f => f.trim() !== ''),
                specifications: newProduct.specifications.filter(s => s.trim() !== ''),
                inStock: newProduct.stockCount > 0
            });

            setProducts(prev => [...prev, product]);
            setIsOpen(false);
            resetNewProduct();
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetNewProduct = () => {
        imageFiles.forEach(imageFile => {
            URL.revokeObjectURL(imageFile.previewUrl);
        });
        setImageFiles([]);
        setNewProduct({
            name: '',
            price: 0,
            originalPrice: undefined,
            stockCount: 0,
            category: '',
            description: '',
            features: [''],
            specifications: ['']
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
            specifications: [...prev.specifications, '']
        }));
    };

    const removeSpecificationField = (index: number) => {
        setNewProduct(prev => {
            const newSpecs = [...prev.specifications];
            newSpecs.splice(index, 1);
            return {
                ...prev,
                specifications: newSpecs.length > 0 ? newSpecs : ['']
            };
        });
    };

    const updateSpecification = (index: number, value: string) => {
        setNewProduct(prev => {
            const newSpecs = [...prev.specifications];
            newSpecs[index] = value;
            return {
                ...prev,
                specifications: newSpecs
            };
        });
    };

    const handleDialogClose = () => {
        resetNewProduct();
        setIsOpen(false);
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
                            <Label htmlFor="name">Product Name *</Label>
                            <Input
                                id="name"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-field">
                            <Label htmlFor="price">Price (Ksh) *</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={newProduct.price || ''}
                                onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                                required
                                disabled={isLoading}
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
                                min="0"
                                value={newProduct.originalPrice || ''}
                                onChange={(e) => setNewProduct({
                                    ...newProduct,
                                    originalPrice: e.target.value ? parseFloat(e.target.value) : undefined
                                })}
                                placeholder="Optional"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-field">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={newProduct.category}
                                onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                                disabled={isLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="electronics">electronics</SelectItem>
                                    <SelectItem value="furniture">furniture</SelectItem>
                                    <SelectItem value="beauty">beauty</SelectItem>
                                    <SelectItem value="clothing">clothing</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-field">
                            <Label htmlFor="stock">Stock Quantity *</Label>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                value={newProduct.stockCount}
                                onChange={(e) => setNewProduct({ ...newProduct, stockCount: parseInt(e.target.value) || 0 })}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="form-field">
                        <Label>Product Images</Label>
                        <div className="image-grid">
                            {imageFiles.map((imageFile, index) => (
                                <div key={index} className="image-preview">
                                    <img
                                        src={imageFile.previewUrl}
                                        alt={`Preview ${index}`}
                                        className="preview-image"
                                    />
                                    <button
                                        type="button"
                                        className="remove-image-btn"
                                        onClick={() => removeImage(index)}
                                        disabled={isLoading}
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
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageSelect}
                                multiple
                                disabled={isLoading}
                            />
                        </div>
                        <div className="image-note">
                            JPEG, PNG, or WEBP (Max 5MB each)
                        </div>
                    </div>

                    <div className="form-field">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            rows={4}
                            required
                            disabled={isLoading}
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
                                disabled={isLoading}
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
                                        disabled={isLoading}
                                    />
                                    {newProduct.features.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFeatureField(index)}
                                            disabled={isLoading}
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
                                disabled={isLoading}
                            >
                                <Plus className="btn-icon" />
                                Add Specification
                            </Button>
                        </div>
                        <div className="spec-list">
                            {newProduct.specifications.map((spec, index) => (
                                <div key={index} className="spec-item">
                                    <Input
                                        value={spec}
                                        onChange={(e) => updateSpecification(index, e.target.value)}
                                        placeholder="Enter specification (e.g., 65 inch, Super Oled Display)"
                                        disabled={isLoading}
                                        className="spec-input"
                                    />
                                    {newProduct.specifications.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeSpecificationField(index)}
                                            disabled={isLoading}
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
                            onClick={handleDialogClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Adding Product...' : 'Add Product'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddProductDialog;