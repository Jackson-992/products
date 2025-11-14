// services/UserService.ts
import { supabase } from "../supabase";

export interface User {
    id: bigint;
    name: string | null;
    auth_id: string;
    is_admin: boolean;
    is_affiliate: boolean;
}

class UserService {

    async getAllUsers(): Promise<User[]> {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('id, name, auth_id, is_admin, is_affiliate')
                .order('id', { ascending: true });

            if (error) {
                throw new Error(`Error fetching users: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            throw error;
        }
    }
}

export const userService = new UserService();