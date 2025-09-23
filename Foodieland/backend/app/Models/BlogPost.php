<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperBlogPost
 */
class BlogPost extends Model
{
    public function user() {
        return $this->belongsTo(User::class, 'User_ID');
    }
}
