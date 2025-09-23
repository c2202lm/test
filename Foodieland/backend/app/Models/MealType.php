<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperMealType
 */
class MealType extends Model
{
    public function meals() {
        return $this->hasMany(Meal::class, 'MealType_ID');
    }
}
