<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Meal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $orders = Order::where('user_id', $user->UserID)
            ->with([
                'items.meal.dietTypes', // Tải sẵn các quan hệ để tối ưu
                'statusRef'
            ])
            ->latest('order_date') // Sắp xếp đơn hàng mới nhất lên đầu
            ->get();

        // Chuyển đổi chuỗi JSON của recipient_info thành object
        $orders->transform(function ($order) {
            if (is_string($order->recipient_info)) {
                $order->recipient_info = json_decode($order->recipient_info);
            }
            return $order;
        });

        return response()->json($orders);
    }

    public function placeOrder(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.meal_id' => 'required|integer|exists:meals,id',
            'items.*.quantity' => 'required|integer|min:1',
            'address' => 'required|string',
            'recipient' => 'required|array',
            'recipient.name' => 'required|string',
            'recipient.phone' => 'required|string',
            'recipient.email' => 'required|email',
            'payment_method' => 'required|string',
            'note' => 'nullable|string',
            'voucher_id' => 'nullable|integer|exists:vouchers,id',
        ]);

        DB::beginTransaction();
        try {
            $statusId = \App\Models\OrderStatus::where('code', 'pending')->value('id');
            if (!$statusId) {
                return response()->json(['message' => 'Default order status not found'], 500);
            }

            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $meal = Meal::find($item['meal_id']);
                if ($meal) {
                    $subtotal += $meal->price * $item['quantity'];
                }
            }

            $discount = 0;
            $voucher = null;
            if (!empty($validated['voucher_id'])) {
                $voucher = \App\Models\Voucher::find($validated['voucher_id']);
                if ($voucher && $subtotal >= $voucher->min_order_value) {
                    if ($voucher->type === 'percent') {
                        $calculatedDiscount = ($subtotal * $voucher->value) / 100;
                        $discount = isset($voucher->max_discount) ? min($calculatedDiscount, $voucher->max_discount) : $calculatedDiscount;
                    } elseif ($voucher->type === 'fixed') {
                        $discount = $voucher->value;
                    }
                    // Ensure discount does not exceed subtotal
                    $discount = min($discount, $subtotal);
                }
            }

            $total = $subtotal - $discount;

            $order = Order::create([
                // 'user_id' => $user->UserID, // FIX: Use the correct primary key 'UserID' instead of 'id'
                // 'status_id' => $statusId,
                // 'total' => $total,
                // 'discount_total' => $discount,
                // 'order_date' => now(),
                // 'address' => $validated['address'],
                // 'recipient_info' => json_encode($validated['recipient']),
                // 'payment_method' => $validated['payment_method'],
                // 'note' => $validated['note'] ?? null,
                'user_id'         => $user->UserID,
                'status_id'       => $statusId,
                'total'           => $total,
                'discount_total'  => $discount,
                'order_date'      => now(),
                'address'         => $validated['address'],
                'recipient_name'  => $validated['recipient']['name'] ?? null,
                'recipient_phone' => $validated['recipient']['phone'] ?? null,
                'recipient_email' => $validated['recipient']['email'] ?? null,
                'payment_method'  => $validated['payment_method'],
                'note'            => $validated['note'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $meal = Meal::find($item['meal_id']);
                $lineTotal = $meal->price * $item['quantity'];
                OrderItem::create([
                    'order_id' => $order->id,
                    'meal_id'  => $meal->id,
                    'quantity' => $item['quantity'],
                    'price'    => $meal->price,
                    'subtotal' => $lineTotal,
                ]);
            }

            if ($voucher) {
                $order->vouchers()->attach($voucher->id);
                $voucher->increment('used_count');
            }

            DB::commit();

            return response()->json([
                'message' => 'Order placed successfully',
                'order'   => $order->load(['items.meal', 'user', 'vouchers']),
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Order placement failed',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.meal_id' => 'required|integer|exists:meals,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        $statusId = \App\Models\OrderStatus::where('label', 'Pending Confirmation')->value('id');
        if (!$statusId) {
            return response()->json(['message' => 'Status not found'], 500);
        }
        $order = Order::create([
            'user_id' => $user->id,
            'status_id' => $statusId,
            'total' => 0,
            'order_date' => now(),
        ]);

        $total = 0;
        foreach ($data['items'] as $it) {
            $meal = Meal::find($it['meal_id']);
            $price = $meal->price ?? 0;
            OrderItem::create([
                'order_id' => $order->id,
                'meal_id' => $meal->id,
                'quantity' => $it['quantity'],
                'price' => $price,
                'subtotal' => $price * $it['quantity'],
            ]);
            $total += $price * $it['quantity'];
        }
        $order->total = $total;
        $order->save();

        return response()->json([
            'message' => 'Order created',
            'order' => $order->load('items.meal')
        ], 201);
    }

    public function cancel(Request $request, Order $order)
    {
        $user = $request->user();
        if ($order->user_id !== $user->UserID) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Tìm trạng thái "Cancelled"
        $cancelStatus = \App\Models\OrderStatus::where('label', 'Cancelled')->first();
        if (!$cancelStatus) {
            return response()->json(['message' => 'Cancelled status not found'], 500);
        }

        $order->status_id = $cancelStatus->id;
        $order->save();

        return response()->json(['message' => 'Order cancelled successfully', 'order' => $order]);
    }
}