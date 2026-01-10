<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;
        
        $userData = $user->toArray();
        $userData['roles'] = $user->getRoleNames()->toArray();
        $userData['permissions'] = $user->getPermissionNames()->toArray();

        return response()->json([
            'user' => $userData,
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;
        
        $userData = $user->toArray();
        $userData['roles'] = $user->getRoleNames()->toArray();
        $userData['permissions'] = $user->getPermissionNames()->toArray();

        return response()->json([
            'user' => $userData,
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $userData = $user->toArray();
        $userData['roles'] = $user->getRoleNames()->toArray();
        $userData['permissions'] = $user->getPermissionNames()->toArray();
        
        return response()->json($userData);
    }
}
