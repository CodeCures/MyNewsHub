import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - token will be set by useAuthenticatedHttpClient hook
httpClient.interceptors.request.use((config) => {
  // Token is injected per-component via the useAuthenticatedHttpClient hook
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't show toast on server-side or for auth endpoints (handled by login page)
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
    
    if (typeof window !== 'undefined' && !isAuthEndpoint) {
      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        toast.error('Your session has expired. Please login again.');
        // localStorage.removeItem('user');
        // window.location.href = '/auth/login';
      }
      
      // Handle validation errors (422)
      else if (error.response?.status === 422) {
        const validationError = error.response.data;
        if (validationError.message) {
          error.message = validationError.message;
          toast.error(validationError.message);
        }
        // Attach errors object for detailed handling
        error.validationErrors = validationError.errors;
        
        // Show first validation error if available
        if (validationError.errors) {
          const firstError = Object.values(validationError.errors)[0];
          if (Array.isArray(firstError) && firstError[0]) {
            toast.error(firstError[0] as string);
          }
        }
      }
      
      // Handle other error responses
      else if (error.response?.data?.message) {
        error.message = error.response.data.message;
        toast.error(error.response.data.message);
      }
      
      // Handle network errors
      else if (error.message === 'Network Error') {
        toast.error('Network error. Please check your connection.');
      }
      
      // Generic error
      else if (!error.response) {
        toast.error('An unexpected error occurred.');
      }
    }
    
    // Always attach error message to error object for manual handling
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    
    return Promise.reject(error);
  }
);

export default httpClient;
