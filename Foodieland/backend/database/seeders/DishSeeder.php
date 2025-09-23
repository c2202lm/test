<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use App\Models\Meal;
use App\Models\Ingredient;
use App\Models\DietType;
use App\Models\MealType;
use App\Models\Allergen;

class DishSeeder extends Seeder
{
    public function run()
    {
        $json = File::get(database_path('data/DishesData.json'));
        $dishes = json_decode($json, true);

        foreach ($dishes as $dish) {
            // Meal Type
            $mealType = MealType::firstOrCreate([
                'mealType' => ucfirst($dish['category'])
            ]);

            // Allergen
            $allergen = Allergen::firstOrCreate([
                'allergen' => 'None'
            ]);

            // Prep time: lấy số phút từ chuỗi
            $prepTime = (int) preg_replace('/\D/', '', $dish['time']);

            // Tạo meal (không còn dietType_ID vì dùng pivot)
            $meal = Meal::create([
                'name' => $dish['title'],
                'description' => $dish['description'],
                'calories' => $dish['calories'],
                'protein' => $dish['protein'],
                'carbs' => $dish['carb'],
                'fat' => $dish['fats'],
                'price' => $dish['price'],
                'prep_time' => $prepTime,
                'image' => $dish['image'] ?? null,
                'mealType_ID' => $mealType->id,
            ]);

            // Ingredients
            foreach ($dish['ingredients'] as $ingredientData) {
                $ingredient = Ingredient::firstOrCreate(
                    ['name' => strtolower($ingredientData['name'])],
                    [
                        'caloriesPer100g' => $ingredientData['caloriesPer100g'] ?? 0,
                        'proteinPer100g' => $ingredientData['proteinPer100g'] ?? 0,
                        'carbsPer100g' => $ingredientData['carbsPer100g'] ?? 0,
                        'fatPer100g' => $ingredientData['fatPer100g'] ?? 0
                    ]
                );
                $meal->ingredients()->attach($ingredient->id);
            }

            // Diet Types (nhiều-many)
            if (isset($dish['dietTypes']) && is_array($dish['dietTypes'])) {
                $dietTypeIds = [];
                foreach ($dish['dietTypes'] as $dietTypeName) {
                    $dietType = DietType::firstOrCreate([
                        'dietType' => trim($dietTypeName)
                    ]);
                    $dietTypeIds[] = $dietType->id;
                }
                $meal->dietTypes()->sync($dietTypeIds);
            }

            // Allergen (nhiều-many)
            $allergenNames = $dish['allergens'] ?? ['None'];
            $allergenIds = [];
            foreach ($allergenNames as $allergenName) {
                $allergen = Allergen::firstOrCreate(['allergen' => trim($allergenName)]);
                $allergenIds[] = $allergen->id;
            }
            $meal->allergens()->sync($allergenIds);
        }
    }
}
