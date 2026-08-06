import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;

  switch (user.role) {
    case 'dispatcher':
      return <Redirect href="/(dispatcher)" />;
    case 'field_staff':
      return <Redirect href={'/(staff)' as any} />;
    case 'admin':
      return <Redirect href={'/(admin)' as any} />;
    default:
      return <Redirect href="/unauthorized" />;
  }
}
