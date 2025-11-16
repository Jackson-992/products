import { supabase } from '../../supabase.ts';

class RegistrationPaymentService {
    async getAllRegistrationPayments() {
        try {
            const { data, error } = await supabase
                .from('registration_payment')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data to match your component's expected format
            return data.map(payment => ({
                id: payment.id,
                payment_id: `REG-${payment.id}`,
                affiliate_code: payment.referer_code || 'N/A', // Map referer_code to affiliate_code
                amount: payment.amount || 0,
                status: payment.status || 'pending',
                created_at: payment.created_at,
                completed_at: payment.completed_at,
                type: 'registration',
                // Add details object that PaymentDetails expects
                details: {
                    user_id: payment.user_id,
                    phone_number: payment.phone_number,
                    referer_code: payment.referer_code,
                    amount: payment.amount || 0,
                    completed_at: payment.completed_at,
                    created_at: payment.created_at
                }
            }));

        } catch (error) {
            console.error('Error fetching registration payments:', error);
            throw error;
        }
    }

    async getRegistrationPaymentById(id) {
        try {
            const { data, error } = await supabase
                .from('registration_payment')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            return this.transformRegistrationData(data);
        } catch (error) {
            console.error('Error fetching registration payment:', error);
            throw error;
        }
    }

    async getRegistrationPaymentsByRefererCode(refererCode) {
        try {
            const { data, error } = await supabase
                .from('registration_payment')
                .select('*')
                .eq('referer_code', refererCode)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(payment => this.transformRegistrationData(payment));
        } catch (error) {
            console.error('Error fetching registration payments by referer code:', error);
            throw error;
        }
    }

    async getRegistrationPaymentsByStatus(status) {
        try {
            const { data, error } = await supabase
                .from('registration_payment')
                .select('*')
                .eq('status', status)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(payment => this.transformRegistrationData(payment));
        } catch (error) {
            console.error('Error fetching registration payments by status:', error);
            throw error;
        }
    }

    async getRegistrationPaymentsByUserId(userId) {
        try {
            const { data, error } = await supabase
                .from('registration_payment')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(payment => this.transformRegistrationData(payment));
        } catch (error) {
            console.error('Error fetching registration payments by user ID:', error);
            throw error;
        }
    }

    // Update registration payment status
    async updateRegistrationStatus(id, status) {
        try {
            const updateData = { status };

            // If status is completed, set completed_at to current timestamp
            if (status === 'completed') {
                updateData.completed_at = new Date().toISOString();
            }

            const { data, error } = await supabase
                .from('registration_payment')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return this.transformRegistrationData(data);
        } catch (error) {
            console.error('Error updating registration payment status:', error);
            throw error;
        }
    }

    // Create new registration payment
    async createRegistrationPayment(paymentData) {
        try {
            const { data, error } = await supabase
                .from('registration_payment')
                .insert([paymentData])
                .select()
                .single();

            if (error) throw error;

            return this.transformRegistrationData(data);
        } catch (error) {
            console.error('Error creating registration payment:', error);
            throw error;
        }
    }

    // Helper function to transform registration data for your component
    transformRegistrationData(payment) {
        return {
            id: payment.id,
            payment_id: `REG-${payment.id}`,
            affiliate_code: payment.referer_code || 'N/A',
            amount: payment.amount || 0,
            status: payment.status || 'pending',
            created_at: payment.created_at,
            completed_at: payment.completed_at,
            type: 'registration',
            details: {
                user_id: payment.user_id,
                phone_number: payment.phone_number,
                referer_code: payment.referer_code,
                amount: payment.amount || 0,
                completed_at: payment.completed_at,
                created_at: payment.created_at
            }
        };
    }
}

export default new RegistrationPaymentService();