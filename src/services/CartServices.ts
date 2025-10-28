// cartService.ts
import { supabase } from './supabase';
import {Product} from '@/types/Product.ts'

// Define types
interface VariationData {
    variation_id?: number | null;
    color?: string | null;
    size?: string | null;
    product_sku?: string | null;
    price?: number | null;
}

interface CartItem {
    cart_item_id: number;
    user_id: number;
    product_id: number;
    quantity: number;
    added_at: string;
    updated_at: string;
    variation_id?: number | null;
    color?: string | null;
    size?: string | null;
    product_sku?: string | null;
    price?: number | null;
}

interface CartItemWithProduct extends CartItem {
    products: Product;
}

// Add to cart
export const addToCart = async (
    userId: number,
    productId: number,
    quantity: number = 1,
    variationData: VariationData = {}
): Promise<{ success: boolean; cartItem?: CartItem; error?: string }> => {
    try {
        // Ensure the user has a cart
        const { error: cartError } = await supabase
            .from('carts')
            .upsert(
                {
                    user_id: userId,
                    updated_at: new Date()
                },
                {
                    onConflict: 'user_id',
                    ignoreDuplicates: false
                }
            );

        if (cartError) throw cartError;

        // Build query to check for existing item
        let query = supabase
            .from('cart_items')
            .select('cart_item_id, quantity')
            .eq('user_id', userId)
            .eq('product_id', productId);

        // Add variation filters if provided
        if (variationData.variation_id !== undefined) {
            query = query.eq('variation_id', variationData.variation_id);
        } else {
            query = query.is('variation_id', null);
        }

        if (variationData.color !== undefined) {
            query = query.eq('color', variationData.color);
        } else {
            query = query.is('color', null);
        }

        if (variationData.size !== undefined) {
            query = query.eq('size', variationData.size);
        } else {
            query = query.is('size', null);
        }

        const { data: existingItem } = await query.single();

        let result: CartItem;

        if (existingItem) {
            // Update quantity if item exists
            const { data, error } = await supabase
                .from('cart_items')
                .update({
                    quantity: existingItem.quantity + quantity,
                    updated_at: new Date()
                })
                .eq('cart_item_id', existingItem.cart_item_id)
                .select()
                .single();

            if (error) throw error;
            result = data as CartItem;
        } else {
            // Insert new item if it doesn't exist
            const { data, error } = await supabase
                .from('cart_items')
                .insert({
                    user_id: userId,
                    product_id: productId,
                    quantity: quantity,
                    added_at: new Date(),
                    updated_at: new Date(),
                    variation_id: variationData.variation_id || null,
                    color: variationData.color || null,
                    size: variationData.size || null,
                    product_sku: variationData.product_sku || null,
                    price: variationData.price || null
                })
                .select()
                .single();

            if (error) throw error;
            result = data as CartItem;
        }

        return { success: true, cartItem: result };
    } catch (error) {
        console.error('Error adding to cart:', error);
        return { success: false, error: (error as Error).message };
    }
};

// Remove single item from cart by cart_item_id
export const removeFromCart = async (cartItemId: number): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('cart_item_id', cartItemId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error removing from cart:', error);
        return { success: false, error: (error as Error).message };
    }
};

// Remove item by product_id and variation
export const removeFromCartByProduct = async (
    userId: number,
    productId: number,
    variationData: VariationData = {}
): Promise<{ success: boolean; error?: string }> => {
    try {
        let query = supabase
            .from('cart_items')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);

        // Add variation filters if provided
        if (variationData.variation_id !== undefined) {
            query = query.eq('variation_id', variationData.variation_id);
        } else {
            query = query.is('variation_id', null);
        }

        if (variationData.color !== undefined) {
            query = query.eq('color', variationData.color);
        } else {
            query = query.is('color', null);
        }

        if (variationData.size !== undefined) {
            query = query.eq('size', variationData.size);
        } else {
            query = query.is('size', null);
        }

        const { error } = await query;

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error removing from cart:', error);
        return { success: false, error: (error as Error).message };
    }
};

// Clear entire cart for user
export const clearCart = async (userId: number): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error clearing cart:', error);
        return { success: false, error: (error as Error).message };
    }
};

