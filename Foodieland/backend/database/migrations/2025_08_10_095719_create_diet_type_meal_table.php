<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diet_type_meal', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meal_id')->constrained('meals')->onDelete('cascade');
            $table->foreignId('diet_type_id')->constrained('diet_types')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['meal_id', 'diet_type_id']); // tránh trùng
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diet_type_meal');
    }
};
