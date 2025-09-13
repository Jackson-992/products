// src/services/ProductManagementService.ts
import { supabase } from "./supabase";
import { Product } from "../types/Product";
import {data} from "autoprefixer";

// CREATE: Add new product
export const createProduct = async (productData: {
    name: string;
    price: number;
    originalPrice?: number;
    stockCount: number;
    category: string;
    inStock?: boolean;
    images?: string[];
    description?: string;
    features?: string[];
    specifications?: string[];
}): Promise<Product> => {
    const { data, error } = await supabase
        .from("products")
        .insert([{
            name: productData.name,
            price: productData.price,
            originalprice: productData.originalPrice || null,
            stock_number: productData.stockCount,
            category: productData.category,
            is_active: productData.inStock ?? (productData.stockCount > 0),
            product_images: productData.images || []
        }])
        .select(`
      id, name, price, stock_number, is_active, originalprice,
      category, product_images
    `)
        .single();

    if (error) throw error;

    // Add product details if provided
    if (productData.description || productData.features || productData.specifications) {
        await upsertProductDetails(data.id, {
            description: productData.description,
            features: productData.features,
            specifications: productData.specifications
        });
    }

    return {
        features: [], specifications: [],
        id: data.id,
        name: data.name,
        price: data.price,
        originalPrice: data.originalprice || undefined,
        inStock: data.stock_number > 0 && data.is_active,
        stockCount: data.stock_number,
        category: data.category,
        images: data.product_images || [],
        description: productData.description,
        rating: 0,
        reviews: 0
    };
};

// Helper function for product details
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

// Image upload function
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

// Function to update product with images
export const updateProductImages = async (productId: number, imageUrls: string[]): Promise<void> => {
    const { error } = await supabase
        .from("products")
        .update({
            product_images: imageUrls
        })
        .eq("id", productId);

    if (error) throw error;
};

// Function to add images to existing product
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

// DELETE: Delete product and associated data
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

        // Delete product details (from details table)
        const { error: detailsError } = await supabase
            .from("details")
            .delete()
            .eq("product_id", productId);

        if (detailsError) {
            console.warn('Could not delete product details:', detailsError);
            // Continue with product deletion even if details deletion fails
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

// Delete product images from storage
export const deleteProductImages = async (imageUrls: string[]): Promise<void> => {
    if (!imageUrls || imageUrls.length === 0) return;

    try {
        // Extract filenames from URLs
        const fileNames = imageUrls.map(url => {
            const urlParts = url.split('/');
            return urlParts[urlParts.length - 1]; // Get the last part (filename)
        }).filter(Boolean);

        if (fileNames.length === 0) return;

        // Delete files from storage
        const { error } = await supabase.storage
            .from("product-images")
            .remove(fileNames);

        if (error) {
            console.warn('Could not delete some images from storage:', error);
            // Don't throw error here - we want to continue with product deletion
        }

    } catch (error) {
        console.warn('Error deleting images from storage:', error);
        // Don't throw error - product deletion should continue
    }
};

// DELETE: Delete single image from product and storage
export const deleteProductImage = async (productId: number, imageUrl: string): Promise<void> => {
    try {
        // First get the current product
        const { data: product, error: fetchError } = await supabase
            .from("products")
            .select("product_images")
            .eq("id", productId)
            .single();

        if (fetchError) throw fetchError;

        // Remove the image from the array
        const updatedImages = (product.product_images || []).filter(img => img !== imageUrl);

        // Update the product
        const { error: updateError } = await supabase
            .from("products")
            .update({ product_images: updatedImages })
            .eq("id", productId);

        if (updateError) throw updateError;

        // Delete the image from storage
        const fileName = imageUrl.split('/').pop();
        if (fileName) {
            const { error: storageError } = await supabase.storage
                .from("product-images")
                .remove([fileName]);

            if (storageError) {
                console.warn('Could not delete image from storage:', storageError);
            }
        }

    } catch (error) {
        console.error('Error deleting product image:', error);
        throw error;
    }
};

// UPDATE: Update product
export const updateProduct = async (
    productId: number,
    updates: {
        name?: string;
        price?: number;
        originalPrice?: number;
        stockCount?: number;
        category?: string;
        inStock?: boolean;
        description?: string;
        features?: string[];
        specifications?: string[];
    }
): Promise<void> => {
    const { error } = await supabase
        .from("products")
        .update({
            name: updates.name,
            price: updates.price,
            originalprice: updates.originalPrice,
            stock_number: updates.stockCount,
            category: updates.category,
            is_active: updates.inStock
        })
        .eq("id", productId);

    if (error) throw error;

    // Update product details if provided
    if (updates.description || updates.features || updates.specifications) {
        await upsertProductDetails(productId, {
            description: updates.description,
            features: updates.features,
            specifications: updates.specifications
        });
    }
};