<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            $table->string('message_id')->unique();
            $table->string('contact_wa_id')->index();
            $table->string('contact_name')->nullable();
            $table->enum('direction', ['inbound', 'outbound']);
            $table->string('type')->default('text');
            $table->text('body')->nullable();
            $table->string('status')->default('received')->index();
            $table->text('error')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('whatsapp_created_at')->nullable();
            $table->timestamps();

            $table->index(['contact_wa_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_messages');
    }
};
