'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store';
import { authApi } from '@/lib/api';

/**
 * Hook to fetch and maintain user data on protected pages.
 * Note: Redirects are handled by middleware for better UX.
 * This hook only ensures user data is loaded.
 */
export function useAuthGuard() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      // If we don't have user data in store, fetch it
      if (!user) {
        try {
          const userData = await authApi.getUser();
          setUser(userData);
        } catch (error) {
          // If fetch fails, middleware will redirect on next navigation
          console.error('Failed to fetch user data:', error);
        }
      }
    };

    fetchUser();
  }, [user, setUser]);

  return { user, isAuthenticated: !!user };
}
