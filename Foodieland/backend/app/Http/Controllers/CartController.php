<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\Meal;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $cartItems = Cart::with('meal')
            ->where('user_id', $userId)
            ->get();

        return response()->json($cartItems);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'meal_id'  => 'required|integer|exists:meals,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $userId = $request->user()->id;

        $existing = Cart::where('user_id', $userId)
                        ->where('meal_id', $validated['meal_id'])
                        ->first();

        if ($existing) {
            $existing->quantity += $validated['quantity'];
            $existing->save();

            return response()->json(
                $existing->load('meal'),
                200
            );
        }

        $cartItem = Cart::create([
            'user_id'  => $userId,
            'meal_id'  => $validated['meal_id'],
            'quantity' => $validated['quantity'],
        ]);

        return response()->json(
            $cartItem->load('meal'),
            201
        );
    }

    public function update(Request $request, $id)
    {
        $cartItem = Cart::where('id', $id)
                        ->where('user_id', $request->user()->id)
                        ->firstOrFail();

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem->quantity = $validated['quantity'];
        $cartItem->save();

        return response()->json($cartItem->load('meal'));
    }

    public function destroy(Request $request, $id)
    {
        $cartItem = Cart::where('id', $id)
                        ->where('user_id', $request->user()->id)
                        ->firstOrFail();

        $cartItem->delete();

        return response()->json(['message' => 'Item removed from cart']);
    }
}
