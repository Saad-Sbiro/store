<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppMessage extends Model
{
    protected $table = 'whatsapp_messages';

    protected $fillable = [
        'message_id',
        'contact_wa_id',
        'contact_name',
        'direction',
        'type',
        'body',
        'status',
        'error',
        'metadata',
        'whatsapp_created_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'whatsapp_created_at' => 'datetime',
        ];
    }
}
