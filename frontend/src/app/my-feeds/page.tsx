import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAuthenticatedHttpClient } from '@/lib/serverHttpClient';
import MyFeedsClient from './MyFeedsClient';
import type { Article, PaginationMeta } from '@/types';

interface FeedData {
  articles: Article[];
  meta: PaginationMeta | null;
  message: string;
}

async function getFeedData(filters: Record<string, any> = {}): Promise<FeedData> {
  try {
    // Get authenticated httpClient for server-side
    const httpClient = await getAuthenticatedHttpClient();
    
    const response = await httpClient.get('/articles/personalized/feed', { params: filters });
    
    return {
      articles: response.data.data || [],
      meta: response.data.meta || null,
      message: response.data.message || '',
    };
  } catch (error) {
    console.error('Failed to fetch feed:', error);
    return { articles: [], meta: null, message: '' };
  }
}

export default async function MyFeeds({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  // Await searchParams in Next.js 15
  const params = await searchParams;

  // Extract filters from URL params (these come from client-side navigation)
  const filters = {
    search: params.search as string | undefined,
    source: params.source as string | undefined,
    category: params.category as string | undefined,
    author: params.author as string | undefined,
    page: params.page ? Number(params.page) : 1,
  };

  // Fetch only feed data server-side (preferences fetched client-side once)
  const feedData = await getFeedData(filters);

  return (
    <MyFeedsClient 
      initialData={feedData}
      initialFilters={filters}
    />
  );
}
