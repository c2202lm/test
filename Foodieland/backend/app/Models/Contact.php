<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperContact
 */
class Contact extends Model
{
    protected $fillable = [
        'name',
        'email',
        'subject',
        'enquiry_type',
        'message',
    ];
}
