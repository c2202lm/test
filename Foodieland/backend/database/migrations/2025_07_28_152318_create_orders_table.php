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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            // Tham chiếu tới users(UserID)
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')
                ->references('UserID')   // đúng tên cột trong users
                ->on('users')
                ->onDelete('cascade');

            // Tham chiếu tới order_statuses(id)
            $table->foreignId('status_id')
                ->constrained('order_statuses')
                ->onDelete('cascade');

            $table->decimal('total', 10, 2);
            $table->decimal('discount_total', 10, 2)->default(0);
            $table->dateTime('order_date');
            $table->timestamps();
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
