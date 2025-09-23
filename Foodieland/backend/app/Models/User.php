<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @mixin IdeHelperUser
 */

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'UserID';
    public $incrementing = true;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'height',
        'weight',
        'dateOfBirth',
        'gender',
    ];

    public function feedbacks()
    {
        return $this->hasMany(Feedback::class, 'User_ID');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function vouchers()
    {
        return $this->belongsToMany(Voucher::class, 'voucher_users');
    }

    protected $hidden = [
        'password',
        'remember_token',
    ];
}
