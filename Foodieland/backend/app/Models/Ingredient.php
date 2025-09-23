<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperIngredient
 */
class Ingredient extends Model
{
    public function meals()
    {
        return $this->belongsToMany(Meal::class, 'ingredient_meal', 'MealID');
    }
}
