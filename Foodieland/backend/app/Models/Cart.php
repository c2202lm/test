<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @mixin IdeHelperCart
 */
class Cart extends Model
{
    use HasFactory;

    protected $table = 'carts';

    protected $fillable = [
        'user_id',
        'meal_id',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    // Quan hệ
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function meal()
    {
        return $this->belongsTo(Meal::class, 'meal_id');
    }

    // Subtotal (price * quantity) – meal.price có thể null
    public function getSubtotalAttribute()
    {
        return ($this->meal->price ?? 0) * $this->quantity;
    }

    // Scope lấy giỏ của user
    public function scopeOfUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}