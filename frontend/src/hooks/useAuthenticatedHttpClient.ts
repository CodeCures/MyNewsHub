'use client';

import { useSession } from 'next-auth/react';
import { httpClient } from '@/lib/httpClient';
import { useEffect } from 'react';

/**
 * Hook to configure httpClient with the current session token
 * Should be used in client components that need authenticated API calls
 * Returns the session loading state to prevent API calls before auth is ready
 */
export function useAuthenticatedHttpClient() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Set up a request interceptor that uses the session token
    const interceptor = httpClient.interceptors.request.use((config) => {
      if (session?.user?.accessToken) {
        config.headers.Authorization = `Bearer ${session.user.accessToken}`;
      }
      return config;
    });

    // Clean up the interceptor when component unmounts or session changes
    return () => {
      httpClient.interceptors.request.eject(interceptor);
    };
  }, [session]);

  return {
    httpClient,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}
