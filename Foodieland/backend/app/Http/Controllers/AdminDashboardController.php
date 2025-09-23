<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperOrder
 */
class Order extends Model
{
    protected $fillable = ['price', 'quantity', 'status'];
}

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\User;

class AdminDashboardController extends Controller
{
    public function stats(Request $request)
    {
        $orders = Order::with(['items.meal', 'user', 'statusRef'])->get();

        $totalRevenue = $orders
            ->filter(fn($o) => in_array($o->statusRef?->label, ['Preparing Food', 'Out for Delivery', 'Delivered']))
            ->sum('total');

        $totalCustomers = User::count();
        $totalReturns = $orders->where('statusRef.label', 'Returned')->count();
        $totalOrders = $orders->count();

        $ordersData = $orders->map(function ($o) {
            return [
                'id' => $o->id,
                'status' => $o->statusRef?->label,
                'price' => $o->total,
                'orderDate' => $o->order_date,
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
            'totalOrders' => $totalOrders,
            'totalRevenue' => $totalRevenue,
            'totalCustomers' => $totalCustomers,
            'totalReturns' => $totalReturns,
        ]);
    }
}
