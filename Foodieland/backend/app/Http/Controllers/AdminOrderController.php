<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use Carbon\Carbon;

class AdminOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['user', 'statusRef', 'items.meal']);

        if ($request->has('status') && $request->status !== 'all') {
            $query->whereHas('statusRef', function ($q) use ($request) {
                $q->where('label', $request->status);
            });
        }

        if ($request->filled('date')) {
            $date = Carbon::parse($request->date)->toDateString();
            $query->whereDate('order_date', $date);
        }

        $orders = $query->with(['user', 'statusRef', 'items.meal'])
            ->latest('order_date')
            ->get()
            ->map(fn($o) => [
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
            ]);
        return response()->json($orders);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string',
        ]);

        $order = Order::findOrFail($id);

        $statusId = \App\Models\OrderStatus::where('label', $request->status)->value('id');
        if (!$statusId) {
            return response()->json(['message' => 'Invalid status'], 400);
        }

        $order->status_id = $statusId;
        $order->save();

        return response()->json([
            'message' => 'Order status updated.',
            'order' => $order->load(['user', 'statusRef', 'items.meal']),
        ]);
    }
}
