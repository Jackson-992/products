// wishlistService.js
import { supabase } from './supabase';

// Add to wishlist
export const addToWishList = async (userId, productId) => {
    try {
        // Ensure the user has a wishlist first
        const { error: wishListError } = await supabase
            .from('wishlists')
            .upsert(
                {
                    user_id: userId,
                    updated_at: new Date().toISOString()
                },
                {
                    onConflict: 'user_id'
                }
            );

        if (wishListError) throw wishListError;

        // Check if item already exists in wishlist - use proper Supabase query
        const { data: existingItem, error: checkError } = await supabase
            .from('wishlist_items')
            .select('wishlist_item_id')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .maybeSingle(); // Use maybeSingle instead of single to avoid throwing on no rows

        if (checkError) throw checkError;

        let result;

        if (existingItem) {
            // Item already exists, return it
            const { data, error } = await supabase
                .from('wishlist_items')
                .select('*')
                .eq('wishlist_item_id', existingItem.wishlist_item_id)
                .single();

            if (error) throw error;
            result = data;
        } else {
            // Insert new item
            const { data, error } = await supabase
                .from('wishlist_items')
                .insert({
                    user_id: userId,
                    product_id: productId,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        return { success: true, wishlistItem: result };
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return { success: false, error: error.message };
    }
};
// Remove single item from wishlist
export const removeFromWishList = async (userId, productId) => {
    try {
        const { error } = await supabase
            .from('wishlist_items')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return { success: false, error: error.message };
    }
};

// Clear entire wishlist
export const clearWishList = async (userId) => {
    try {
        const { error } = await supabase
            .from('wishlist_items')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error clearing wishlist:', error);
        return { success: false, error: error.message };
    }
};

// Fetch wishlist items with product details
export const fetchWishListItems = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('wishlist_items')
            .select(`
                *,
                products (
                    id,
                    name,
                    price,
                    originalprice,
                    product_images,
                    category,
                    stock_number
                )
            `)
            .eq('user_id', userId);

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error fetching wishlist items:', error);
        return { success: false, error: error.message };
    }
};

// Check if product is in user's wishlist
export const isInWishList = async (userId, productId) => {
    try {
        const { data, error } = await supabase
            .from('wishlist_items')
            .select('wishlist_item_id')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .maybeSingle();

        if (error) throw error;

        return { success: true, isInWishlist: !!data };
    } catch (error) {
        console.error('Error checking wishlist:', error);
        return { success: false, error: error.message };
    }
};
