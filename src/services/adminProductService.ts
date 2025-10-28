import { supabase } from "./supabase";
import { Product } from "../types/Product";

// Variation interface
export interface ProductVariation {
    id?: number;
    color: string;
    size: string;
    quantity: number;
    price_adjustment?: number;
    sku?: string;
}

// Extended product data interface for creation/updates
interface ProductCreateData {
    name: string;
    price: number;
    originalPrice?: number;
    category: string;
    inStock?: boolean;
    images?: string[];
    description?: string;
    features?: string[];
    specifications?: string[];
    variations: ProductVariation[]; // Now required for product creation
}

interface ProductUpdateData {
    name?: string;
    price?: number;
    originalPrice?: number;
    category?: string;
    inStock?: boolean;
    description?: string;
    features?: string[];
    specifications?: string[];
    images?: string[];
    variations?: ProductVariation[]; // Optional for updates
}

// CREATE: Add new product with variations
export const createProduct = async (productData: ProductCreateData): Promise<Product> => {
    try {
        // Start a transaction by using multiple operations
        const { data: product, error: productError } = await supabase
            .from("products")
            .insert([{
                name: productData.name,
                price: productData.price,
                originalprice: productData.originalPrice || null,
                category: productData.category,
                is_active: productData.inStock ?? true,
                product_images: productData.images || []
            }])
            .select(`
                id, name, price, is_active, originalprice,
                category, product_images
            `)
            .single();

        if (productError) throw productError;

        // Add product details if provided
        if (productData.description || productData.features || productData.specifications) {
            await upsertProductDetails(product.id, {
                description: productData.description,
                features: productData.features,
                specifications: productData.specifications
            });
        }

        // Add product variations
        if (productData.variations && productData.variations.length > 0) {
            await addProductVariations(product.id, productData.variations);
        }

        // Calculate total stock from variations
        const totalStock = productData.variations.reduce((sum, variation) =>
            sum + (variation.quantity || 0), 0);

        return {
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalprice || undefined,
            inStock: totalStock > 0 && product.is_active,
            stockCount: totalStock,
            category: product.category,
            images: product.product_images || [],
            description: productData.description,
            features: productData.features || [],
            specifications: productData.specifications || [],
            rating: 0,
            reviews: 0
        };

    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

// UPDATE: Update product with variations
export const updateProduct = async (
    productId: number,
    updates: ProductUpdateData
): Promise<void> => {
    try {
        // Update basic product info
        const { error: productError } = await supabase
            .from("products")
            .update({
                name: updates.name,
                price: updates.price,
                originalprice: updates.originalPrice,
                category: updates.category,
                is_active: updates.inStock,
                product_images: updates.images
            })
            .eq("id", productId);

        if (productError) throw productError;

        // Update product details if provided
        if (updates.description || updates.features || updates.specifications) {
            await upsertProductDetails(productId, {
                description: updates.description,
                features: updates.features,
                specifications: updates.specifications
            });
        }

        // Update variations if provided
        if (updates.variations) {
            await updateProductVariations(productId, updates.variations);
        }

    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

// Helper function to add product variations
const addProductVariations = async (productId: number, variations: ProductVariation[]): Promise<void> => {
    const variationsToInsert = variations.map(variation => ({
        product_id: productId,
        color: variation.color,
        size: variation.size,
        quantity: variation.quantity,
        price_adjustment: variation.price_adjustment || 0,
        sku: variation.sku || null
    }));

    const { error } = await supabase
        .from("product_variations")
        .insert(variationsToInsert);

    if (error) throw error;
};

// Helper function to update product variations
const updateProductVariations = async (productId: number, variations: ProductVariation[]): Promise<void> => {
    // First, get existing variations to know which ones to update vs delete
    const { data: existingVariations, error: fetchError } = await supabase
        .from("product_variations")
        .select("id, color, size")
        .eq("product_id", productId);

    if (fetchError) throw fetchError;

    const existingVariationsMap = new Map(
        existingVariations?.map(v => [`${v.color}-${v.size}`, v.id]) || []
    );

    const variationsToInsert: any[] = [];
    const variationsToUpdate: any[] = [];
    const variationIdsToKeep: number[] = [];

    // Separate variations into insert and update arrays
    variations.forEach(variation => {
        const key = `${variation.color}-${variation.size}`;
        const existingId = existingVariationsMap.get(key);

        const variationData = {
            product_id: productId,
            color: variation.color,
            size: variation.size,
            quantity: variation.quantity,
            price_adjustment: variation.price_adjustment || 0,
            sku: variation.sku || null
        };

        if (existingId && variation.id) {
            // Update existing variation
            variationsToUpdate.push({ ...variationData, id: variation.id });
            variationIdsToKeep.push(variation.id);
        } else if (existingId) {
            // Update existing variation (no id in the input, but exists in DB)
            variationsToUpdate.push({ ...variationData, id: existingId });
            variationIdsToKeep.push(existingId);
        } else {
            // Insert new variation
            variationsToInsert.push(variationData);
        }
    });

    // Delete variations that are no longer in the list
    const variationIdsToDelete = existingVariations
        ?.filter(v => !variationIdsToKeep.includes(v.id))
        .map(v => v.id) || [];

    if (variationIdsToDelete.length > 0) {
        const { error: deleteError } = await supabase
            .from("product_variations")
            .delete()
            .in('id', variationIdsToDelete);

        if (deleteError) throw deleteError;
    }

    // Insert new variations
    if (variationsToInsert.length > 0) {
        const { error: insertError } = await supabase
            .from("product_variations")
            .insert(variationsToInsert);

        if (insertError) throw insertError;
    }

    // Update existing variations
    for (const variation of variationsToUpdate) {
        const { id, ...updateData } = variation;
        const { error: updateError } = await supabase
            .from("product_variations")
            .update(updateData)
            .eq('id', id);

        if (updateError) throw updateError;
    }
};

// GET: Get product variations
export const getProductVariations = async (productId: number): Promise<ProductVariation[]> => {
    const { data, error } = await supabase
        .from("product_variations")
        .select("id, color, size, quantity, price_adjustment, sku")
        .eq("product_id", productId)
        .order("color")
        .order("size");

    if (error) throw error;
    return data || [];
};

// DELETE: Delete a specific variation
export const deleteProductVariation = async (variationId: number): Promise<void> => {
    const { error } = await supabase
        .from("product_variations")
        .delete()
        .eq("id", variationId);

    if (error) throw error;
};

// Helper function for product details (unchanged)
const upsertProductDetails = async (
    productId: number,
    details: {
        description?: string;
        features?: string[];
        specifications?: string[];
    }
): Promise<void> => {
    const { error } = await supabase
        .from("details")
        .upsert({
            product_id: productId,
            description: details.description,
            features: details.features || [],
            specifications: details.specifications || []
        }, {
            onConflict: 'product_id'
        });

    if (error) throw error;
};

// Image upload function (unchanged)
export const uploadProductImage = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

    return publicUrl;
};

// Function to update product with images (unchanged)
export const updateProductImages = async (productId: number, imageUrls: string[]): Promise<void> => {
    const { error } = await supabase
        .from("products")
        .update({
            product_images: imageUrls
        })
        .eq("id", productId);

    if (error) throw error;
};

// Function to add images to existing product (unchanged)
export const addImagesToProduct = async (productId: number, files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
        try {
            const url = await uploadProductImage(file);
            uploadedUrls.push(url);
        } catch (error) {
            console.error(`Failed to upload image ${file.name}:`, error);
        }
    }

    if (uploadedUrls.length > 0) {
        await updateProductImages(productId, uploadedUrls);
    }

    return uploadedUrls;
};

// DELETE: Delete product and associated data (updated to handle variations)
export const deleteProduct = async (productId: number): Promise<void> => {
    try {
        // First, get the product to access its images
        const { data: product, error: fetchError } = await supabase
            .from("products")
            .select("product_images")
            .eq("id", productId)
            .single();

        if (fetchError) throw fetchError;

        // Delete associated images from storage if they exist
        if (product?.product_images && product.product_images.length > 0) {
            await deleteProductImages(product.product_images);
        }

        // Delete product variations first (due to foreign key constraints)
        const { error: variationsError } = await supabase
            .from("product_variations")
            .delete()
            .eq("product_id", productId);

        if (variationsError) {
            console.warn('Could not delete product variations:', variationsError);
        }

        // Delete product details
        const { error: detailsError } = await supabase
            .from("details")
            .delete()
            .eq("product_id", productId);

        if (detailsError) {
            console.warn('Could not delete product details:', detailsError);
        }

        // Finally, delete the product itself
        const { error: productError } = await supabase
            .from("products")
            .delete()
            .eq("id", productId);

        if (productError) throw productError;

    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};

// Delete product images from storage (unchanged)
export const deleteProductImages = async (imageUrls: string[]): Promise<void> => {
    if (!imageUrls || imageUrls.length === 0) return;

    try {
        const fileNames = imageUrls.map(url => {
            const urlParts = url.split('/');
            const encodedFileName = urlParts[urlParts.length - 1];
            return decodeURIComponent(encodedFileName.split('?')[0]);
        }).filter(Boolean);

        if (fileNames.length === 0) return;

        const { error } = await supabase.storage
            .from("product-images")
            .remove(fileNames);

        if (error) {
            console.warn('Could not delete some images from storage:', error);
        }

    } catch (error) {
        console.warn('Error deleting images from storage:', error);
    }
};

// DELETE: Delete single image from product and storage (unchanged)
export const deleteProductImage = async (productId: number, imageUrl: string): Promise<void> => {
    try {
        let fileName = '';

        if (imageUrl.includes('supabase.co/storage/v1/object/public/product-images/')) {
            const parts = imageUrl.split('product-images/');
            fileName = parts[1] || '';
        } else {
            fileName = imageUrl.split('/').pop() || '';
        }

        fileName = fileName.split('?')[0];
        fileName = decodeURIComponent(fileName);

        if (fileName) {
            const { error: storageError } = await supabase.storage
                .from("product-images")
                .remove([fileName]);

            if (storageError) {
                console.error('Storage deletion error:', storageError);
            }
        }

        const { data: product, error: fetchError } = await supabase
            .from("products")
            .select("product_images")
            .eq("id", productId)
            .single();

        if (fetchError) throw fetchError;

        const updatedImages = (product.product_images || []).filter(img => img !== imageUrl);

        const { error: updateError } = await supabase
            .from("products")
            .update({ product_images: updatedImages })
            .eq("id", productId);

        if (updateError) throw updateError;

    } catch (error) {
        console.error('Error deleting product image:', error);
        throw error;
    }
};

// FETCH: Get complete product details including description, features, specifications (unchanged)
export const getProductDetails = async (productId: number): Promise<{
    description?: string;
    features?: string[];
    specifications?: string[];
}> => {
    const { data, error } = await supabase
        .from("details")
        .select("description, features, specifications")
        .eq("product_id", productId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return {
                description: '',
                features: [''],
                specifications: ['']
            };
        }
        throw error;
    }

    return {
        description: data.description || '',
        features: data.features && data.features.length > 0 ? data.features : [''],
        specifications: data.specifications && data.specifications.length > 0 ? data.specifications : ['']
    };
};