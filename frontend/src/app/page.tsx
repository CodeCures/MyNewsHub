import httpClient from '@/lib/httpClient';
import HomeClient from './HomeClient';
import type { Article, PaginationMeta } from '@/types';

interface ArticlesData {
  articles: Article[];
  meta: PaginationMeta | null;
}

async function getArticlesData(filters: Record<string, any> = {}): Promise<ArticlesData> {
  try {
    const response = await httpClient.get('/articles', { params: filters });
    
    return {
      articles: response.data.data || [],
      meta: response.data.meta || null,
    };
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return { articles: [], meta: null };
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await searchParams in Next.js 15
  const params = await searchParams;
  
  // Extract filters from URL params
  const filters = {
    search: params.search as string | undefined,
    page: params.page ? Number(params.page) : 1,
  };

  // Fetch data server-side (no auth required for public articles)
  const articlesData = await getArticlesData(filters);

  return (
    <HomeClient 
      initialData={articlesData}
      initialFilters={filters}
    />
  );
}
