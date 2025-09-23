<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperDietType
 */
class DietType extends Model
{
    public function meals()
    {
        return $this->belongsToMany(Meal::class, 'diet_type_meal', 'diet_type_id', 'meal_id');
    }
}
