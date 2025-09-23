<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperAllergen
 */
class Allergen extends Model
{
    public function meals()
    {
        return $this->belongsToMany(Meal::class, 'allergen_meal', 'allergen_id', 'meal_id');
    }
}
