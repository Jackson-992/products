// cartService.js
import { supabase } from './supabase';

// Add to cart
export const addToCart = async (userId, productId, quantity = 1) => {
    try {
        // Ensure the user has a cart (upsert will create if doesn't exist, update if exists)
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

        // Now, add or update the item in cart_items
        const { data: existingItem } = await supabase
            .from('cart_items')
            .select('quantity')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .single();

        let result;

        if (existingItem) {
            // Update quantity if item exists
            const { data, error } = await supabase
                .from('cart_items')
                .update({
                    quantity: existingItem.quantity + quantity,
                    updated_at: new Date()
                })
                .eq('user_id', userId)
                .eq('product_id', productId)
                .select()
                .single();

            if (error) throw error;
            result = data;
        } else {
            // Insert new item if it doesn't exist
            const { data, error } = await supabase
                .from('cart_items')
                .insert({
                    user_id: userId,
                    product_id: productId,
                    quantity: quantity,
                    added_at: new Date(),
                    updated_at: new Date()
                })
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        return { success: true, cartItem: result };
    } catch (error) {
        console.error('Error adding to cart:', error);
        return { success: false, error: error.message };
    }
};
// Remove single item from cart
export const removeFromCart = async (userId, productId) => {
    try {
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error removing from cart:', error);
        return { success: false, error: error.message };
    }
};

// Clear entire cart
export const clearCart = async (userId) => {
    try {
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error clearing cart:', error);
        return { success: false, error: error.message };
    }
};

// Update quantity
export const updateCartQuantity = async (userId, productId, newQuantity) => {
    try {
        if (newQuantity < 1) {
            return await removeFromCart(userId, productId);
        }

        const { error } = await supabase
            .from('cart_items')
            .update({
                quantity: newQuantity,
                updated_at: new Date()
            })
            .eq('user_id', userId)
            .eq('product_id', productId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error updating quantity:', error);
        return { success: false, error: error.message };
    }
};

// Fetch cart items with product details
export const fetchCartItems = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('cart_items')
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
        console.error('Error fetching cart items:', error);
        return { success: false, error: error.message };
    }
};