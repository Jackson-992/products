import { supabase } from '../supabase.ts';

export interface ProductDetails {
    id: number;
    name: string;
    price: number;
    originalprice: number;
    product_images: string[];
    category: string;
    is_active: boolean;
    created_at: string;
}

export interface ProductVariation {
    id: number;
    product_id: number;
    color: string;
    size: string;
    quantity: number;
    price_adjustment: number;
    sku?: string;
    created_at: string;
}

export const getProductDetails = async (productId: number): Promise<ProductDetails> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) {
            console.error('Error fetching product details:', error);
            throw new Error(`Failed to fetch product details: ${error.message}`);
        }

        if (!data) {
            throw new Error('Product not found');
        }

        // Transform the data to match our interface
        return {
            id: data.id,
            name: data.name,
            price: data.price,
            originalprice: data.originalprice || data.price, // Fallback to price if originalprice is null
            product_images: data.product_images || [],
            category: data.category,
            is_active: data.is_active,
            created_at: data.created_at
        };
    } catch (error) {
        console.error('Error in getProductDetails:', error);
        throw error;
    }
};

// You might also want a batch version for multiple products
export const getMultipleProductDetails = async (productIds: number[]): Promise<ProductDetails[]> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds)
            .eq('is_active', true);

        if (error) {
            console.error('Error fetching multiple product details:', error);
            throw new Error(`Failed to fetch product details: ${error.message}`);
        }

        return (data || []).map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            originalprice: product.originalprice || product.price,
            product_images: product.product_images || [],
            category: product.category,
            is_active: product.is_active,
            created_at: product.created_at
        }));
    } catch (error) {
        console.error('Error in getMultipleProductDetails:', error);
        throw error;
    }
};
export const getProductVariations = async (productId: number): Promise<ProductVariation[]> => {
    try {
        const { data, error } = await supabase
            .from('product_variations')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching product variations:', error);
            throw new Error(`Failed to fetch product variations: ${error.message}`);
        }

        return (data || []).map(variation => ({
            id: variation.id,
            product_id: variation.product_id,
            color: variation.color,
            size: variation.size,
            quantity: variation.quantity,
            price_adjustment: variation.price_adjustment || 0, // Ensure it's always a number
            sku: variation.sku,
            created_at: variation.created_at
        }));
    } catch (error) {
        console.error('Error in getProductVariations:', error);
        throw error;
    }
};

export const getProductDetailsWithVariations = async (productId: number) => {
    try {
        const [productDetails, variations] = await Promise.all([
            getProductDetails(productId),
            getProductVariations(productId)
        ]);

        return {
            product: productDetails,
            variations: variations
        };
    } catch (error) {
        console.error('Error fetching product with variations:', error);
        throw error;
    }
};