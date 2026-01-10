<?php

namespace App\Models;

use App\Models\Concerns\ArticleScopes;
use App\Support\ArticleQueryBuilder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Scout\Searchable;

class Article extends Model
{
    use HasUuids, Searchable, ArticleScopes;

    protected $fillable = [
        'source_id',
        'category_id',
        'title',
        'description',
        'content',
        'url',
        'image_url',
        'author',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function source(): BelongsTo
    {
        return $this->belongsTo(Source::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Conditionally search or return a regular query builder.
     */
    public static function searchWhenNotEmpty(?string $search): ArticleQueryBuilder
    {
        $builder = $search ? static::search($search) : static::query();
        return new ArticleQueryBuilder($builder);
    }

    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'content' => $this->content,
            'author' => $this->author,
        ];
    }
}
