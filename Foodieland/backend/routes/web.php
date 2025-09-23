<?php

use App\Http\Middleware\AuthApiToken;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\AuthController;
use App\Http\Middleware\CheckRole;

Route::get('/', function () {
    return view('welcome');
});


// Route::middleware([AuthApiToken::class])->group(function () {
//     Route::get('/me', function (Request $request) {
//         return response()->json($request->user);
//     });

//     Route::get('/admin/only', function (Request $request) {
//         if ($request->user->role !== 'admin') {
//             return response()->json(['message' => 'Forbidden'], 403);
//         }
//         return response()->json(['message' => 'Welcome Admin!']);
//     });
// });



