import { useState, useEffect } from 'react';

// Mock data - replace with actual API call
const mockAffiliates = [
    {
        id: 1,
        user_id: 'USR001',
        user_name: 'John Doe',
        affiliate_code: 'JOHN25',
        created_at: '2024-01-15T10:30:00Z',
        total_referrals: 15,
        total_products_sold: 45,
        total_earned: 37500, // Ksh 37,500 (15 referrals × 250 + 45 sales commission)
        pending_earnings: 2500,
        wallet_balance: 8750,
        conversion_rate: 3.2,
        referred_by: {
            code: 'AFF001',
            name: 'Sarah Wilson'
        },
        recent_referrals: [
            { user_name: 'Mike Johnson', joined_at: '2024-02-01T14:20:00Z', status: 'active' },
            { user_name: 'Emily Davis', joined_at: '2024-01-28T09:15:00Z', status: 'active' },
            { user_name: 'Chris Brown', joined_at: '2024-01-25T16:45:00Z', status: 'inactive' }
        ]
    },
    {
        id: 2,
        user_id: 'USR002',
        user_name: 'Jane Smith',
        affiliate_code: 'JANES',
        created_at: '2024-01-20T14:45:00Z',
        total_referrals: 8,
        total_products_sold: 22,
        total_earned: 20000, // Ksh 20,000 (8 referrals × 250 + 22 sales commission)
        pending_earnings: 1200,
        wallet_balance: 4200,
        conversion_rate: 2.8,
        referred_by: null,
        recent_referrals: [
            { user_name: 'Alex Turner', joined_at: '2024-02-02T11:30:00Z', status: 'active' },
            { user_name: 'Lisa Wang', joined_at: '2024-01-30T13:15:00Z', status: 'active' }
        ]
    },
    {
        id: 3,
        user_id: 'USR003',
        user_name: 'Bob Johnson',
        affiliate_code: 'BOBREF',
        created_at: '2024-02-01T09:15:00Z',
        total_referrals: 3,
        total_products_sold: 8,
        total_earned: 750, // Ksh 750 (3 referrals × 250 + 8 sales commission)
        pending_earnings: 450,
        wallet_balance: 1200,
        conversion_rate: 1.5,
        referred_by: {
            code: 'JOHN25',
            name: 'John Doe'
        },
        recent_referrals: [
            { user_name: 'Tom Wilson', joined_at: '2024-02-05T10:00:00Z', status: 'active' }
        ]
    }
];

export const useAffiliates = () => {
    const [affiliates, setAffiliates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        const fetchAffiliates = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                setAffiliates(mockAffiliates);
            } catch (error) {
                console.error('Error fetching affiliates:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAffiliates();
    }, []);

    return { affiliates, loading };
};