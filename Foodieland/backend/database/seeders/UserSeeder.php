<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;


class UserSeeder extends Seeder
{

    public function run(): void
    {
        User::create([
            'name' => 'admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('admin123'),
            'phone' => '0000000000',
            'gender' => 'other',
            'dateOfBirth' => '2000-01-01',
            'Height' => 170.00,
            'Weight' => 70.00,
            'role' => 'admin'
        ]);

        User::create([
            'name' => 'user',
            'email' => 'user@example.com',
            'password' => bcrypt('user123'),
            'phone' => '1111111111',
            'gender' => 'other',
            'dateOfBirth' => '2000-01-01',
            'Height' => 170.00,
            'Weight' => 70.00,
            'role' => 'user'
        ]);
    }
}
