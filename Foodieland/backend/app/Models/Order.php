<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        // 'user_id',
        // 'status_id',
        // 'total',
        // 'order_date',
        // 'discount_total',
        // 'address',
        // 'recipient_info',
        // 'payment_method',
        // 'note',
        'user_id',
        'status_id',
        'total',
        'order_date',
        'discount_total',
        'address',
        'recipient_name',   
        'recipient_phone',  
        'recipient_email', 
        'payment_method',
        'note',
    ];

    protected $casts = [
        'order_date' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    public function status()
    {
        return $this->belongsTo(OrderStatus::class);
    }

    public function statusRef()
    {
        return $this->belongsTo(\App\Models\OrderStatus::class, 'status_id');
    }

    public function items()
    {
        return $this->hasMany(\App\Models\OrderItem::class, 'order_id');
    }

    public function toArray()
    {
        $arr = parent::toArray();
        $arr['orderDate'] = $this->order_date?->toISOString();
        return $arr;
    }

    public function meals()
    {
        return $this->belongsToMany(Meal::class, 'order_meal')->withPivot('quantity', 'price')->withTimestamps();
    }

    public function vouchers()
    {
        return $this->belongsToMany(Voucher::class, 'voucher_orders', 'order_id', 'voucher_id');
    }
}