<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserPreferenceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $preference = $request->user()->preference;

        return response()->json($preference ?? [
            'preferred_sources' => [],
            'preferred_categories' => [],
            'preferred_authors' => [],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'preferred_sources' => 'nullable|array',
            'preferred_sources.*' => 'exists:sources,id',
            'preferred_categories' => 'nullable|array',
            'preferred_categories.*' => 'exists:categories,id',
            'preferred_authors' => 'nullable|array',
            'preferred_authors.*' => 'string',
        ]);

        $preference = $request->user()->preference()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json($preference, 201);
    }
}
