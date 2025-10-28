import { supabase } from './supabase';

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

        // 2. Create order items with variation data
        const orderItemsData = items.map(item => ({
            order_id: order.id,
            product_id: item.productId,
            variation_id: item.variationId,      // NEW
            color: item.color,                   // NEW
            size: item.size,                     // NEW
            product_sku: item.sku,               // NEW
            quantity: item.quantity,
            price: item.price,
            product_name: item.name,
            affiliate_id: item.affiliate_id || null,
            commission_earned: item.commission_earned || 0
        }));

        const { data: orderItems, error: orderItemsError } = await supabase
            .from('order_items')
            .insert(orderItemsData)
            .select(`
                *,
                products (
                    id,
                    name,
                    product_images,
                    category
                ),
                product_variations (
                    id,
                    color,
                    size,
                    sku,
                    quantity
                )
            `);

        if (orderItemsError) {
            console.error('Error creating order items:', orderItemsError);
            throw new Error(`Failed to create order items: ${orderItemsError.message}`);
        }

        // 3. Update product variation quantities (reduce stock)
        for (const item of items) {
            if (item.variationId) {
                const { error: updateError } = await supabase
                    .from('product_variations')
                    .update({
                        quantity: item.variationStock - item.quantity
                    })
                    .eq('id', item.variationId);

                if (updateError) {
                    console.error('Error updating variation stock:', updateError);
                    // Don't throw here - we don't want to fail the entire order
                    // due to stock update issues
                }
            }
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

export const getUserOrders = async (userId) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *,
                    products (
                        id,
                        name,
                        product_images,
                        category
                    ),
                    product_variations (
                        id,
                        color,
                        size,
                        sku
                    )
                )
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

export const getOrderById = async (orderId) => {
    try {
        const { data: order, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *,
                    products (
                        id,
                        name,
                        product_images,
                        category
                    ),
                    product_variations (
                        id,
                        color,
                        size,
                        sku
                    )
                )
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

export const deleteOrder = async (orderId) => {
    try {
        // First get order items to restore variation quantities
        const { data: orderItems, error: itemsFetchError } = await supabase
            .from('order_items')
            .select('variation_id, quantity')
            .eq('order_id', orderId);

        if (itemsFetchError) throw itemsFetchError;

        // Restore variation quantities
        for (const item of orderItems || []) {
            if (item.variation_id) {
                await supabase.rpc('increment_variation_quantity', {
                    variation_id: item.variation_id,
                    increment_amount: item.quantity
                });
            }
        }

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

export const getAllOrders = async (page = 1, limit = 10) => {
    try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data: orders, error, count } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *,
                    products (
                        id,
                        name,
                        product_images,
                        category
                    ),
                    product_variations (
                        id,
                        color,
                        size,
                        sku
                    )
                )
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

// NEW: Get order items with full product and variation details
export const getOrderItemsWithDetails = async (orderId) => {
    try {
        const { data: orderItems, error } = await supabase
            .from('order_items')
            .select(`
                *,
                products (
                    id,
                    name,
                    product_images,
                    category,
                    price as base_price
                ),
                product_variations (
                    id,
                    color,
                    size,
                    sku,
                    price_adjustment
                )
            `)
            .eq('order_id', orderId);

        if (error) throw error;

        return {
            success: true,
            orderItems: orderItems
        };
    } catch (error) {
        console.error('Error fetching order items:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// NEW: Check variation availability before order creation
export const checkVariationAvailability = async (items) => {
    try {
        const availabilityResults = [];

        for (const item of items) {
            if (item.variationId) {
                const { data: variation, error } = await supabase
                    .from('product_variations')
                    .select('quantity, color, size, sku')
                    .eq('id', item.variationId)
                    .single();

                if (error) {
                    availabilityResults.push({
                        productId: item.productId,
                        variationId: item.variationId,
                        available: false,
                        error: 'Variation not found'
                    });
                    continue;
                }

                availabilityResults.push({
                    productId: item.productId,
                    variationId: item.variationId,
                    available: variation.quantity >= item.quantity,
                    currentStock: variation.quantity,
                    requestedQuantity: item.quantity,
                    color: variation.color,
                    size: variation.size,
                    sku: variation.sku
                });
            } else {
                // Handle products without variations (backward compatibility)
                availabilityResults.push({
                    productId: item.productId,
                    available: true, // Assume available for backward compatibility
                    note: 'No variation specified'
                });
            }
        }

        const allAvailable = availabilityResults.every(result => result.available);

        return {
            success: true,
            allAvailable: allAvailable,
            availability: availabilityResults
        };
    } catch (error) {
        console.error('Error checking variation availability:', error);
        return {
            success: false,
            error: error.message
        };
    }
};