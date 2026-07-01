<?php

namespace App\Services;

use App\Models\CheckoutLead;
use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class TelegramOrderNotifier
{
    public function isConfigured(): bool
    {
        return (bool) config('services.telegram.enabled')
            && filled(config('services.telegram.bot_token'))
            && filled(config('services.telegram.chat_id'));
    }

    public function sendNewOrder(Order $order): bool
    {
        return $this->send($this->formatOrderMessage($order));
    }

    public function sendCheckoutLead(CheckoutLead $lead): bool
    {
        return $this->send($this->formatCheckoutLeadMessage($lead));
    }

    public function sendTestMessage(): bool
    {
        return $this->send(
            '<b>Telegram workflow connected</b>'
            ."\n\nYour store can now send new order notifications to this chat."
        );
    }

    public function recentChats(): array
    {
        $token = config('services.telegram.bot_token');

        if (blank($token)) {
            return [];
        }

        try {
            $response = Http::acceptJson()
                ->timeout((int) config('services.telegram.timeout', 5))
                ->get($this->endpoint($token, 'getUpdates'));

            if (! $response->successful() || ! $response->json('ok')) {
                return [];
            }

            return collect($response->json('result', []))
                ->map(function (array $update) {
                    $chat = data_get($update, 'message.chat')
                        ?? data_get($update, 'channel_post.chat')
                        ?? data_get($update, 'my_chat_member.chat');

                    if (! is_array($chat) || ! isset($chat['id'])) {
                        return null;
                    }

                    return [
                        'id' => (string) $chat['id'],
                        'type' => $chat['type'] ?? 'unknown',
                        'name' => $chat['title']
                            ?? trim(($chat['first_name'] ?? '').' '.($chat['last_name'] ?? ''))
                            ?: ($chat['username'] ?? 'Unknown chat'),
                    ];
                })
                ->filter()
                ->unique('id')
                ->values()
                ->all();
        } catch (Throwable $exception) {
            Log::warning('Telegram chat discovery failed.', [
                'exception' => $exception::class,
            ]);

            return [];
        }
    }

    private function send(string $text): bool
    {
        if (! $this->isConfigured()) {
            return false;
        }

        try {
            $response = Http::acceptJson()
                ->asJson()
                ->timeout((int) config('services.telegram.timeout', 5))
                ->retry(2, 250)
                ->post(
                    $this->endpoint(config('services.telegram.bot_token'), 'sendMessage'),
                    [
                        'chat_id' => config('services.telegram.chat_id'),
                        'text' => Str::limit($text, 3900, "\n..."),
                        'parse_mode' => 'HTML',
                        'disable_web_page_preview' => true,
                    ]
                );

            if ($response->successful() && $response->json('ok')) {
                return true;
            }

            Log::warning('Telegram rejected an order notification.', [
                'status' => $response->status(),
            ]);
        } catch (Throwable $exception) {
            Log::warning('Telegram order notification failed.', [
                'exception' => $exception::class,
            ]);
        }

        return false;
    }

    private function formatOrderMessage(Order $order): string
    {
        $address = $order->shipping_address ?? [];
        $customer = $this->escape($address['name'] ?? 'Unknown customer');
        $phone = $this->escape($address['phone'] ?? 'Not provided');
        $street = $this->escape($address['street'] ?? 'Not provided');
        $city = $this->escape($address['city'] ?? '');
        $country = $this->escape($address['country'] ?? '');
        $location = implode(', ', array_filter([$street, $city, $country]));

        $items = $order->items
            ->take(20)
            ->map(function ($item) {
                $details = array_filter([
                    $item->size ? 'Size: '.$this->escape($item->size) : null,
                    $item->color ? 'Color: '.$this->escape($item->color) : null,
                ]);
                $suffix = $details ? ' ('.implode(', ', $details).')' : '';

                return sprintf(
                    '- %dx %s%s',
                    $item->quantity,
                    $this->escape($item->product_name),
                    $suffix
                );
            })
            ->implode("\n");

        if ($order->items->count() > 20) {
            $items .= "\n- ...and ".($order->items->count() - 20).' more item(s)';
        }

        return implode("\n", [
            '<b>New order received</b>',
            '',
            '<b>Order:</b> '.$this->escape($order->order_number),
            '<b>Customer:</b> '.$customer,
            '<b>Phone:</b> '.$phone,
            '<b>Address:</b> '.$location,
            '',
            '<b>Items</b>',
            $items ?: '- No items',
            '',
            '<b>Total:</b> '.number_format((float) $order->total, 2).' MAD',
            '<b>Payment:</b> '.$this->escape($order->payment_method ?? 'Not provided'),
            '<b>Status:</b> '.$this->escape($order->status),
        ]);
    }

    private function formatCheckoutLeadMessage(CheckoutLead $lead): string
    {
        $items = collect($lead->items)
            ->take(20)
            ->map(function (array $item) {
                $details = array_filter([
                    filled($item['size'] ?? null) ? 'Size: '.$this->escape($item['size']) : null,
                    filled($item['color'] ?? null) ? 'Color: '.$this->escape($item['color']) : null,
                ]);
                $suffix = $details ? ' ('.implode(', ', $details).')' : '';

                return sprintf(
                    '- %dx %s%s',
                    $item['quantity'],
                    $this->escape($item['product_name']),
                    $suffix
                );
            })
            ->implode("\n");

        $location = implode(', ', array_filter([
            $this->escape($lead->address),
            $this->escape($lead->city),
        ]));

        return implode("\n", [
            '<b>Checkout not submitted</b>',
            '',
            '<b>Lead:</b> LEAD-'.$lead->id,
            '<b>Customer:</b> '.$this->escape($lead->full_name ?: 'Not provided'),
            '<b>Phone:</b> '.$this->escape($lead->phone),
            '<b>Address:</b> '.($location ?: 'Not provided'),
            '',
            '<b>Items</b>',
            $items ?: '- No items',
            '',
            '<b>Estimated total:</b> '.number_format((float) $lead->total, 2).' MAD',
            '<b>Payment:</b> '.$this->escape($lead->payment_method ?: 'Not selected'),
            '<b>Tag:</b> NOT SUBMITTED MANUALLY',
        ]);
    }

    private function endpoint(string $token, string $method): string
    {
        return "https://api.telegram.org/bot{$token}/{$method}";
    }

    private function escape(mixed $value): string
    {
        return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}
