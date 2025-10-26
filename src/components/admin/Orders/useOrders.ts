import { useState, useEffect } from 'react';

// Mock data - replace with actual API call
const mockOrders = [
    {
        id: 1,
        order_id: 'ORD-001',
        user_name: 'John Doe',
        user_id: 'USR001',
        phone: '0798751269',
        amount: 149.99,
        status: 'Completed',
        created_at: '2024-01-15T10:30:00Z',
        products: [
            { id: 'PROD-001', name: 'Wireless Headphones', quantity: 1, price: 99.99 },
            { id: 'PROD-002', name: 'Phone Case', quantity: 2, price: 25.00 }
        ]
    },
    {
        id: 2,
        order_id: 'ORD-002',
        user_name: 'Jane Smith',
        user_id: 'USR002',
        phone: '0796321458',
        amount: 299.50,
        status: 'Processing',
        created_at: '2024-01-16T14:45:00Z',
        products: [
            { id: 'PROD-003', name: 'Smart Watch', quantity: 1, price: 199.99 },
            { id: 'PROD-004', name: 'Screen Protector', quantity: 1, price: 99.51 }
        ]
    },
    {
        id: 3,
        order_id: 'ORD-003',
        user_name: 'Bob Johnson',
        user_id: 'USR003',
        phone: '0796218634',
        amount: 75.25,
        status: 'Pending',
        created_at: '2024-01-17T09:15:00Z',
        products: [
            { id: 'PROD-005', name: 'USB Cable', quantity: 3, price: 25.08 }
        ]
    },
    {
        id: 4,
        order_id: 'ORD-004',
        user_name: 'Alice Brown',
        user_id: 'USR004',
        phone: '0123579645',
        amount: 450.00,
        status: 'Cancelled',
        created_at: '2024-01-18T16:20:00Z',
        products: [
            { id: 'PROD-006', name: 'Tablet', quantity: 1, price: 399.99 },
            { id: 'PROD-007', name: 'Tablet Cover', quantity: 1, price: 50.01 }
        ]
    }
];

export const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        const fetchOrders = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
                setOrders(mockOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return { orders, loading };
};