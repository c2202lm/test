<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OrderStatus;
use Illuminate\Support\Facades\DB;

// class OrderStatusSeeder extends Seeder
// {
//     public function run()
//     {
//         $statuses = [
//             [
//                 'code' => 'pending',
//                 'label' => 'Pending Confirmation',
//                 'order_number' => 1,
//                 'color' => '#ffc107', // vàng
//             ],
//             [
//                 'code' => 'preparing',
//                 'label' => 'Preparing Food',
//                 'order_number' => 2,
//                 'color' => '#17a2b8', // xanh dương
//             ],
//             [
//                 'code' => 'delivering',
//                 'label' => 'Out for Delivery',
//                 'order_number' => 3,
//                 'color' => '#007bff', // xanh đậm
//             ],
//             [
//                 'code' => 'delivered',
//                 'label' => 'Delivered',
//                 'order_number' => 4,
//                 'color' => '#28a745', // xanh lá
//             ],
//         ];

//         foreach ($statuses as $status) {
//             OrderStatus::updateOrCreate(
//                 ['code' => $status['code']], 
//                 $status
//             );
//         }
//     }
// }


class OrderStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('order_statuses')->insert([
            [
                'id' => 1,
                'code' => 'pending',
                'label' => 'Pending Confirmation',
                'color' => 'yellow',
                'icon' => 'hourglass',
                'order_number' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'code' => 'processing',
                'label' => 'Processing',
                'color' => 'blue',
                'icon' => 'cog',
                'order_number' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'code' => 'shipped',
                'label' => 'Out for Delivery',
                'color' => 'purple',
                'icon' => 'truck',
                'order_number' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'code' => 'delivered',
                'label' => 'Delivered',
                'color' => 'green',
                'icon' => 'check',
                'order_number' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'code' => 'cancelled',
                'label' => 'Cancelled',
                'color' => 'red',
                'icon' => 'times',
                'order_number' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 6,
                'code' => 'refunded',
                'label' => 'Refunded',
                'color' => 'gray',
                'icon' => 'undo',
                'order_number' => 6,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}