// Update quantity by cart_item_id
export const updateCartQuantity = async (
    cartItemId: number,
    newQuantity: number
): Promise<{ success: boolean; error?: string }> => {
    try {
        if (newQuantity < 1) {
            return await removeFromCart(cartItemId);
        }

        const { error } = await supabase
            .from('cart_items')
            .update({
                quantity: newQuantity,
                updated_at: new Date()
            })
            .eq('cart_item_id', cartItemId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error updating quantity:', error);
        return { success: false, error: (error as Error).message };
    }
};

// Update quantity by product and variation
export const updateCartQuantityByProduct = async (
    userId: number,
    productId: number,
    newQuantity: number,
    variationData: VariationData = {}
): Promise<{ success: boolean; error?: string }> => {
    try {
        if (newQuantity < 1) {
            return await removeFromCartByProduct(userId, productId, variationData);
        }

        let query = supabase
            .from('cart_items')
            .update({
                quantity: newQuantity,
                updated_at: new Date()
            })
            .eq('user_id', userId)
            .eq('product_id', productId);

        // Add variation filters if provided
        if (variationData.variation_id !== undefined) {
            query = query.eq('variation_id', variationData.variation_id);
        } else {
            query = query.is('variation_id', null);
        }

        if (variationData.color !== undefined) {
            query = query.eq('color', variationData.color);
        } else {
            query = query.is('color', null);
        }

        if (variationData.size !== undefined) {
            query = query.eq('size', variationData.size);
        } else {
            query = query.is('size', null);
        }

        const { error } = await query;

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error updating quantity:', error);
        return { success: false, error: (error as Error).message };
    }
};

// Fetch cart items with product details
export const fetchCartItems = async (
    userId: number
): Promise<{ success: boolean; data?: CartItemWithProduct[]; error?: string }> => {
    try {
        const { data, error } = await supabase
            .from('cart_items')
            .select(`
                cart_item_id,
                user_id,
                product_id,
                quantity,
                added_at,
                updated_at,
                variation_id,
                color,
                size,
                product_sku,
                price,
                products (
                    id,
                    name,
                    price,
                    originalprice,
                    product_images,
                    category,
                    is_active
                ),
                product_variations (
                    id,
                    color,
                    size,
                    quantity,
                    price_adjustment,
                    sku
                )
            `)
            .eq('user_id', userId)
            .order('added_at', { ascending: false });

        if (error) throw error;

        // Process the data to include calculated fields and handle variations
        const processedData = (data || []).map(item => {
            const product = item.products;
            const variation = item.product_variations;

            // Calculate current price and stock based on variation
            const basePrice = product?.price || 0;
            const priceAdjustment = variation?.price_adjustment || 0;
            const currentPrice = basePrice + priceAdjustment;

            // Use stored price from cart_item if different from current calculation
            // This ensures price doesn't change after adding to cart
            const finalPrice = item.price !== currentPrice ? item.price : currentPrice;

            // Calculate stock from variation instead of product stock_number
            const variationStock = variation?.quantity || 0;
            const isInStock = variationStock > 0 && product?.is_active;

            return {
                cart_item_id: item.cart_item_id,
                user_id: item.user_id,
                product_id: item.product_id,
                quantity: item.quantity,
                added_at: item.added_at,
                updated_at: item.updated_at,
                variation_id: item.variation_id,
                color: item.color || variation?.color,
                size: item.size || variation?.size,
                product_sku: item.product_sku || variation?.sku,
                price: finalPrice,
                // Enhanced product data with variation-aware fields
                products: {
                    ...product,
                    // For backward compatibility, calculate total stock from variations
                    stock_number: variationStock,
                    // Add calculated fields
                    calculated_price: finalPrice,
                    in_stock: isInStock,
                    variation_stock: variationStock
                },
                // Include variation data separately
                product_variations: variation
            };
        });

        return { success: true, data: processedData as CartItemWithProduct[] };
    } catch (error) {
        console.error('Error fetching cart items:', error);
        return { success: false, error: (error as Error).message };
    }
};

// Get cart item count for user
export const getCartItemCount = async (
    userId: number
): Promise<{ success: boolean; count?: number; error?: string }> => {
    try {
        const { count, error } = await supabase
            .from('cart_items')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (error) throw error;

        return { success: true, count: count || 0 };
    } catch (error) {
        console.error('Error getting cart count:', error);
        return { success: false, error: (error as Error).message };
    }
};

// Get cart total price for user
export const getCartTotal = async (
    userId: number
): Promise<{ success: boolean; total?: number; error?: string }> => {
    try {
        const { data, error } = await supabase
            .from('cart_items')
            .select('quantity, price, products(price, originalprice)')
            .eq('user_id', userId);

        if (error) throw error;

        const total = data.reduce((sum: number, item: any) => {
            const price = item.price || item.products?.price || item.products?.originalprice || 0;
            return sum + (price * item.quantity);
        }, 0);

        return { success: true, total };
    } catch (error) {
        console.error('Error calculating cart total:', error);
        return { success: false, error: (error as Error).message };
    }
};

// Initialize or get user cart
export const initializeUserCart = async (
    userId: number
): Promise<{ success: boolean; cart?: any; error?: string }> => {
    try {
        const { data, error } = await supabase
            .from('carts')
            .upsert(
                {
                    user_id: userId,
                    updated_at: new Date()
                },
                {
                    onConflict: 'user_id',
                    ignoreDuplicates: false
                }
            )
            .select()
            .single();

        if (error) throw error;

        return { success: true, cart: data };
    } catch (error) {
        console.error('Error initializing user cart:', error);
        return { success: false, error: (error as Error).message };
    }
};

// Get user cart
export const getUserCart = async (
    userId: number
): Promise<{ success: boolean; cart?: any; error?: string }> => {
    try {
        const { data, error } = await supabase
            .from('carts')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        return { success: true, cart: data };
    } catch (error) {
        console.error('Error getting user cart:', error);
        return { success: false, error: (error as Error).message };
    }
};