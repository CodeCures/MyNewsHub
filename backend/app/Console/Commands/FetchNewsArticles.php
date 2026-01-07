<?php

namespace App\Console\Commands;

use App\Services\News\NewsAggregatorService;
use Illuminate\Console\Command;

class FetchNewsArticles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'news:fetch {source?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch articles from news sources';

    /**
     * Execute the console command.
     */
    public function handle(NewsAggregatorService $aggregator)
    {
        $source = $this->argument('source');

        $this->info('Starting to fetch articles...');

        $count = $source
            ? $aggregator->fetchFromSource($source)
            : $aggregator->fetchFromAllSources();

        $this->info("Successfully fetched and stored {$count} articles");

        return Command::SUCCESS;
    }
}
