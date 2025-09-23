<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsController extends Controller
{
    public function analytics(Request $request)
    {
        $statusCodes = ['Preparing Food', 'Out for Delivery', 'Delivered'];

        // Lấy orders kèm quan hệ
        $orders = Order::with(['items.meal', 'user', 'statusRef'])
            ->whereHas('statusRef', function ($q) use ($statusCodes) {
                $q->whereIn('code', $statusCodes);
            })
            ->get();

        $now = now();
        $today = $now->toDateString();
        $startOfWeek = $now->copy()->startOfWeek();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfYear = $now->copy()->startOfYear();

        // Doanh thu theo mốc thời gian
        $revenueToday = $orders->where('order_date', $today)->sum('total');
        $revenueThisWeek = $orders->whereBetween('order_date', [$startOfWeek, $now])->sum('total');
        $revenueThisMonth = $orders->whereBetween('order_date', [$startOfMonth, $now])->sum('total');
        $revenueThisYear = $orders->whereBetween('order_date', [$startOfYear, $now])->sum('total');

        // Doanh thu từng tháng (1 - 12)
        $monthlyRaw = $orders
            ->groupBy(function ($order) {
                return $order->order_date->month;
            })
            ->map(function ($orders) {
                return $orders->sum('total');
            });

        $monthlyRevenue = array_fill(1, 12, 0.0);
        foreach ($monthlyRaw as $month => $rev) {
            $monthlyRevenue[$month] = (float) $rev;
        }

        // Chuẩn hóa dữ liệu orders cho frontend
        $ordersData = $orders->map(function ($o) {
            return [
                'id' => $o->id,
                'status' => $o->statusRef?->label,
                'price' => $o->total,
                'orderDate' => $o->order_date?->toISOString(),
                'customerName' => $o->user?->name,
                'items' => $o->items->map(fn($item) => [
                    'meal_id' => $item->meal_id,
                    'meal_name' => $item->meal?->name,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'image' => $item->meal?->image,
                ]),
            ];
        });

        return response()->json([
            'orders' => $ordersData,
            'revenueToday' => (float) $revenueToday,
            'revenueThisWeek' => (float) $revenueThisWeek,
            'revenueThisMonth' => (float) $revenueThisMonth,
            'revenueThisYear' => (float) $revenueThisYear,
            'monthlyRevenue' => array_values($monthlyRevenue),
        ]);
    }
}
