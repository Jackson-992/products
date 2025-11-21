// paymentService.js
import { supabase } from '../supabase.ts';

// Create payment record
export const createPayment = async (paymentData) => {
    try {
        const { data, error } = await supabase
            .from('registration_payment')
            .insert([
                {
                    user_id: paymentData.user_id,
                    amount: 500,
                    status: 'pending',
                    phone_number: paymentData.phone_number,
                    referer_code: paymentData.referer_code,
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return { success: true, payment: data };
    } catch (error) {
        console.error('Error creating payment:', error);
        return { success: false, error: error.message };
    }
};

// Get payment by ID
export const getPaymentById = async (paymentId) => {
    try {
        const { data, error } = await supabase
            .from('registration_payment')
            .select('*')
            .eq('id', paymentId)
            .single();

        if (error) throw error;

        return { success: true, payment: data };
    } catch (error) {
        console.error('Error fetching payment:', error);
        return { success: false, error: error.message };
    }
};

// Get payments by user ID
export const getPaymentsByUserId = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('registration_payment')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return { success: true, payments: data };
    } catch (error) {
        console.error('Error fetching user payments:', error);
        return { success: false, error: error.message };
    }
};