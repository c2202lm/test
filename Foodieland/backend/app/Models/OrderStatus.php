<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperOrderStatus
 */
class OrderStatus extends Model
{
    protected $fillable = [
        'code',
        'label',
        'color',
        'icon',
        'order_number',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
