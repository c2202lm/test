<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('carts', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id');
        $table->unsignedBigInteger('meal_id');
        $table->integer('quantity')->default(1);
        $table->timestamps();

        // Khóa ngoại liên kết với UserID (vì bạn không đặt là 'id')
        $table->foreign('user_id')->references('UserID')->on('users')->onDelete('cascade');

        // Khóa ngoại meal
        $table->foreign('meal_id')->references('id')->on('meals')->onDelete('cascade');
    });

}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
