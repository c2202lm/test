<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Author;

// class AuthorController extends Controller
// {
//     public function login(Request $request)
//     {
//         $credentials = $request->only('email', 'password');

//         if (!Auth::attempt($credentials)) {
//             return response()->json(['message' => 'Invalid credentials'], 401);
//         }

//         $user = Auth::user();
//         $token = $user->createToken('auth_token')->plainTextToken;

//         return response()->json([
//             'token' => $token,
//             'user' => [
//                 'email' => $user->email,
//                 'name' => $user->name,
//                 'role' => $user->role
//             ]
//         ]);
//     }
// }
