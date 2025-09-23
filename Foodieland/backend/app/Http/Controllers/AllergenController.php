<?php

namespace App\Http\Controllers;

use App\Models\Allergen;

class AllergenController extends Controller
{
    public function index()
    {
        return Allergen::all();
    }
}
