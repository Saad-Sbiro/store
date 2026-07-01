<?php

use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AIInsightController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutLeadController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ── Public Routes ──
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

Route::post('/checkout-leads', [CheckoutLeadController::class, 'upsert'])->middleware('throttle:20,1');
Route::delete('/checkout-leads/{token}', [CheckoutLeadController::class, 'destroy'])->middleware('throttle:20,1');
Route::post('/orders', [OrderController::class, 'store'])->middleware('throttle:10,1');

// Public endpoint to log page visits/clicks, handles both anonymous and authenticated sessions
Route::post('/analytics/log', [AnalyticsController::class, 'logEvent'])->middleware('api');

// ── Protected Customer Routes ──
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
});

// ── Admin-Only Routes ──
Route::middleware(['auth:sanctum'])->group(function () {
    // We will verify admin role inside the controllers or using middleware.
    // For robust safety, the controller functions already enforce $request->user()->isAdmin() checks.
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index']);
    Route::get('/admin/checkout-leads', [CheckoutLeadController::class, 'index']);
    Route::post('/admin/ai/chat', [AIInsightController::class, 'chat'])->middleware('throttle:20,1');
    Route::put('/admin/password', [AuthController::class, 'updatePassword']);

    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::post('/admin/upload', [AdminDashboardController::class, 'uploadFile']);
});
