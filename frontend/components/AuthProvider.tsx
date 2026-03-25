'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const store = useAuthStore.getState();
    if (token && savedUser) {
      try {
        store.setAuth(JSON.parse(savedUser), token);
      } catch {
        store.logout();
      }
    } else {
      store.setLoading(false);
    }
  }, []);

  return <>{children}</>;
}