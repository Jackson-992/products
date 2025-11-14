// hooks/UseOrders.ts
import { useState, useEffect } from 'react';
import { orderService, Order, OrderWithItems } from '@/services/AdminServices/adminOrderServices.ts';

export const useOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);
                const ordersData = await orderService.getAllOrders();
                setOrders(ordersData);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to load orders. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getOrderWithItems = async (orderId: bigint): Promise<OrderWithItems | null> => {
        try {
            return await orderService.getOrderWithItems(orderId);
        } catch (err) {
            console.error('Error fetching order details:', err);
            throw err;
        }
    };

    return { orders, loading, error, getOrderWithItems };
};