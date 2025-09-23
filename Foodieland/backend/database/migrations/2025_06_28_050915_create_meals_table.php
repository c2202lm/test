<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meals', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('calories');
            $table->decimal('protein', 5, 2)->default(0);
            $table->decimal('carbs', 5, 2)->default(0);
            $table->decimal('fat', 5, 2)->default(0);
            $table->decimal('price', 6, 2)->default(0);
            $table->integer('prep_time')->default(0);
            $table->string('image')->nullable();
            $table->foreignId('mealType_ID')->constrained('meal_types' )->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meals');
    }
};
