<?php

namespace App\Services\News;

use App\Models\Source;
use Illuminate\Support\Facades\Http;

class RestApiDriver
{
    protected Source $source;
    protected array $config;

    public function __construct(Source $source)
    {
        $this->source = $source;
        $this->config = $source->configuration ?? [];
    }

    /**
     * Fetch articles from the configured REST API
     */
    public function fetchArticles(): array
    {
        if (empty($this->config)) {
            throw new \Exception("Source {$this->source->slug} has no configuration");
        }

        $queryParams = $this->buildQueryParams($this->config['query_params'] ?? []);

        $response = Http::timeout(30)->get($this->source->url, $queryParams);

        if (!$response->successful()) {
            throw new \Exception("Failed to fetch from {$this->source->slug}: {$response->status()}");
        }

        // Extract articles array from response
        $articlesPath = $this->config['articles_path'] ?? null;
        $rawArticles = $articlesPath ? data_get($response->json(), $articlesPath) : $response->json();

        if (!is_array($rawArticles)) {
            return [];
        }

        $fieldMap = $this->config['field_map'] ?? [];
        $defaultCategory = $this->config['default_category'] ?? null;

        return collect($rawArticles)
            ->map(fn($item) => $this->mapFields($item, $fieldMap, $defaultCategory))
            ->filter()
            ->values()
            ->toArray();
    }

    /**
     * Build query parameters, replacing placeholders like {api_key}
     */
    protected function buildQueryParams(array $params): array
    {
        return collect($params)->map(function ($value) {
            if (is_string($value)) {
                return str_replace('{api_key}', $this->source->api_key, $value);
            }
            return $value;
        })->toArray();
    }

    /**
     * Map API response fields to our standard article structure
     * Implements hybrid category handling: extract → default → "General"
     */
    protected function mapFields(array $item, array $fieldMap, ?string $defaultCategory = null): ?array
    {
        try {

            $mapped = collect($fieldMap)->mapWithKeys(function ($sourcePath, $targetField) use ($item) {
                $value = data_get($item, $sourcePath);

                if ($targetField === 'published_at' && $value) {
                    try {
                        $value = \Carbon\Carbon::parse($value)->format('Y-m-d H:i:s');
                    } catch (\Exception $e) {
                        $value = now()->format('Y-m-d H:i:s');
                    }
                }

                return [$targetField => $value];
            })->toArray();

            if (empty($mapped['category'])) {
                $mapped['category'] = $defaultCategory ?? 'General';
            }

            // Special handling for NYTimes multimedia
            if ($this->source->slug === 'nytimes') {
                $extractedImage = $this->extractNytimesImage($item);
                if ($extractedImage) {
                    $mapped['image_url'] = $extractedImage;
                }
            }

            if (empty($mapped['url']) || empty($mapped['title'])) {
                return null;
            }

            return $mapped;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Extract image URL from NYTimes multimedia array
     */
    protected function extractNytimesImage(array $item): ?string
    {
        $multimedia = $item['multimedia'] ?? [];

        if (empty($multimedia) || !is_array($multimedia)) {
            return null;
        }

        // Prefer larger/better quality images
        $preferredFormats = ['mediumThreeByTwo440', 'mediumThreeByTwo210', 'Normal'];

        foreach ($preferredFormats as $format) {
            foreach ($multimedia as $media) {
                if (isset($media['format']) && $media['format'] === $format &&
                    !empty($media['url'])) {
                    return $media['url'];
                }
            }
        }

        // Fallback: find first image with absolute URL
        foreach ($multimedia as $media) {
            if (isset($media['type']) && strtolower($media['type']) === 'image' &&
                !empty($media['url'])) {
                $url = $media['url'];

                // If URL is already absolute, return it
                if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
                    return $url;
                }

                // Fallback: prepend static image server for relative URLs
                return 'https://static01.nyt.com/' . ltrim($url, '/');
            }
        }

        return null;
    }
}
