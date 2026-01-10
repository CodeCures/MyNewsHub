import httpClient from '@/lib/httpClient';
import type { Source } from '@/types';

export const sourceService = {
  /**
   * Get all sources
   */
  async getAll(): Promise<Source[]> {
    const response = await httpClient.get('/admin/sources');
    return response.data.data || [];
  },

  /**
   * Get a single source by ID
   */
  async getById(id: string): Promise<Source> {
    const response = await httpClient.get(`/admin/sources/${id}`);
    return response.data;
  },

  /**
   * Create a new source
   */
  async create(data: any): Promise<Source> {
    const response = await httpClient.post('/admin/sources', data);
    return response.data;
  },

  /**
   * Update an existing source
   */
  async update(id: string, data: any): Promise<Source> {
    const response = await httpClient.put(`/admin/sources/${id}`, data);
    return response.data;
  },

  /**
   * Delete a source
   */
  async delete(id: string): Promise<void> {
    await httpClient.delete(`/admin/sources/${id}`);
  },
};
