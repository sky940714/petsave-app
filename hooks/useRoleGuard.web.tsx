import { Redirect, usePathname, type Href } from 'expo-router';
import { useAuth, Role } from '../context/AuthContext';

// Route groups share browser URLs. Restore the signed-in role's matching screen
// when a full page load resolves an ambiguous URL to another group's layout.
export function useRoleGuard(allowed: Role[]) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) return { ready: false, redirect: null };
  if (!user) return { ready: false, redirect: <Redirect href="/login" /> };
  if (!allowed.includes(user.role)) {
    const group = { admin: '(admin)', dispatcher: '(dispatcher)', field_staff: '(staff)' }[user.role];
    const sharedCase = /^\/case\/[^/]+\/?$/.test(pathname);
    const sharedOperations = user.role !== 'field_staff' && ['/roster', '/vehicles'].includes(pathname);
    if (sharedCase || sharedOperations) {
      return { ready: false, redirect: <Redirect href={`/${group}${pathname}` as Href} /> };
    }
    return { ready: false, redirect: <Redirect href="/unauthorized" /> };
  }
  return { ready: true, redirect: null };
}
