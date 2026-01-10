<?php

use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SourceController;
use App\Http\Controllers\Api\UserPreferenceController;
use Illuminate\Support\Facades\Route;

// Health check endpoint for Docker healthcheck
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
});

Route::prefix('/auth')->group(function(){
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{article}', [ArticleController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/articles/personalized/feed', [ArticleController::class, 'personalized']);

    Route::get('/preferences', [UserPreferenceController::class, 'index']);
    Route::post('/preferences', [UserPreferenceController::class, 'store']);

    // Admin-only routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::apiResource('sources', SourceController::class);
        Route::post('/scrape', [SourceController::class, 'scrape']);
    });
});
