import { sourceService } from '@/services/sourceService';
import { categoryService } from '@/services/categoryService';
import type { Source, Category } from '@/types';

export interface FeedFilters {
  search?: string;
  source?: number | string;
  category?: number | string;
  author?: string;
  page?: number;
}

/**
 * Fetch sources filtered by user's preferences
 */
export async function fetchUserSources(preferredSourceIds: string[]): Promise<Source[]> {
  if (!preferredSourceIds?.length) return [];
  
  const allSources = await sourceService.getAll();
  
  return allSources.filter((src: Source) => 
    preferredSourceIds.includes(String(src.id))
  );
}

/**
 * Fetch categories filtered by user's preferences
 */
export async function fetchUserCategories(preferredCategoryIds: string[]): Promise<Category[]> {
  if (!preferredCategoryIds?.length) return [];
  
  const allCategories = await categoryService.getAll();
  
  return allCategories.filter((cat: Category) => 
    preferredCategoryIds.includes(String(cat.id))
  );
}

/**
 * Build filter object from form state
 */
export function buildFeedFilters(
  debouncedSearch: string,
  selectedSource: number | null,
  selectedCategory: number | null,
  selectedAuthor: string | null,
  sources: Source[],
  categories: Category[],
  currentPage: number
): FeedFilters {
  const filters: FeedFilters = { page: currentPage };
  
  if (debouncedSearch) {
    filters.search = debouncedSearch;
  }
  
  if (selectedSource) {
    const source = sources.find(s => s.id === selectedSource);
    if (source) filters.source = source.id;
  }
  
  if (selectedCategory) {
    const category = categories.find(c => c.id === selectedCategory);
    if (category) filters.category = category.id;
  }
  
  if (selectedAuthor) {
    filters.author = selectedAuthor;
  }
  
  return filters;
}
