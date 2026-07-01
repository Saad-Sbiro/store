<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (! DB::table('users')->where('email', 'admin@zadi.ma')->exists()) {
            DB::table('users')
                ->whereIn('email', ['admin@voidstore.com', 'admin@cutportal.com'])
                ->update(['email' => 'admin@zadi.ma']);
        }
    }

    public function down(): void
    {
        if (! DB::table('users')->where('email', 'admin@voidstore.com')->exists()) {
            DB::table('users')
                ->where('email', 'admin@zadi.ma')
                ->update(['email' => 'admin@voidstore.com']);
        }
    }
};
