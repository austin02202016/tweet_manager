import { supabase } from './supabase';

export interface User {
  id: string;
  created_at: string;
  email: string;
  organization_id: string | null;
  role: string | null;
  auth_user_id: string | null;
  first_name: string | null;
}

export class UserService {
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!authUser) return null;

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (userError) throw userError;
      return user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  static async getUsersByOrganization(organizationId: string): Promise<User[]> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) throw error;
      return users || [];
    } catch (error) {
      console.error('Error fetching users by organization:', error);
      return [];
    }
  }
} 