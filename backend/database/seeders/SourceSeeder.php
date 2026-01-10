<?php

namespace Database\Seeders;

use App\Models\Source;
use Illuminate\Database\Seeder;

class SourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sources = [
            // NewsAPI - General news (no category extraction, uses default)
            [
                'name' => 'NewsAPI',
                'slug' => 'newsapi',
                'api_key' => env('NEWSAPI_KEY'),
                'url' => 'https://newsapi.org/v2/top-headlines',
                'is_active' => true,
                'configuration' => [
                    'query_params' => [
                        'apiKey' => '{api_key}',
                        'language' => 'en',
                        'pageSize' => 100,
                    ],
                    'articles_path' => 'articles',
                    'field_map' => [
                        'title' => 'title',
                        'description' => 'description',
                        'url' => 'url',
                        'image_url' => 'urlToImage',
                        'published_at' => 'publishedAt',
                        'author' => 'author',
                        'content' => 'content',
                    ],
                    'default_category' => 'General',
                ],
            ],

            // The Guardian - Extracts category from response
            [
                'name' => 'The Guardian',
                'slug' => 'guardian',
                'api_key' => env('GUARDIAN_API_KEY'),
                'url' => 'https://content.guardianapis.com/search',
                'is_active' => true,
                'configuration' => [
                    'query_params' => [
                        'api-key' => '{api_key}',
                        'show-fields' => 'trailText,thumbnail,byline,body',
                        'page-size' => 100,
                    ],
                    'articles_path' => 'response.results',
                    'field_map' => [
                        'title' => 'webTitle',
                        'description' => 'fields.trailText',
                        'url' => 'webUrl',
                        'image_url' => 'fields.thumbnail',
                        'published_at' => 'webPublicationDate',
                        'author' => 'fields.byline',
                        'content' => 'fields.body',
                        'category' => 'sectionName',
                    ],
                ],
            ],

            // New York Times - Top Stories API with multimedia support
            [
                'name' => 'New York Times',
                'slug' => 'nytimes',
                'api_key' => env('NYTIMES_API_KEY'),
                'url' => 'https://api.nytimes.com/svc/topstories/v2/home.json',
                'is_active' => true,
                'configuration' => [
                    'query_params' => [
                        'api-key' => '{api_key}',
                    ],
                    'articles_path' => 'results',
                    'field_map' => [
                        'title' => 'title',
                        'description' => 'abstract',
                        'url' => 'url',
                        'published_at' => 'published_date',
                        'author' => 'byline',
                        'content' => 'abstract',
                        'category' => 'section',
                    ],
                ],
            ],
        ];

        foreach ($sources as $source) {
            Source::updateOrCreate(
                ['slug' => $source['slug']],
                $source
            );
        }
    }
}
