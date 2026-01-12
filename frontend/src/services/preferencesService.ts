import { getAuthenticatedHttpClient } from '@/lib/serverHttpClient';
import { sourceService } from './sourceService';
import { categoryService } from './categoryService';

interface UserPreferences {
  preferred_sources: string[];
  preferred_categories: string[];
  preferred_authors: string[];
}

interface PreferencesWithDetails {
  sources: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  authors: string[];
}

/**
 * Get user preferences (just the IDs and author names)
 */
export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const httpClient = await getAuthenticatedHttpClient();
    const response = await httpClient.get('/preferences');
    const preferences = response.data?.data || response.data || null;
    
    return {
      preferred_sources: preferences?.preferred_sources || [],
      preferred_categories: preferences?.preferred_categories || [],
      preferred_authors: preferences?.preferred_authors || [],
    };
  } catch (error) {
    console.error('Failed to fetch user preferences:', error);
    return {
      preferred_sources: [],
      preferred_categories: [],
      preferred_authors: [],
    };
  }
}

/**
 * Get user preferences with full details (names and IDs)
 * This fetches the user's preference IDs and then gets the full objects
 */
export async function getUserPreferencesWithDetails(): Promise<PreferencesWithDetails> {
  try {
    const httpClient = await getAuthenticatedHttpClient();
    
    // Fetch preferences and all available sources/categories in parallel
    const [preferencesRes, allSources, allCategories] = await Promise.all([
      httpClient.get('/preferences'),
      sourceService.getAll(),
      categoryService.getAll(),
    ]);
    
    const preferences = preferencesRes.data?.data || preferencesRes.data || null;
    const preferredSourceIds = preferences?.preferred_sources || [];
    const preferredCategoryIds = preferences?.preferred_categories || [];
    const preferredAuthors = preferences?.preferred_authors || [];
    
    // Filter sources and categories to only include user's preferences
    const sources = allSources.filter(s => preferredSourceIds.includes(s.id));
    const categories = allCategories.filter(c => preferredCategoryIds.includes(c.id));
    
    return {
      sources,
      categories,
      authors: preferredAuthors,
    };
  } catch (error) {
    console.error('Failed to fetch user preferences with details:', error);
    return {
      sources: [],
      categories: [],
      authors: [],
    };
  }
}

export const preferencesService = {
  getUserPreferences,
  getUserPreferencesWithDetails,
};
