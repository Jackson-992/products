// services/OrderService.ts
import { supabase } from "../supabase";

export interface Order {
    id: bigint;
    user_id: bigint;
    total_amount: number;
    status: string;
    created_at: string;
    updated_at: string;
    payment_completion: boolean;
    phone_number: string;
    user_name?: string;
}

export interface OrderItem {
    id: bigint;
    order_id: bigint;
    product_id: bigint | null;
    quantity: number;
    price: number;
    commission_earned: number;
    created_at: string;
    product_name: string | null;
    variation_id: bigint | null;
    color: string | null;
    size: string | null;
    product_sku: string | null;
    affiliate_code: string | null;
}

export interface OrderWithItems extends Order {
    order_items: OrderItem[];
}

class OrderService {
    /**
     * Get all orders with user information
     */
    async getAllOrders(): Promise<Order[]> {
        try {
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) {
                throw new Error(`Error fetching orders: ${ordersError.message}`);
            }

            if (!orders || orders.length === 0) {
                return [];
            }

            // Get user names from user_profiles
            const userIds = [...new Set(orders.map(order => order.user_id))];
            const { data: users, error: usersError } = await supabase
                .from('user_profiles')
                .select('id, name')
                .in('id', userIds);

            if (usersError) {
                console.warn('Could not fetch user names:', usersError.message);
            }

            // Create a map of user_id to user_name
            const userMap = new Map();
            users?.forEach(user => {
                userMap.set(user.id, user.name);
            });

            // Combine the data
            const ordersWithUserNames = orders.map(order => ({
                ...order,
                user_name: userMap.get(order.user_id) || 'N/A'
            }));

            return ordersWithUserNames;
        } catch (error) {
            console.error('Error in getAllOrders:', error);
            throw error;
        }
    }

    /**
     * Get order details with order items
     */
    async getOrderWithItems(orderId: bigint): Promise<OrderWithItems | null> {
        try {
            // Get the main order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (orderError) {
                throw new Error(`Error fetching order: ${orderError.message}`);
            }

            if (!order) {
                return null;
            }

            // Get user name
            const { data: user } = await supabase
                .from('user_profiles')
                .select('name')
                .eq('id', order.user_id)
                .single();

            // Get order items
            const { data: orderItems, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', orderId)
                .order('id', { ascending: true });

            if (itemsError) {
                throw new Error(`Error fetching order items: ${itemsError.message}`);
            }

            return {
                ...order,
                user_name: user?.name || 'N/A',
                order_items: orderItems || []
            };
        } catch (error) {
            console.error('Error in getOrderWithItems:', error);
            throw error;
        }
    }
}

export const orderService = new OrderService();