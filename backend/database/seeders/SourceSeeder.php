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
                        'show-fields' => 'trailText,thumbnail,byline',
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
                        'content' => 'fields.trailText',
                        'category' => 'sectionName',
                    ],
                ],
            ],

            // New York Times - Extracts category from response
            [
                'name' => 'New York Times',
                'slug' => 'nytimes',
                'api_key' => env('NYTIMES_API_KEY'),
                'url' => 'https://api.nytimes.com/svc/search/v2/articlesearch.json',
                'is_active' => true,
                'configuration' => [
                    'query_params' => [
                        'api-key' => '{api_key}',
                        'sort' => 'newest',
                        'page' => 0,
                        'page_size' => 100,
                    ],
                    'articles_path' => 'response.docs',
                    'field_map' => [
                        'title' => 'headline.main',
                        'description' => 'abstract',
                        'url' => 'web_url',
                        'image_url' => 'multimedia.0.url',
                        'published_at' => 'pub_date',
                        'author' => 'byline.original',
                        'content' => 'lead_paragraph',
                        'category' => 'section_name',
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
