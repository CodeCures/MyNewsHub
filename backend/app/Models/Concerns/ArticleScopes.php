<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

trait ArticleScopes
{
    /**
     * Scope to apply filters from an array.
     */
    public function scopeFilterBy($query, array $filters)
    {
        return $query
            ->withRelations()
            ->filterBySource($filters['source'] ?? null)
            ->filterByCategory($filters['category'] ?? null)
            ->filterByAuthor($filters['author'] ?? null)
            ->filterByDateRange($filters['from_date'] ?? null, $filters['to_date'] ?? null)
            ->sortByLatest();
    }

    /**
     * Scope to filter by user preferences.
     */
    public function scopeForMyPreferences($query, $preferences)
    {
        return $query
            ->when($preferences?->preferred_sources, fn($q) =>
                $q->whereIn('source_id', $preferences->preferred_sources)
            )
            ->when($preferences?->preferred_categories, fn($q) =>
                $q->whereIn('category_id', $preferences->preferred_categories)
            )
            ->when($preferences?->preferred_authors, fn($q) =>
                $q->whereIn('author', $preferences->preferred_authors)
            );
    }

    /**
     * Scope to eager load common relationships.
     */
    public function scopeWithRelations($query)
    {
        return $query->with(['source', 'category']);
    }

    /**
     * Scope to sort by published date.
     */
    public function scopeSortByLatest($query)
    {
        return $query->latest('published_at');
    }

    /**
     * Scope to filter by source ID or slug.
     */
    public function scopeFilterBySource($query, $sourceIdOrSlug)
    {
        return $query->when($sourceIdOrSlug, fn($q) =>
            Str::isUuid($sourceIdOrSlug)
                ? $q->where('source_id', $sourceIdOrSlug)
                : $q->whereHas('source', fn($sq) => $sq->where('slug', $sourceIdOrSlug))
        );
    }

    /**
     * Scope to filter by category ID or slug.
     */
    public function scopeFilterByCategory($query, $categoryIdOrSlug)
    {
        return $query->when($categoryIdOrSlug, fn($q) =>
            Str::isUuid($categoryIdOrSlug)
                ? $q->where('category_id', $categoryIdOrSlug)
                : $q->whereHas('category', fn($cq) => $cq->where('slug', $categoryIdOrSlug))
        );
    }

    /**
     * Scope to filter by author name.
     */
    public function scopeFilterByAuthor($query, ?string $author)
    {
        return $query->when($author, fn($q) =>
            $q->where('author', 'like', "%{$author}%")
        );
    }

    /**
     * Scope to filter by date range.
     */
    public function scopeFilterByDateRange($query, ?string $fromDate, ?string $toDate)
    {
        return $query
            ->when($fromDate, fn($q) => $q->whereDate('published_at', '>=', $fromDate))
            ->when($toDate, fn($q) => $q->whereDate('published_at', '<=', $toDate));
    }
}
