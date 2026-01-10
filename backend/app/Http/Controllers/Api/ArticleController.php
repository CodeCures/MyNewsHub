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
        $query = Article::searchWhenNotEmpty($request->input('search'))
            ->filterBy($request->only(['source', 'category', 'author', 'from_date', 'to_date']));

        return $this->paginatedResponse($query, $request->per_page);
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
            return response()->json([
                'data' => [],
                'message' => 'no preferences'
            ]);
        }

        $query = Article::searchWhenNotEmpty($request->input('search'))
            ->forMyPreferences($preferences)
            ->filterBy($request->only(['source', 'category', 'author']));

        return $this->paginatedResponse($query, $request->per_page);
    }

    /**
     * Paginate and return article collection.
     */
    private function paginatedResponse($query, ?int $per_page)
    {
        return new ArticleCollection($query->paginate($per_page ?? 15));
    }
}
