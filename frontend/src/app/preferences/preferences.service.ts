import httpClient from '@/lib/httpClient';
import type { Source, Category } from '@/types';

/**
 * Fetch all sources from API
 */
export async function fetchSources(): Promise<Source[]> {
  const response = await httpClient.get('/admin/sources');
  return response.data.data || [];
}

/**
 * Fetch all categories from API
 */
export async function fetchCategories(): Promise<Category[]> {
  const response = await httpClient.get('/categories');
  return response.data.data || [];
}

/**
 * Fetch all authors from API
 */
export async function fetchAuthors(): Promise<string[]> {
  const response = await httpClient.get('/authors');
  return response.data.data || [];
}
