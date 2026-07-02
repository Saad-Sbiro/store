<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\WhatsAppMessage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class WhatsAppAiResponder
{
    public function replyTo(WhatsAppMessage $incoming): string
    {
        if ($incoming->type !== 'text' || blank($incoming->body)) {
            return 'حالياً نقدر نجاوبك على الرسائل المكتوبة فقط. كتب ليا سؤالك وسنعاونك بكل سرور.';
        }

        $apiKey = (string) config('services.nvidia.api_key');

        if ($apiKey === '') {
            Log::warning('WhatsApp AI reply used fallback because NVIDIA_API_KEY is missing.');

            return $this->fallbackReply();
        }

        try {
            $response = Http::withToken($apiKey)
                ->acceptJson()
                ->asJson()
                ->timeout((int) config('services.nvidia.timeout', 90))
                ->retry(2, 750)
                ->post(config('services.nvidia.endpoint'), [
                    'model' => config('services.nvidia.model'),
                    'messages' => $this->messagesFor($incoming),
                    'temperature' => 0.35,
                    'top_p' => 0.8,
                    'max_tokens' => 550,
                    'stream' => false,
                ]);

            if ($response->failed()) {
                Log::warning('NVIDIA rejected a WhatsApp AI request.', [
                    'status' => $response->status(),
                    'message_id' => $incoming->message_id,
                ]);

                return $this->fallbackReply();
            }

            $content = trim((string) data_get($response->json(), 'choices.0.message.content'));

            return $content === ''
                ? $this->fallbackReply()
                : Str::limit($content, 3500, '…');
        } catch (Throwable $exception) {
            Log::error('NVIDIA WhatsApp reply failed.', [
                'message_id' => $incoming->message_id,
                'error' => $exception->getMessage(),
            ]);

            return $this->fallbackReply();
        }
    }

    private function messagesFor(WhatsAppMessage $incoming): array
    {
        $history = WhatsAppMessage::query()
            ->where('contact_wa_id', $incoming->contact_wa_id)
            ->where('type', 'text')
            ->whereNotNull('body')
            ->latest('id')
            ->limit(10)
            ->get()
            ->reverse()
            ->map(fn (WhatsAppMessage $message) => [
                'role' => $message->direction === 'inbound' ? 'user' : 'assistant',
                'content' => $message->body,
            ])
            ->values()
            ->all();

        return [
            ['role' => 'system', 'content' => $this->systemPrompt($incoming)],
            ...$history,
        ];
    }

    private function systemPrompt(WhatsAppMessage $incoming): string
    {
        $catalog = Product::query()
            ->where('is_active', true)
            ->with('category:id,name')
            ->orderByDesc('is_featured')
            ->limit(40)
            ->get()
            ->map(fn (Product $product) => [
                'name' => $product->name_ar ?: $product->name,
                'price_mad' => (float) $product->price,
                'old_price_mad' => $product->original_price ? (float) $product->original_price : null,
                'stock' => $product->stock,
                'category' => $product->category?->name,
                'description' => Str::limit(
                    (string) ($product->description_ar ?: $product->description),
                    280
                ),
                'sizes' => $product->sizes,
                'colors' => $product->colors,
            ])
            ->values();

        $orderContext = $this->verifiedOrderContext($incoming);

        return implode("\n", [
            'أنت مساعد متجر زادي على واتساب.',
            'جاوب بالعربية المغربية الواضحة والودودة، وباختصار مناسب لرسالة واتساب.',
            'يمكنك استعمال العربية الفصحى البسيطة عندما تكون أوضح للعميل.',
            'استعمل فقط معلومات المنتجات والطلب الموثق الموجودة أسفل هذه التعليمات.',
            'لا تخترع أسعاراً أو تخفيضات أو مخزوناً أو مواعيد توصيل أو سياسات غير موجودة.',
            'الأسعار بالدرهم المغربي. الدفع عند الاستلام متاح والتوصيل داخل المغرب.',
            'إذا لم تتوفر المعلومة، قل بوضوح إنك تحتاج تدخل فريق زادي.',
            'لا تطلب كلمة مرور أو رمز تحقق أو معلومات بنكية.',
            'لا تعرض أي بيانات طلب إلا إذا ظهر سياق طلب موثق أدناه.',
            'لا تذكر أنك نموذج ذكاء اصطناعي إلا إذا سألك العميل مباشرة.',
            '',
            'المنتجات المتوفرة:',
            $catalog->toJson(JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            '',
            'سياق الطلب الموثق:',
            $orderContext ?: 'لا يوجد طلب موثق. اطلب من العميل رقم الطلب إذا كان يسأل عن طلبه.',
        ]);
    }

    private function verifiedOrderContext(WhatsAppMessage $incoming): ?string
    {
        if (! preg_match('/VS-\d{8}-[A-Z0-9]+/i', (string) $incoming->body, $matches)) {
            return null;
        }

        $order = Order::query()
            ->with('items:id,order_id,product_name,quantity')
            ->where('order_number', strtoupper($matches[0]))
            ->first();

        if (! $order) {
            return 'رقم الطلب المذكور غير موجود.';
        }

        $orderPhone = data_get($order->shipping_address, 'phone');

        if (! $this->samePhone((string) $orderPhone, $incoming->contact_wa_id)) {
            return 'رقم الطلب موجود، لكن رقم واتساب لا يطابق رقم الهاتف المسجل في الطلب. لا تعرض تفاصيل الطلب.';
        }

        return collect([
            'order_number' => $order->order_number,
            'status' => $order->status,
            'payment_status' => $order->payment_status,
            'total_mad' => (float) $order->total,
            'items' => $order->items->map(fn ($item) => [
                'name' => $item->product_name,
                'quantity' => $item->quantity,
            ])->values(),
            'created_at' => $order->created_at?->toDateString(),
        ])->toJson(JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    private function samePhone(string $left, string $right): bool
    {
        $normalize = static function (string $phone): string {
            $digits = preg_replace('/\D+/', '', $phone) ?: '';

            return strlen($digits) >= 9 ? substr($digits, -9) : $digits;
        };

        $normalizedLeft = $normalize($left);

        return strlen($normalizedLeft) === 9 && hash_equals($normalizedLeft, $normalize($right));
    }

    private function fallbackReply(): string
    {
        return 'سمح لينا، المساعد الآلي غير متاح مؤقتاً. خلي لينا سؤالك ورقم الطلب إن وجد، وفريق زادي غادي يتابع معك.';
    }
}
