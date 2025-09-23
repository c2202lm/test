<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DietType;

class DietTypeController extends Controller
{
    public function index()
    {
        return response()->json(DietType::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'dietType' => 'required|string|max:255'
        ]);

        $dietType = DietType::create($validated);

        return response()->json($dietType, 201);
    }

    public function show($id)
    {
        $dietType = DietType::findOrFail($id);
        return response()->json($dietType);
    }

    public function update(Request $request, $id)
    {
        $dietType = DietType::findOrFail($id);

        $validated = $request->validate([
            'dietType' => 'required|string|max:255'
        ]);

        $dietType->update($validated);

        return response()->json($dietType);
    }

    public function destroy($id)
    {
        $dietType = DietType::findOrFail($id);
        $dietType->delete();

        return response()->json(['message' => 'Diet type deleted successfully']);
    }
}
