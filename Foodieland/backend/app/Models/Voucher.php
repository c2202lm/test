<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperVoucher
 */
class Voucher extends Model
{
    protected $fillable = [
        'code',
        'description',
        'discount_percent',
        'min_order_value',
        'start_date',
        'end_date',
        'usage_limit',
        'used_count',
        'is_login_required',
        'status'
    ];

    // Quan hệ nhiều-nhiều với User (voucher_users)
    public function users()
    {
        return $this->belongsToMany(User::class, 'voucher_users', 'voucher_id', 'user_id', 'id', 'UserID');
    }

    // Quan hệ nhiều-nhiều với Meal (voucher_meals)
    public function meals()
    {
        return $this->belongsToMany(Meal::class, 'voucher_meals');
    }

    public function orders()
    {
        return $this->belongsToMany(Order::class, 'voucher_orders', 'voucher_id', 'order_id');
    }
}
