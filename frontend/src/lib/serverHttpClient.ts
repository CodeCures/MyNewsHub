import { auth } from '@/auth';
import httpClient from './httpClient';

/**
 * Creates an authenticated httpClient for server-side use
 * Automatically injects the session token from NextAuth
 */
export async function getAuthenticatedHttpClient() {
  const session = await auth();
  
  if (session?.user?.accessToken) {
    // Set auth token for this request
    httpClient.defaults.headers.common['Authorization'] = `Bearer ${session.user.accessToken}`;
  }
  
  return httpClient;
}

/**
 * Helper to make authenticated server-side requests
 * Usage: await withAuth((client) => client.get('/api/endpoint'))
 */
export async function withAuth<T>(
  callback: (client: typeof httpClient) => Promise<T>
): Promise<T> {
  const client = await getAuthenticatedHttpClient();
  return callback(client);
}
