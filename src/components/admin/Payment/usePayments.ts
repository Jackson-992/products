import { useState, useEffect } from 'react';

// Mock data - replace with actual API call
const mockPayments = [
    {
        id: 1,
        payment_id: 'PAY-001',
        affiliate_code: 'JOHN25',
        amount: 250,
        type: 'referral_commission',
        status: 'completed',
        created_at: '2024-02-01T10:30:00Z',
        details: {
            invitee_code: 'MIKE001',
            invitee_name: 'Mike Johnson',
            commission_amount: 250,
            invited_at: '2024-02-01T09:15:00Z'
        }
    },
    {
        id: 2,
        payment_id: 'PAY-002',
        affiliate_code: 'JANES',
        amount: 1500,
        type: 'sales_commission',
        status: 'completed',
        created_at: '2024-02-01T14:45:00Z',
        details: {
            product_id: 'PROD-123',
            product_name: 'Wireless Headphones',
            quantity: 2,
            unit_price: 5000,
            commission_rate: 15,
            commission_amount: 1500,
            sale_date: '2024-02-01T13:20:00Z'
        }
    },
    {
        id: 3,
        payment_id: 'PAY-003',
        affiliate_code: 'BOBREF',
        amount: 5000,
        type: 'withdrawal',
        status: 'pending',
        created_at: '2024-02-02T09:15:00Z',
        details: {
            phone_number: '+254712345678',
            network: 'Safaricom',
            transaction_id: null,
            initiated_at: '2024-02-02T09:15:00Z'
        }
    },
    {
        id: 4,
        payment_id: 'PAY-004',
        affiliate_code: 'JOHN25',
        amount: 3750,
        type: 'sales_commission',
        status: 'completed',
        created_at: '2024-02-02T11:20:00Z',
        details: {
            product_id: 'PROD-456',
            product_name: 'Smart Watch',
            quantity: 3,
            unit_price: 10000,
            commission_rate: 12.5,
            commission_amount: 3750,
            sale_date: '2024-02-02T10:45:00Z'
        }
    },
    {
        id: 5,
        payment_id: 'PAY-005',
        affiliate_code: 'JANES',
        amount: 250,
        type: 'referral_commission',
        status: 'completed',
        created_at: '2024-02-02T16:30:00Z',
        details: {
            invitee_code: 'LISA002',
            invitee_name: 'Lisa Wang',
            commission_amount: 250,
            invited_at: '2024-02-02T15:10:00Z'
        }
    },
    {
        id: 6,
        payment_id: 'PAY-006',
        affiliate_code: 'BOBREF',
        amount: 10000,
        type: 'withdrawal',
        status: 'processing',
        created_at: '2024-02-03T08:45:00Z',
        details: {
            phone_number: '+254723456789',
            network: 'Airtel',
            transaction_id: 'MPESA123456',
            initiated_at: '2024-02-03T08:45:00Z',
            processed_at: '2024-02-03T09:00:00Z'
        }
    }
];

export const usePayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        const fetchPayments = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                setPayments(mockPayments);
            } catch (error) {
                console.error('Error fetching payments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    return { payments, loading };
};