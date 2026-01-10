<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\JsonResponse;

class AuthorController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $authors = Article::query()
            ->whereNotNull('author')
            ->distinct()
            ->pluck('author')
            ->values();

        return response()->json([
            'data' => $authors,
        ]);
    }
}
