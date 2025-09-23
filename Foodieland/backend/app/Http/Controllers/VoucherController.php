<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Voucher;
use Illuminate\Support\Facades\Auth;

class VoucherController extends Controller
{
    public function publicIndex(Request $request)
    {
        $subtotal = (float) $request->query('subtotal', 0);

        $vouchers = Voucher::query()
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->where(function ($q) {
                $q->whereNull('usage_limit')->orWhereColumn('used_count', '<', 'usage_limit');
            })
            ->get()
            ->map(function ($v) use ($subtotal) {
                return [
                    'id' => $v->id,
                    'code' => $v->code,
                    'title' => $v->description ?: $v->code,
                    'type' => 'percent',
                    'value' => (float) str_replace(',', '.', $v->discount_percent),
                    'minOrderValue' => $v->min_order_value !== null ? (float) $v->min_order_value : null,
                    'isEligible' => $v->min_order_value === null ? true : $subtotal >= (float) $v->min_order_value,
                    'start_date' => $v->start_date,
                    'end_date' => $v->end_date,
                ];
            });

        return response()->json($vouchers);
    }

    public function userVouchers(Request $request)
    {
        $user = $request->user();
        $subtotal = (float) $request->query('subtotal', 0);

        $vouchers = Voucher::query()
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->where(function ($q) use ($user) {
                $q->where('is_login_required', false)
                    ->orWhereHas('users', function ($uq) use ($user) {
                        $uq->where('users.UserID', $user->UserID);
                    });
            })
            ->where(function ($q) {
                $q->whereNull('usage_limit')
                    ->orWhereColumn('used_count', '<', 'usage_limit');
            })
            ->with(['users' => function ($uq) use ($user) {
                $uq->where('users.UserID', $user->UserID);
            }])
            ->get()
            ->map(function ($v) use ($subtotal) {
                $pivot = $v->users->first()?->pivot;

                $remaining = $v->usage_limit !== null
                    ? $v->usage_limit - $v->used_count
                    : null;

                $userRemaining = $pivot?->usage_limit !== null
                    ? $pivot->usage_limit - ($pivot->used_count ?? 0)
                    : null;

                return [
                    'id' => $v->id,
                    'code' => $v->code,
                    'title' => $v->description ?: $v->code,
                    'type' => 'percent',
                    'value' => (float) $v->discount_percent,
                    'minOrderValue' => $v->min_order_value !== null ? (float) $v->min_order_value : null,

                    'isEligible' => ($v->min_order_value === null || $subtotal >= (float) $v->min_order_value)
                        && ($remaining === null || $remaining > 0)
                        && ($userRemaining === null || $userRemaining > 0),

                    'remaining_uses' => $remaining,
                    'user_used_count' => $pivot?->used_count ?? 0,
                    'user_usage_limit' => $pivot?->usage_limit,
                    'user_remaining_uses' => $userRemaining,
                    'start_date' => $v->start_date,
                    'end_date' => $v->end_date,
                ];
            });

        return response()->json($vouchers);
    }

    public function index()
    {
        return response()->json(Voucher::orderByDesc('id')->get());
    }

    public function show($id)
    {
        $voucher = Voucher::find($id);
        if (!$voucher) {
            return response()->json(['message' => 'Voucher not found'], 404);
        }
        return response()->json($voucher);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:vouchers,code',
            'description' => 'nullable|string|max:255',
            'discount_percent' => 'required|numeric|min:0|max:100',
            'min_order_value' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'usage_limit' => 'nullable|integer|min:1',
            'is_login_required' => 'boolean',
            'status' => 'required|in:active,inactive,expired',
        ]);

        $voucher = Voucher::create($validated + ['used_count' => 0]);

        return response()->json($voucher, 201);
    }

    public function update(Request $request, $id)
    {
        $voucher = Voucher::find($id);
        if (!$voucher) {
            return response()->json(['message' => 'Voucher not found'], 404);
        }

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:vouchers,code,' . $voucher->id,
            'description' => 'nullable|string|max:255',
            'discount_percent' => 'required|numeric|min:0|max:100',
            'min_order_value' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'usage_limit' => 'nullable|integer|min:1',
            'is_login_required' => 'boolean',
            'status' => 'required|in:active,inactive,expired',
        ]);

        $voucher->update($validated);

        return response()->json($voucher);
    }

    public function destroy($id)
    {
        $voucher = Voucher::find($id);
        if (!$voucher) {
            return response()->json(['message' => 'Voucher not found'], 404);
        }

        $voucher->delete();

        return response()->json(['message' => 'Deleted']);
    }
    public function getUserVouchers(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $subtotal = (float) $request->query('subtotal', 0);

        // Lấy voucher active, theo điều kiện minOrderValue <= subtotal
        $vouchers = Voucher::where('status', 'active')
            ->where(function($q) use ($subtotal) {
                $q->whereNull('min_order_value')
                  ->orWhere('min_order_value', '<=', $subtotal);
            })
            ->get();

        return response()->json($vouchers);
    }

}
