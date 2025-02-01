<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminCredentialsSeeder extends Seeder
{
    public function run()
    {
        DB::table('admin_credentials')->insert([
            'id' => 1,
            'admin_email' => 'admin@gmail.com',
            'admin_password' => Hash::make('admin')
        ]);
    }
}