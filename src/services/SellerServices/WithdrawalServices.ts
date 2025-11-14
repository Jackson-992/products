import {supabase} from "@/services/supabase.ts";

export enum WithdrawalStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

export interface Withdrawal {
    id: number;
    affiliate_code: string;
    amount: number;
    phone_number: string | null;
    status: string | null;
    reason_of_status: string | null;
    created_at: string;
    processed_at: string | null;
    processed_by: number | null;
}

export interface CreateWithdrawalRequest {
    affiliate_code: string;
    amount: number;
    phone_number: string;
}

export interface UpdateWithdrawalStatusRequest {
    withdrawalId: number;
    status: WithdrawalStatus;
    reason_of_status?: string;
    processed_by?: number;
}

export interface WithdrawalHistoryFilters {
    affiliate_code?: string;
    status?: WithdrawalStatus;
    limit?: number;
    offset?: number;
}

export class WithdrawalService {

    async createWithdrawal(request: CreateWithdrawalRequest): Promise<Withdrawal | null> {
        try {
            const { data, error } = await supabase
                .from('withdrawals')
                .insert({
                    affiliate_code: request.affiliate_code,
                    amount: request.amount,
                    phone_number: request.phone_number,
                    status: WithdrawalStatus.PENDING
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating withdrawal:', error);
                return null;
            }

            return data;
        } catch (err) {
            console.error('Unexpected error:', err);
            return null;
        }
    }

    async getWithdrawalHistory(
        affiliateCode: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<Withdrawal[]> {
        try {
            const { data, error } = await supabase
                .from('withdrawals')
                .select('*')
                .eq('affiliate_code', affiliateCode)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('Error fetching withdrawal history:', error);
                return [];
            }

            return data || [];
        } catch (err) {
            console.error('Unexpected error:', err);
            return [];
        }
    }

    async getAllWithdrawals(filters?: WithdrawalHistoryFilters): Promise<Withdrawal[]> {
        try {
            let query = supabase.from('withdrawals').select('*');

            if (filters?.affiliate_code) {
                query = query.eq('affiliate_code', filters.affiliate_code);
            }

            if (filters?.status) {
                query = query.eq('status', filters.status);
            }

            query = query.order('created_at', { ascending: false });

            if (filters?.limit) {
                const offset = filters.offset || 0;
                query = query.range(offset, offset + filters.limit - 1);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching withdrawals:', error);
                return [];
            }

            return data || [];
        } catch (err) {
            console.error('Unexpected error:', err);
            return [];
        }
    }

    async getWithdrawalById(id: number): Promise<Withdrawal | null> {
        try {
            const { data, error } = await supabase
                .from('withdrawals')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching withdrawal:', error);
                return null;
            }

            return data;
        } catch (err) {
            console.error('Unexpected error:', err);
            return null;
        }
    }

    async updateWithdrawalStatus(request: UpdateWithdrawalStatusRequest): Promise<boolean> {
        try {
            const updateData: any = {
                status: request.status,
                processed_at: new Date().toISOString()
            };

            if (request.reason_of_status) {
                updateData.reason_of_status = request.reason_of_status;
            }

            if (request.processed_by) {
                updateData.processed_by = request.processed_by;
            }

            const { error } = await supabase
                .from('withdrawals')
                .update(updateData)
                .eq('id', request.withdrawalId);

            if (error) {
                console.error('Error updating withdrawal status:', error);
                return false;
            }

            return true;
        } catch (err) {
            console.error('Unexpected error:', err);
            return false;
        }
    }

    async getPendingWithdrawalsCount(affiliateCode: string): Promise<number> {
        try {
            const { count, error } = await supabase
                .from('withdrawals')
                .select('*', { count: 'exact', head: true })
                .eq('affiliate_code', affiliateCode)
                .eq('status', WithdrawalStatus.PENDING);

            if (error) {
                console.error('Error fetching pending withdrawals count:', error);
                return 0;
            }

            return count || 0;
        } catch (err) {
            console.error('Unexpected error:', err);
            return 0;
        }
    }

    async getTotalWithdrawn(affiliateCode: string): Promise<number> {
        try {
            const { data, error } = await supabase
                .from('withdrawals')
                .select('amount')
                .eq('affiliate_code', affiliateCode)
                .eq('status', WithdrawalStatus.COMPLETED);

            if (error) {
                console.error('Error fetching total withdrawn:', error);
                return 0;
            }

            const total = data?.reduce((sum, w) => sum + (Number(w.amount) || 0), 0) || 0;
            return total;
        } catch (err) {
            console.error('Unexpected error:', err);
            return 0;
        }
    }

    async cancelWithdrawal(
        withdrawalId: number,
        reason: string,
        cancelledBy?: number
    ): Promise<boolean> {
        try {
            // First check if withdrawal is pending
            const withdrawal = await this.getWithdrawalById(withdrawalId);

            if (!withdrawal || withdrawal.status !== WithdrawalStatus.PENDING) {
                console.error('Withdrawal not found or not pending');
                return false;
            }

            return await this.updateWithdrawalStatus({
                withdrawalId,
                status: WithdrawalStatus.CANCELLED,
                reason_of_status: reason,
                processed_by: cancelledBy
            });
        } catch (err) {
            console.error('Unexpected error:', err);
            return false;
        }
    }
}

// Export a singleton instance
export const withdrawalService = new WithdrawalService();