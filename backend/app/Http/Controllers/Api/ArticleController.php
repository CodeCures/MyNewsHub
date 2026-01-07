<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleCollection;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Article::with(['source', 'category'])
            ->when($request->keyword, fn($q) =>
                $q->whereFullText(['title', 'description', 'content'], $request->keyword)
            )
            ->when($request->source, fn($q) =>
                $q->whereHas('source', fn($sq) => $sq->where('slug', $request->source))
            )
            ->when($request->category, fn($q) =>
                $q->whereHas('category', fn($cq) => $cq->where('slug', $request->category))
            )
            ->when($request->author, fn($q) =>
                $q->where('author', 'like', "%{$request->author}%")
            )
            ->when($request->from_date, fn($q) =>
                $q->whereDate('published_at', '>=', $request->from_date)
            )
            ->when($request->to_date, fn($q) =>
                $q->whereDate('published_at', '<=', $request->to_date)
            )
            ->latest('published_at')
            ->paginate($request->per_page ?? 15);

        return new ArticleCollection($query);
    }

    /**
     * Display the specified resource.
     */
    public function show(Article $article)
    {
        return new ArticleResource($article->load(['source', 'category']));
    }

    public function personalized(Request $request)
    {
        $preferences = $request->user()->preference;

        if (!$preferences) {
            return $this->index($request);
        }

        $query = Article::with(['source', 'category'])
            ->when($preferences->preferred_sources, fn($q) =>
                $q->whereIn('source_id', $preferences->preferred_sources)
            )
            ->when($preferences->preferred_categories, fn($q) =>
                $q->whereIn('category_id', $preferences->preferred_categories)
            )
            ->when($preferences->preferred_authors, fn($q) =>
                $q->whereIn('author', $preferences->preferred_authors)
            )
            ->latest('published_at')
            ->paginate($request->per_page ?? 15);

        return new ArticleCollection($query);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
