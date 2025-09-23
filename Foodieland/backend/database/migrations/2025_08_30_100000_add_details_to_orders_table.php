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
        Schema::table('orders', function (Blueprint $table) {
            $table->text('address')->nullable()->after('order_date');

            // Thay vì recipient_info (json), tách riêng 3 cột
            $table->string('recipient_name')->nullable()->after('address');
            $table->string('recipient_phone')->nullable()->after('recipient_name');
            $table->string('recipient_email')->nullable()->after('recipient_phone');

            $table->string('payment_method')->nullable()->after('recipient_email');
            $table->text('note')->nullable()->after('payment_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'address',
                'recipient_name',
                'recipient_phone',
                'recipient_email',
                'payment_method',
                'note'
            ]);
        });
    }
};