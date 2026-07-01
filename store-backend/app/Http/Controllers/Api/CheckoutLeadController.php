<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CheckoutLead;
use App\Models\Product;
use App\Services\TelegramOrderNotifier;
use Illuminate\Http\Request;

class CheckoutLeadController extends Controller
{
    public function index(Request $request)
    {
        $request->user()->isAdmin() || abort(403, 'Unauthorized action.');

        return response()->json(
            CheckoutLead::query()
                ->whereIn('status', ['active', 'abandoned'])
                ->orderByDesc('last_activity_at')
                ->paginate(50)
        );
    }

    public function upsert(Request $request, TelegramOrderNotifier $telegram)
    {
        $request->merge([
            'phone' => preg_replace('/\s+/', '', (string) $request->input('phone')),
        ]);

        $validated = $request->validate([
            'token' => 'required|uuid',
            'full_name' => 'nullable|string|max:150',
            'phone' => ['required', 'string', 'max:30', 'regex:/^(0[5-7]\d{8}|\+212[5-7]\d{8})$/'],
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:150',
            'items' => 'required|array|min:1|max:20',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1|max:20',
            'items.*.size' => 'nullable|string|max:100',
            'items.*.color' => 'nullable|string|max:100',
            'payment_method' => 'nullable|in:cod,card',
            'abandoned' => 'sometimes|boolean',
        ]);

        $lead = CheckoutLead::firstOrNew(['token' => $validated['token']]);

        if ($lead->exists && $lead->status === 'converted') {
            return response()->json(['lead' => $lead]);
        }

        $products = Product::whereIn(
            'id',
            collect($validated['items'])->pluck('product_id')->unique()
        )->get()->keyBy('id');

        $subtotal = 0;
        $items = collect($validated['items'])->map(function (array $item) use ($products, &$subtotal) {
            $product = $products->get($item['product_id']);
            $lineTotal = (float) $product->price * $item['quantity'];
            $subtotal += $lineTotal;

            return [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'unit_price' => (float) $product->price,
                'quantity' => $item['quantity'],
                'size' => $item['size'] ?? null,
                'color' => $item['color'] ?? null,
            ];
        })->values()->all();

        $isAbandoned = (bool) ($validated['abandoned'] ?? false);
        $lead->fill([
            'status' => $isAbandoned ? 'abandoned' : 'active',
            'full_name' => $validated['full_name'] ?? null,
            'phone' => $validated['phone'],
            'address' => $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'items' => $items,
            'subtotal' => $subtotal,
            'total' => $subtotal,
            'payment_method' => $validated['payment_method'] ?? null,
            'consented_at' => $lead->consented_at ?? now(),
            'last_activity_at' => now(),
            'abandoned_at' => $isAbandoned ? now() : null,
        ]);
        $lead->save();

        if ($isAbandoned && ! $lead->notified_at && $telegram->sendCheckoutLead($lead)) {
            $lead->forceFill(['notified_at' => now()])->save();
        }

        return response()->json([
            'lead' => $lead->fresh(),
        ], $lead->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy(string $token)
    {
        CheckoutLead::where('token', $token)
            ->where('status', '!=', 'converted')
            ->delete();

        return response()->noContent();
    }
}
