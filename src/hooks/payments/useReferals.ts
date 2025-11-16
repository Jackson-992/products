import { useState, useEffect } from 'react';
import referralCommissionService from '@/services/AdminServices/payments/ReferalsCommission.ts';

export const useReferralPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReferralPayments();
    }, []);

    const fetchReferralPayments = async () => {
        try {
            setLoading(true);
            setError(null);

            const referralCommissions = await referralCommissionService.getAllReferralCommissions();
            setPayments(referralCommissions);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching referral payments:', err);
        } finally {
            setLoading(false);
        }
    };

    const refetch = async () => {
        await fetchReferralPayments();
    };

    return {
        payments,
        loading,
        error,
        refetch
    };
};