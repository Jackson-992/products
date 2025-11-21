import { supabase } from '../supabase.ts';

// Server-side price calculation
const calculateServerSidePrice = async (productId: number, variationId: number) => {
    try {
        // Get base product price
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('price, originalprice')
            .eq('id', productId)
            .single();

        if (productError) throw productError;

        // Get variation price adjustment
        const { data: variation, error: variationError } = await supabase
            .from('product_variations')
            .select('price_adjustment')
            .eq('id', variationId)
            .single();

        if (variationError) throw variationError;

        // Calculate final price on server
        const basePrice = product.price || product.originalprice;
        const finalPrice = basePrice + (variation.price_adjustment || 0);

        return finalPrice;
    } catch (error) {
        console.error('Error calculating server-side price:', error);
        throw new Error('Failed to calculate product price');
    }
};

// Secure order creation
export const createSecureOrder = async (orderData: {
    user_id: string;
    phone_number: string;
    items: Array<{
        productId: number;
        variationId: number;
        quantity: number;
        color?: string;
        size?: string;
        sku?: string;
        name?: string;
    }>;
    affiliate_code?: string;
}) => {
    try {
        const { user_id, phone_number, items, affiliate_code } = orderData;

        // 1. Calculate ALL prices on server
        const serverPrices = await Promise.all(
            items.map(async (item) => ({
                ...item,
                price: await calculateServerSidePrice(item.productId, item.variationId)
            }))
        );

        // 2. Calculate total using SERVER prices
        const total_amount = serverPrices.reduce((sum, item) =>
            sum + (item.price * item.quantity), 0
        );

        // 3. Check stock availability and get current quantities
        const stockUpdates = [];
        for (const item of items) {
            const { data: variation, error } = await supabase
                .from('product_variations')
                .select('quantity')
                .eq('id', item.variationId)
                .single();

            if (error || !variation) {
                return {
                    success: false,
                    error: `Variation not found for product ${item.productId}`
                };
            }

            if (variation.quantity < item.quantity) {
                return {
                    success: false,
                    error: `Insufficient stock for product ${item.productId}. Available: ${variation.quantity}, Requested: ${item.quantity}`
                };
            }

            // Store the new quantity for update
            stockUpdates.push({
                variationId: item.variationId,
                newQuantity: variation.quantity - item.quantity
            });
        }

        // 4. Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                user_id: user_id,
                total_amount: total_amount,
                status: 'pending',
                payment_completion: false,
                phone_number: phone_number
            }])
            .select()
            .single();

        if (orderError) {
            console.error('Error creating order:', orderError);
            throw new Error(`Failed to create order: ${orderError.message}`);
        }

        // 5. Create order items with SERVER prices
        const orderItemsData = serverPrices.map(item => ({
            order_id: order.id,
            product_id: item.productId,
            variation_id: item.variationId,
            color: item.color,
            size: item.size,
            product_sku: item.sku,
            quantity: item.quantity,
            price: item.price, // SERVER-calculated price
            product_name: item.name,
            affiliate_code: affiliate_code || null,
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

        // 6. Update stock quantities (FIXED - no raw() method)
        for (const stockUpdate of stockUpdates) {
            const { error: updateError } = await supabase
                .from('product_variations')
                .update({
                    quantity: stockUpdate.newQuantity
                })
                .eq('id', stockUpdate.variationId);

            if (updateError) {
                console.error('Error updating stock:', updateError);
                // Don't fail the entire order for stock update issues
            }
        }

        return {
            success: true,
            order: order,
            orderItems: orderItems,
            serverTotal: total_amount
        };

    } catch (error) {
        console.error('Error in createSecureOrder:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Enhanced availability check with price validation
export const checkVariationAvailabilityWithPrices = async (items) => {
    try {
        const availabilityResults = [];

        for (const item of items) {
            if (item.variationId) {
                // Get current variation data
                const { data: variation, error } = await supabase
                    .from('product_variations')
                    .select('quantity, color, size, sku, price_adjustment')
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

                // Get product base price
                const { data: product } = await supabase
                    .from('products')
                    .select('price')
                    .eq('id', item.productId)
                    .single();

                // Calculate server-side price
                const basePrice = product?.price || 0;
                const serverPrice = basePrice + (variation.price_adjustment || 0);
                const priceValid = Math.abs(serverPrice - item.price) <= 1.00;

                availabilityResults.push({
                    productId: item.productId,
                    variationId: item.variationId,
                    available: variation.quantity >= item.quantity,
                    priceValid: priceValid,
                    currentStock: variation.quantity,
                    requestedQuantity: item.quantity,
                    clientPrice: item.price,
                    serverPrice: serverPrice,
                    color: variation.color,
                    size: variation.size,
                    sku: variation.sku
                });
            }
        }

        const allAvailable = availabilityResults.every(result => result.available && result.priceValid);

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
