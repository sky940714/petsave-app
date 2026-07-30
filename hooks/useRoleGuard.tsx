import { Redirect } from 'expo-router';
import { useAuth, Role } from '../context/AuthContext';

export function useRoleGuard(allowed: Role[]) {
  const { user, loading } = useAuth();

  if (loading) return { ready: false, redirect: null };
  if (!user) return { ready: false, redirect: <Redirect href="/login" /> };
  if (!allowed.includes(user.role)) return { ready: false, redirect: <Redirect href="/unauthorized" /> };
  return { ready: true, redirect: null };
}
