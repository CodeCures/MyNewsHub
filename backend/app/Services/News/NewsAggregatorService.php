<?php

namespace App\Services\News;

use App\Models\Article;
use App\Models\Category;
use App\Models\Source;
use Illuminate\Support\Str;

class NewsAggregatorService
{
    /**
     * Scrape articles from a source and store them
     */
    public function scrapeSource(Source $source): int
    {
        $driver = new RestApiDriver($source);
        $articles = $driver->fetchArticles();

        return $this->storeArticles($source, $articles);
    }

    /**
     * Store articles using bulk upsert for performance
     */
    protected function storeArticles(Source $source, array $articles): int
    {
        if (empty($articles)) {
            return 0;
        }

        $categoryMap = $this->ensureCategories($articles);

        $now = now();

        $prepared = collect($articles)->map(function ($article) use ($source, $categoryMap, $now) {
            $categorySlug = Str::slug($article['category'] ?? 'General');

            return [
                'id' => (string) Str::uuid(),
                'source_id' => $source->id,
                'category_id' => $categoryMap[$categorySlug] ?? $categoryMap['general'],
                'url' => $article['url'],
                'title' => $article['title'],
                'description' => $article['description'] ?? null,
                'content' => $article['content'] ?? null,
                'author' => $article['author'] ?? null,
                'image_url' => $article['image_url'] ?? null,
                'published_at' => $article['published_at'] ?? $now,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        })->toArray();

        Article::upsert(
            $prepared,
            ['url'],
            ['title', 'description', 'content', 'author', 'image_url', 'published_at', 'category_id', 'updated_at']
        );

        return count($prepared);
    }

    /**
     * Ensure all required categories exist and return slug => id mapping
     */
    protected function ensureCategories(array $articles): array
    {
        $categories = collect($articles)
            ->pluck('category')
            ->push('General')
            ->filter()
            ->unique()
            ->map(fn($name) => [
                'id' => (string) Str::uuid(),
                'name' => $name,
                'slug' => Str::slug($name),
                'created_at' => now(),
                'updated_at' => now(),
            ])
            ->values()
            ->toArray();

        if (!empty($categories)) {
            Category::upsert(
                $categories,
                ['slug'],
                ['name', 'updated_at']
            );
        }

        return Category::pluck('id', 'slug')->toArray();
    }
}
