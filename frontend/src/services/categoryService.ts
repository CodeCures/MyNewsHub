import httpClient from '@/lib/httpClient';
import type { Category } from '@/types';

export const categoryService = {
  /**
   * Get all categories
   */
  async getAll(): Promise<Category[]> {
    const response = await httpClient.get('/categories');
    return response.data.data || [];
  },

  /**
   * Get a single category by ID
   */
  async getById(id: string): Promise<Category> {
    const response = await httpClient.get(`/categories/${id}`);
    return response.data;
  },
};
