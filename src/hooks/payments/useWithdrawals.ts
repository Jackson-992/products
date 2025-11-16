import { useState, useEffect } from 'react';
import withdrawalService from '@/services/AdminServices/payments/Withdrawals.ts';

export const useWithdrawals = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            setError(null);

            const withdrawals = await withdrawalService.getAllWithdrawals();
            setPayments(withdrawals);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching withdrawals:', err);
        } finally {
            setLoading(false);
        }
    };

    const refetch = async () => {
        await fetchWithdrawals();
    };

    return {
        payments,
        loading,
        error,
        refetch
    };
};