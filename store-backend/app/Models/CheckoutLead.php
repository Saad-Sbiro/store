<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;

class CheckoutLead extends Model
{
    use HasFactory, Prunable;

    protected $fillable = [
        'token',
        'order_id',
        'status',
        'full_name',
        'phone',
        'address',
        'city',
        'items',
        'subtotal',
        'total',
        'payment_method',
        'consented_at',
        'last_activity_at',
        'abandoned_at',
        'notified_at',
    ];

    protected function casts(): array
    {
        return [
            'items' => 'array',
            'subtotal' => 'decimal:2',
            'total' => 'decimal:2',
            'consented_at' => 'datetime',
            'last_activity_at' => 'datetime',
            'abandoned_at' => 'datetime',
            'notified_at' => 'datetime',
        ];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function prunable()
    {
        return static::query()
            ->where(function ($query) {
                $query->where('status', 'converted')
                    ->where('updated_at', '<', now()->subDays(7));
            })
            ->orWhere(function ($query) {
                $query->where('status', '!=', 'converted')
                    ->where('updated_at', '<', now()->subDays(30));
            });
    }
}
