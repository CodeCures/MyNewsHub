<?php

namespace App\Console\Commands;

use App\Jobs\ScrapeArticlesFromSource;
use App\Models\Source;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Bus;

class ScrapeNewsArticles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'news:scrape {--source= : Specific source to scrape}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scrape articles from news sources and store locally';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting news scraping...');

        $sources = $this->option('source')
            ? Source::where('slug', $this->option('source'))->get()
            : Source::where('is_active', true)->get();

        if ($sources->isEmpty()) {
            $this->error('No active sources found.');
            return Command::FAILURE;
        }

        $this->info("Found {$sources->count()} source(s) to scrape.");

        foreach ($sources as $source) {
            $this->line("Dispatching job for: {$source->name}");
            ScrapeArticlesFromSource::dispatch($source)->onQueue('scraping');
        }

        $this->info("Dispatched {$sources->count()} scraping jobs to queue.");
        $this->line("Run 'php artisan queue:work' to process the jobs.");

        return Command::SUCCESS;
    }
}
