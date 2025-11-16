import { useState, useEffect } from 'react';
import registrationPaymentService from '@/services/AdminServices/payments/RegistrationPayments.ts';

export const useRegistrationPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRegistrationPayments();
    }, []);

    const fetchRegistrationPayments = async () => {
        try {
            setLoading(true);
            setError(null);

            const registrationPayments = await registrationPaymentService.getAllRegistrationPayments();
            setPayments(registrationPayments);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching registration payments:', err);
        } finally {
            setLoading(false);
        }
    };

    const refetch = async () => {
        await fetchRegistrationPayments();
    };

    return {
        payments,
        loading,
        error,
        refetch
    };
};