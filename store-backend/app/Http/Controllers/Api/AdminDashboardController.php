<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsEvent;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Get summary metrics and chart datasets for the admin panel.
     */
    public function index(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $totalRevenue = Order::where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->sum('total');

        $ordersCount = Order::count();
        $productsCount = Product::count();

        $revenueData = Order::where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->where('created_at', '>=', now()->subDays(30))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(id) as orders')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $trafficData = AnalyticsEvent::where('created_at', '>=', now()->subDays(30))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(id) as views'),
                DB::raw('COUNT(DISTINCT visitor_ip) as visitors')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $salesSubquery = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.payment_status', 'paid')
            ->where('orders.status', '!=', 'cancelled')
            ->select(
                'order_items.product_id',
                DB::raw('SUM(order_items.quantity) as units_sold'),
                DB::raw('SUM(order_items.price * order_items.quantity) as sales_total')
            )
            ->groupBy('order_items.product_id');

        $topProducts = Product::with('category')
            ->joinSub($salesSubquery, 'sales', 'products.id', '=', 'sales.product_id')
            ->select('products.*', 'sales.units_sold', 'sales.sales_total')
            ->orderByDesc('sales.units_sold')
            ->limit(5)
            ->get();

        $recentOrders = Order::with(['user', 'items'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $categorySalesRows = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('orders.payment_status', 'paid')
            ->where('orders.status', '!=', 'cancelled')
            ->select(
                'categories.name',
                DB::raw('SUM(order_items.price * order_items.quantity) as revenue')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('revenue')
            ->get();

        $categorySalesTotal = (float) $categorySalesRows->sum('revenue');
        $categorySales = $categorySalesRows->map(function ($row) use ($categorySalesTotal) {
            $revenue = (float) $row->revenue;

            return [
                'name' => $row->name,
                'value' => $categorySalesTotal > 0 ? round(($revenue / $categorySalesTotal) * 100, 1) : 0,
                'revenue' => $revenue,
            ];
        })->values();

        $deviceBreakdown = AnalyticsEvent::whereNotNull('device_type')
            ->select('device_type as name', DB::raw('COUNT(id) as value'))
            ->groupBy('device_type')
            ->get();

        $avgSessionTime = (int) (AnalyticsEvent::where('time_spent', '>', 0)->avg('time_spent') ?? 0);
        $uniqueVisitorsCount = AnalyticsEvent::distinct('visitor_ip')->count('visitor_ip');
        $conversionRate = $uniqueVisitorsCount > 0 ? round(($ordersCount / $uniqueVisitorsCount) * 100, 1) : 0;

        return response()->json([
            'metrics' => [
                'total_revenue' => (float) $totalRevenue,
                'total_orders' => $ordersCount,
                'unique_customers' => $uniqueVisitorsCount,
                'avg_session_time' => $avgSessionTime,
                'conversion_rate' => $conversionRate,
                'total_products' => $productsCount,
            ],
            'charts' => [
                'revenue_history' => $revenueData,
                'traffic_history' => $trafficData,
                'category_sales' => $categorySales,
                'device_breakdown' => $deviceBreakdown,
            ],
            'top_products' => $topProducts,
            'recent_orders' => $recentOrders,
        ]);
    }

    /**
     * Upload an image to the local storage disk and return its public URL.
     */
    public function uploadFile(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
        ]);

        if ($request->file('file')) {
            $file = $request->file('file');
            $path = $file->store('uploads', 'public');
            $url = asset('storage/' . $path);

            return response()->json([
                'url' => $url,
                'path' => $path,
            ], 200);
        }

        return response()->json(['error' => 'File upload failed.'], 400);
    }
}
