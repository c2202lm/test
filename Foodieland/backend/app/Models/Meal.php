<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperMeal
 */
class Meal extends Model
{
    use HasFactory;

    protected $with = ['mealType', 'dietTypes', 'allergens', 'ingredients'];

    protected $fillable = [
        'name',
        'description',
        'calories',
        'protein',
        'carbs',
        'fat',
        'prep_time',
        'price',
        'image',
        'mealType_ID',
        'created_by'
    ];

    public function ingredients()
    {
        return $this->belongsToMany(Ingredient::class, 'ingredient_meal', 'meal_id', 'ingredient_id');
    }

    public function allergens()
    {
        return $this->belongsToMany(Allergen::class, 'allergen_meal', 'meal_id', 'allergen_id');
    }

    public function mealType()
    {
        return $this->belongsTo(MealType::class, 'mealType_ID', 'id');
    }

    public function dietTypes()
    {
        return $this->belongsToMany(DietType::class, 'diet_type_meal', 'meal_id', 'diet_type_id');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'meal_id');
    }

    public function vouchers()
    {
        return $this->belongsToMany(Voucher::class, 'voucher_meals');
    }
    public function orders()
    {
        return $this->belongsToMany(Order::class, 'order_meal')->withPivot('quantity', 'price')->withTimestamps();
    }
}
