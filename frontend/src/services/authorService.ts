import httpClient from '@/lib/httpClient';

export const authorService = {
  /**
   * Get all authors
   */
  async getAll(): Promise<string[]> {
    const response = await httpClient.get('/authors');
    return response.data.data || [];
  },
};
