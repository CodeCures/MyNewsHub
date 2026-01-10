<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSourceRequest;
use App\Http\Requests\UpdateSourceRequest;
use App\Jobs\ScrapeArticlesFromSource;
use App\Models\Source;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Bus;

class SourceController extends Controller
{
    /**
     * Display a listing of sources.
     */
    public function index(): JsonResponse
    {
        $sources = Source::all();

        return response()->json([
            'success' => true,
            'data' => $sources
        ]);
    }

    /**
     * Store a newly created source.
     */
    public function store(StoreSourceRequest $request): JsonResponse
    {
        $source = Source::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Source created successfully',
            'data' => $source
        ], 201);
    }

    /**
     * Display the specified source.
     */
    public function show(Source $source): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $source
        ]);
    }

    /**
     * Update the specified source.
     */
    public function update(UpdateSourceRequest $request, Source $source): JsonResponse
    {
        $source->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Source updated successfully',
            'data' => $source
        ]);
    }

    /**
     * Remove the specified source.
     */
    public function destroy(Source $source): JsonResponse
    {
        $source->delete();

        return response()->json([
            'success' => true,
            'message' => 'Source deleted successfully'
        ]);
    }

    /**
     * Trigger manual scrape for all active sources.
     */
    public function scrape(): JsonResponse
    {
        $activeSources = Source::whereSlug('guardian')->get();

        if ($activeSources->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No active sources found'
            ], 404);
        }


        $jobs = $activeSources->map(function ($source) {
            return new ScrapeArticlesFromSource($source);
        })->toArray();

        $batch = Bus::batch($jobs)
            ->name('Manual News Scrape - ' . now()->format('Y-m-d H:i:s'))
            ->onQueue('scraping')
            ->dispatch();

        return response()->json([
            'success' => true,
            'message' => "Scraping {$activeSources->count()} sources",
            'batch_id' => $batch->id,
            'sources' => $activeSources->pluck('name')
        ]);
    }
}
