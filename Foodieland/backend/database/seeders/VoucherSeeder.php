<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Meal;
use App\Models\Order;
use App\Models\Voucher;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class VoucherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo Voucher 1
        $voucher1 = Voucher::create([
            'code' => 'SAVE10',
            'description' => 'Giảm 10% cho đơn hàng từ 15$ trở lên, tối đa 10$',
            'discount_percent' => 10,
            'min_order_value' => 15,
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addMonth(),
            'usage_limit' => null,
            'used_count' => 0,
            'is_login_required' => true,
            'status' => 'active',
        ]);

        // Tạo Voucher 2
        $voucher2 = Voucher::create([
            'code' => 'SAVE20',
            'description' => 'Giảm 20% cho đơn hàng',
            'discount_percent' => 20,
            'min_order_value' => null,
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addMonth(),
            'usage_limit' => null,
            'used_count' => 0,
            'is_login_required' => true,
            'status' => 'active',
        ]);

        // --- Gán pivot table ---

        // Gán tất cả users cho voucher1
        $voucher1->users()->attach(User::pluck('UserID')->toArray());

        // Gán một số meals cho voucher1
        $voucher1->meals()->attach(Meal::pluck('id')->take(3)->toArray());

        // Gán một số orders cho voucher1
        $voucher1->orders()->attach(Order::pluck('id')->take(2)->toArray());

        // Gán tất cả users cho voucher2
        $voucher2->users()->attach(User::pluck('UserID')->toArray());

        // Gán một số meals cho voucher2
        $voucher2->meals()->attach(Meal::pluck('id')->take(2)->toArray());

        // Gán một số orders cho voucher2
        $voucher2->orders()->attach(Order::pluck('id')->take(1)->toArray());
    }
}
