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
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->text('description')->nullable();
            $table->decimal('discount_percent', 5, 2); // giảm theo phần trăm
            $table->decimal('min_order_value', 10, 2)->nullable();
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->unsignedInteger('usage_limit')->nullable(); // tổng số lượt đc dùng
            $table->unsignedInteger('used_count')->default(0); // số lượt đã dùng
            $table->boolean('is_login_required')->default(true); // kiểm tra xem đăng nhập chưa khi dùng
            $table->enum('status', ['active', 'inactive', 'expired'])->default('active'); // trạng thái voucher
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
