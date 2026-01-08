<?php

namespace App\Jobs;

use App\Models\Source;
use App\Services\News\NewsAggregatorService;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Throwable;

class ScrapeArticlesFromSource implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels, Batchable;

    public $tries = 3;
    public $maxExceptions = 3;
    public $backoff = [60, 300, 900];
    public $timeout = 300;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Source $source
    ) {}

    /**
     * Execute the job.
     */
    public function handle(NewsAggregatorService $aggregator): void
    {
        $rateLimitKey = "scrape:{$this->source->slug}";

        RateLimiter::attempt(
            $rateLimitKey,
            $perMinute = 10,
            function() use ($aggregator) {
                Log::info("Scraping {$this->source->name}", ['source_id' => $this->source->id]);

                $count = $aggregator->scrapeSource($this->source);

                Log::info("Scraped {$count} articles from {$this->source->name}", [
                    'source_id' => $this->source->id,
                    'count' => $count
                ]);
            },
            $decaySeconds = 60
        );
    }

    public function failed(?Throwable $exception): void
    {
        Log::error("Failed to scrape {$this->source->name}", [
            'source_id' => $this->source->id,
            'error' => $exception?->getMessage(),
            'trace' => $exception?->getTraceAsString()
        ]);
    }

    public function retryUntil()
    {
        return now()->addHours(4);
    }
}
