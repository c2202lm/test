<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminAnalyticsController;
use App\Http\Controllers\AdminOrderController;
use App\Http\Middleware\CheckRole;
use App\Http\Controllers\MealController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AllergenController;
use App\Http\Controllers\DietTypeController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VoucherController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\AdminMessageController;

Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register'])->name('register');

Route::get('/meals', [MealController::class, 'index']);
Route::get('/meals/{id}', [MealController::class, 'show']);

Route::get('/allergens', [AllergenController::class, 'index']);
Route::get('/diet-types', [DietTypeController::class, 'index']);

Route::get('/vouchers', [VoucherController::class, 'publicIndex']);

Route::get('/recipients/{id}', [UserController::class, 'publicShow']);
//Route::post('/feedbacks', [FeedbackController::class, 'store']);

Route::middleware(['auth:sanctum', CheckRole::class . ':admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/', fn() => response()->json(['message' => 'Hello Admin']));

        Route::get('/dashboard', [AdminDashboardController::class, 'stats']);
        Route::get('/analytics', [AdminAnalyticsController::class, 'analytics']);

        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::post('/orders/{id}/update-status', [AdminOrderController::class, 'updateStatus']);

        Route::get('/meals', [MealController::class, 'index']);
        Route::post('/meals', [MealController::class, 'store']);
        Route::get('/meals/{id}', [MealController::class, 'show']);
        Route::put('/meals/{id}', [MealController::class, 'update']);
        Route::delete('/meals/{id}', [MealController::class, 'destroy']);

        Route::get('/cart', [CartController::class, 'index']);
        Route::post('/cart', [CartController::class, 'store']);
        Route::put('/cart/{id}', [CartController::class, 'update']);
        Route::delete('/cart/{id}', [CartController::class, 'destroy']);

        Route::post('/order', [OrderController::class, 'store']);
        Route::get('/order/{id}', [OrderController::class, 'show']);
        Route::post('/orders', [OrderController::class, 'store']);


        Route::post('/diet-types', [DietTypeController::class, 'store']);
        Route::get('/diet-types/{id}', [DietTypeController::class, 'show']);
        Route::put('/diet-types/{id}', [DietTypeController::class, 'update']);
        Route::delete('/diet-types/{id}', [DietTypeController::class, 'destroy']);

        Route::get('/vouchers', [VoucherController::class, 'index']);
        Route::get('/vouchers/{id}', [VoucherController::class, 'show']);
        Route::post('/vouchers', [VoucherController::class, 'store']);
        Route::put('/vouchers/{id}', [VoucherController::class, 'update']);
        Route::delete('/vouchers/{id}', [VoucherController::class, 'destroy']);

        // // Admin xem danh sách Contact
        // Route::get('/contacts', [ContactController::class, 'index']);

        // // Admin xem danh sách Feedback
        // Route::get('/feedbacks', [FeedbackController::class, 'index']);
        Route::get('/messages', [AdminMessageController::class, 'index']);

        // Contacts
        Route::get('/messages/contact/{id}', [AdminMessageController::class, 'showContact']);
        Route::delete('/messages/contact/{id}', [AdminMessageController::class, 'destroyContact']);

        // Feedbacks
        Route::get('/messages/feedback/{id}', [AdminMessageController::class, 'showFeedback']);
        Route::delete('/messages/feedback/{id}', [AdminMessageController::class, 'destroyFeedback']);

        Route::get('/profile', [UserController::class, 'profile']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
    });

Route::middleware(['auth:sanctum', CheckRole::class . ':user'])
    ->group(function () {
        Route::get('/orders', [OrderController::class, 'index']); // Lấy danh sách đơn hàng của user
        Route::post('/orders/place', [OrderController::class, 'placeOrder']);
        Route::get('/user/profile', [UserController::class, 'profile']);
        Route::put('/user/profile', [UserController::class, 'updateProfile']);

        Route::get('/cart', [CartController::class, 'index']);
        Route::post('/cart', [CartController::class, 'store']);
        Route::put('/cart/{id}', [CartController::class, 'update']);
        Route::delete('/cart/{id}', [CartController::class, 'destroy']);

        Route::get('/user/vouchers', [VoucherController::class, 'userVouchers']);
        Route::get('/user/vouchers', [VoucherController::class, 'getUserVouchers']);


        Route::post('/feedback', [FeedbackController::class, 'store']);

        Route::post('/contact', [ContactController::class, 'store']);
        Route::get('/orders', [OrderController::class, 'index']);   
        Route::post('/orders', [OrderController::class, 'store']); 

        Route::patch('/orders/{order}/cancel', [OrderController::class, 'cancel']);
    });
