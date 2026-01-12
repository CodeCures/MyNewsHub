import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAuthenticatedHttpClient } from '@/lib/serverHttpClient';
import ArticlesAdminClient from './ArticlesAdminClient';
import { sourceService } from '@/services/sourceService';
import { categoryService } from '@/services/categoryService';
import type { Article, PaginationMeta, Source, Category } from '@/types';

interface ArticlesData {
  articles: Article[];
  meta: PaginationMeta | null;
  sources: Source[];
  categories: Category[];
}

interface ArticleFilters {
  search?: string;
  source?: string;
  category?: string;
  page?: number;
}

async function getArticlesData(filters: ArticleFilters = {}): Promise<ArticlesData> {
  try {
    // Get authenticated httpClient for server-side
    const httpClient = await getAuthenticatedHttpClient();
    
    // Fetch articles with filters
    const articlesRes = await httpClient.get('/articles', { params: filters });
    
    // Fetch filter options in parallel
    const [sources, categories] = await Promise.all([
      sourceService.getAll(),
      categoryService.getAll(),
    ]);
    
    return {
      articles: articlesRes.data.data || [],
      meta: articlesRes.data.meta || null,
      sources,
      categories,
    };
  } catch (error) {
    console.error('Failed to fetch articles data:', error);
    return {
      articles: [],
      meta: null,
      sources: [],
      categories: [],
    };
  }
}

export default async function ArticlesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  // Check if user is admin
  if (session.user.role !== 'admin') {
    redirect('/');
  }

  // Await searchParams in Next.js 15
  const params = await searchParams;

  // Extract filters from URL params
  const filters = {
    search: params.search as string | undefined,
    source: params.source as string | undefined,
    category: params.category as string | undefined,
    page: params.page ? Number(params.page) : 1,
  };

  const data = await getArticlesData(filters);

  return <ArticlesAdminClient initialData={data} initialFilters={filters} />;
}
