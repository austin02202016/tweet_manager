import { useState, useEffect } from 'react';
import { UserService, type User } from '@/lib/user-service';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await UserService.getCurrentUser();
        setUser(userData);
      } catch (err: any) {
        console.error('Error fetching user:', err);
        setError(err.message || 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
};

export const useOrganizationUsers = (organizationId: string | null) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const usersData = await UserService.getUsersByOrganization(organizationId);
        setUsers(usersData);
      } catch (err: any) {
        console.error('Error fetching organization users:', err);
        setError(err.message || 'Failed to fetch organization users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [organizationId]);

  return { users, loading, error };
};

export default useUser; 