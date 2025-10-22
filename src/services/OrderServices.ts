import { supabase } from './supabase';
/**
 * Create a new order and order items
 * @param {Object} orderData - Order information
 * @param {bigint} orderData.user_id - User ID
 * @param {string} orderData.phone_number - Phone number
 * @param {Array} orderData.items - Array of cart items
 * @returns {Object} Result with order and order items data
 */
export const createOrder = async (orderData) => {
    try {
        const { user_id, phone_number, items } = orderData;

        // Calculate total amount from items
        const total_amount = items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        // 1. Create the main order record
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([
                {
                    user_id: user_id,
                    total_amount: total_amount,
                    status: 'pending',
                    payment_completion: false,
                    phone_number: phone_number
                }
            ])
            .select()
            .single();

        if (orderError) {
            console.error('Error creating order:', orderError);
            throw new Error(`Failed to create order: ${orderError.message}`);
        }

        // 2. Create order items for each cart item
        const orderItemsData = items.map(item => ({
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price,
            product_name: item.name,
            // affiliate_id and commission_earned can be null/default
            affiliate_id: null,
            commission_earned: 0
        }));

        const { data: orderItems, error: orderItemsError } = await supabase
            .from('order_items')
            .insert(orderItemsData)
            .select();

        if (orderItemsError) {
            console.error('Error creating order items:', orderItemsError);
            throw new Error(`Failed to create order items: ${orderItemsError.message}`);
        }

        return {
            success: true,
            order: order,
            orderItems: orderItems
        };

    } catch (error) {
        console.error('Error in createOrder:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get orders for a specific user
 * @param {bigint} userId - User ID
 * @returns {Object} Result with user's orders
 */
export const getUserOrders = async (userId) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return {
            success: true,
            orders: orders
        };
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get order by ID with order items
 * @param {bigint} orderId - Order ID
 * @returns {Object} Result with order and items
 */
export const getOrderById = async (orderId) => {
    try {
        const { data: order, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (*)
            `)
            .eq('id', orderId)
            .single();

        if (error) throw error;

        return {
            success: true,
            order: order
        };
    } catch (error) {
        console.error('Error fetching order:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Update order status
 * @param {bigint} orderId - Order ID
 * @param {string} status - New status
 * @returns {Object} Result with updated order
 */
export const updateOrderStatus = async (orderId, status) => {
    try {
        const { data: order, error } = await supabase
            .from('orders')
            .update({
                status: status,
                updated_at: new Date()
            })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            order: order
        };
    } catch (error) {
        console.error('Error updating order status:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Mark order payment as completed
 * @param {bigint} orderId - Order ID
 * @returns {Object} Result with updated order
 */
export const completeOrderPayment = async (orderId) => {
    try {
        const { data: order, error } = await supabase
            .from('orders')
            .update({
                payment_completion: true,
                status: 'confirmed',
                updated_at: new Date()
            })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            order: order
        };
    } catch (error) {
        console.error('Error completing order payment:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Delete an order and its items (admin function)
 * @param {bigint} orderId - Order ID
 * @returns {Object} Result of deletion
 */
export const deleteOrder = async (orderId) => {
    try {
        // First delete order items (due to foreign key constraint)
        const { error: itemsError } = await supabase
            .from('order_items')
            .delete()
            .eq('order_id', orderId);

        if (itemsError) throw itemsError;

        // Then delete the order
        const { error: orderError } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (orderError) throw orderError;

        return {
            success: true,
            message: 'Order deleted successfully'
        };
    } catch (error) {
        console.error('Error deleting order:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get all orders with pagination (admin function)
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Result with paginated orders
 */
export const getAllOrders = async (page = 1, limit = 10) => {
    try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data: orders, error, count } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (*)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        return {
            success: true,
            orders: orders,
            totalCount: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit)
        };
    } catch (error) {
        console.error('Error fetching all orders:', error);
        return {
            success: false,
            error: error.message
        };
    }
};