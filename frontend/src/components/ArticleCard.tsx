import Link from 'next/link';
import { format } from 'date-fns';
import type { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/articles/${article.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {article.image_url && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
              {article.category?.name || 'Uncategorized'}
            </span>
            <span className="text-xs text-gray-500">{article.source_name}</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
            {article.title}
          </h3>
          <p 
            className="text-gray-600 text-sm mb-3 line-clamp-3"
            dangerouslySetInnerHTML={{ __html: article.description }}
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            {article.author && <span>By {typeof article.author === 'string' ? article.author : article.author.name}</span>}
            <span>{format(new Date(article.published_at), 'MMM dd, yyyy')}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
