<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Meal;
use App\Models\Ingredient;
use App\Models\DietType;
use App\Models\Allergen;

class MealController extends Controller
{
    public function index()
    {
        $meals = Meal::with(['mealType', 'dietTypes', 'allergens', 'ingredients'])->get();
        return response()->json($meals);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string',
            'calories'      => 'required|integer',
            'protein'       => 'nullable|numeric',
            'carbs'         => 'nullable|numeric',
            'fat'           => 'nullable|numeric',
            'prep_time'     => 'nullable|integer',
            'price'         => 'nullable|numeric',
            'image'         => 'nullable|string',
            'mealType_ID'   => 'nullable|integer|exists:meal_types,id',

            'ingredients'   => 'array',
            'ingredients.*' => 'string',

            'diet_types'    => 'array',
            'diet_types.*'  => 'integer|exists:diet_types,id',

            'allergens'     => 'array',
            'allergens.*'   => 'integer|exists:allergens,id'
        ]);

        $ingredientNames = $validated['ingredients'] ?? [];
        unset($validated['ingredients']);

        $dietTypeIds = $validated['diet_types'] ?? [];
        unset($validated['diet_types']);

        $allergenIds = $validated['allergens'] ?? [];
        unset($validated['allergens']);

        $meal = Meal::create($validated);

        if (!empty($ingredientNames)) {
            $ingredientIds = [];
            foreach ($ingredientNames as $name) {
                $ingredient = Ingredient::firstOrCreate(['name' => $name], [
                    'caloriesPer100g' => 0,
                    'proteinPer100g'  => 0,
                    'carbsPer100g'    => 0,
                    'fatPer100g'      => 0,
                ]);
                $ingredientIds[] = $ingredient->id;
            }
            $meal->ingredients()->sync($ingredientIds);
        }

        if (!empty($dietTypeIds)) {
            $meal->dietTypes()->sync($dietTypeIds);
        }

        if (!empty($allergenIds)) {
            $meal->allergens()->sync($allergenIds);
        }

        return response()->json($meal->load(['ingredients', 'dietTypes', 'allergens', 'mealType']), 201);
    }

    public function show($id)
    {
        $meal = Meal::with(['ingredients', 'allergens', 'mealType', 'dietTypes'])->findOrFail($id);

        return response()->json([
            'id'          => $meal->id,
            'name'        => $meal->name,
            'description' => $meal->description,
            'calories'    => $meal->calories,
            'protein'     => $meal->protein,
            'carbs'       => $meal->carbs,
            'fat'         => $meal->fat,
            'price'       => $meal->price,
            'prep_time'   => $meal->prep_time,
            'image'       => $meal->image,

            'mealType' => $meal->mealType
                ? ['id' => $meal->mealType->id, 'mealType' => $meal->mealType->mealType]
                : null,

            'dietTypes' => $meal->dietTypes->map(function ($d) {
                return ['id' => $d->id, 'dietType' => $d->dietType];
            })->toArray(),

            'ingredients' => $meal->ingredients->pluck('name')->toArray(),

            'allergens' => $meal->allergens->map(function ($a) {
                return ['id' => $a->id, 'allergen' => $a->allergen];
            })->toArray(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $meal = Meal::findOrFail($id);

        $validated = $request->validate([
            'name'          => 'sometimes|string|max:255',
            'description'   => 'nullable|string',
            'calories'      => 'sometimes|integer',
            'protein'       => 'nullable|numeric',
            'carbs'         => 'nullable|numeric',
            'fat'           => 'nullable|numeric',
            'prep_time'     => 'nullable|integer',
            'price'         => 'nullable|numeric',
            'image'         => 'nullable|string',
            'mealType_ID'   => 'nullable|integer|exists:meal_types,id',

            'ingredients'   => 'array',
            'ingredients.*' => 'string',

            'diet_types'    => 'array',
            'diet_types.*'  => 'integer|exists:diet_types,id',

            'allergens'     => 'array',
            'allergens.*'   => 'integer|exists:allergens,id'
        ]);

        if ($request->has('ingredients')) {
            $ingredientNames = $validated['ingredients'] ?? [];
            $ingredientIds = [];
            foreach ($ingredientNames as $name) {
                $ingredient = Ingredient::firstOrCreate(['name' => $name], [
                    'caloriesPer100g' => 0,
                    'proteinPer100g'  => 0,
                    'carbsPer100g'    => 0,
                    'fatPer100g'      => 0,
                ]);
                $ingredientIds[] = $ingredient->id;
            }
            $meal->ingredients()->sync($ingredientIds);
            unset($validated['ingredients']);
        }

        $meal->update($validated);

        if ($request->has('diet_types')) {
            $meal->dietTypes()->sync($request->input('diet_types', []));
        }

        if ($request->has('allergens')) {
            $meal->allergens()->sync($request->input('allergens', []));
        }

        return response()->json($meal->load(['ingredients', 'dietTypes', 'allergens', 'mealType']));
    }

    public function destroy($id)
    {
        $meal = Meal::findOrFail($id);
        $meal->ingredients()->detach();
        $meal->dietTypes()->detach();
        $meal->allergens()->detach();
        $meal->delete();

        return response()->json(['message' => 'Meal deleted successfully.']);
    }
}
