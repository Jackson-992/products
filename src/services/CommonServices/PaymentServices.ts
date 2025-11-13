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
                    amount: paymentData.amount || 500,
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

// Update payment status
export const updatePaymentStatus = async (paymentId, status, completed = false) => {
    try {
        const updateData = { status };

        if (completed && status === 'completed') {
            updateData.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('registration_payment')
            .update(updateData)
            .eq('id', paymentId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, payment: data };
    } catch (error) {
        console.error('Error updating payment status:', error);
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

// Check if user has completed payment
export const hasCompletedPayment = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('registration_payment')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .limit(1);

        if (error) throw error;

        return { success: true, hasPayment: data.length > 0 };
    } catch (error) {
        console.error('Error checking completed payments:', error);
        return { success: false, error: error.message };
    }
};

// Get latest payment for user
export const getLatestUserPayment = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('registration_payment')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) throw error;

        return { success: true, payment: data };
    } catch (error) {
        console.error('Error fetching latest payment:', error);
        return { success: false, error: error.message };
    }
};