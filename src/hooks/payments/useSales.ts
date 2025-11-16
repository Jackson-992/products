// useSales.js
import { useState, useEffect } from 'react';
import salesCommissionService from '@/services/AdminServices/payments/SalesCommission.ts';

export const useSales = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                const salesCommissions = await salesCommissionService.getAllSalesCommissions();
                setPayments(salesCommissions);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching payments:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const refetch = async () => {
        try {
            setLoading(true);
            const salesCommissions = await salesCommissionService.getAllSalesCommissions();
            setPayments(salesCommissions);
        } catch (err) {
            setError(err.message);
            console.error('Error refetching payments:', err);
        } finally {
            setLoading(false);
        }
    };

    return {
        payments,
        loading,
        error,
        refetch
    };
};