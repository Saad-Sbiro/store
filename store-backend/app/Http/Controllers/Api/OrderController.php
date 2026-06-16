<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            $orders = Order::with(['user', 'items'])->orderBy('created_at', 'desc')->paginate(15);
        } else {
            $orders = Order::with('items')->where('user_id', $user->id)->orderBy('created_at', 'desc')->paginate(15);
        }

        return response()->json($orders);
    }

    /**
     * Store a newly created order.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.size' => 'nullable|string',
            'items.*.color' => 'nullable|string',
            'shipping_address' => 'required|array',
            'shipping_address.name' => 'required|string',
            'shipping_address.street' => 'required|string',
            'shipping_address.city' => 'required|string',
            'shipping_address.state' => 'required|string',
            'shipping_address.postal_code' => 'required|string',
            'shipping_address.country' => 'required|string',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        try {
            $result = DB::transaction(function () use ($validated, $user) {
                $subtotal = 0;
                $orderItemsData = [];

                // 1. Process items and calculate totals
                foreach ($validated['items'] as $itemData) {
                    $product = Product::findOrFail($itemData['product_id']);

                    // Check stock
                    if ($product->stock < $itemData['quantity']) {
                        throw new \Exception("Product '{$product->name}' is out of stock or does not have enough inventory.");
                    }

                    // Subtract stock
                    $product->decrement('stock', $itemData['quantity']);

                    $itemPrice = $product->price;
                    $lineTotal = $itemPrice * $itemData['quantity'];
                    $subtotal += $lineTotal;

                    $orderItemsData[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'price' => $itemPrice,
                        'quantity' => $itemData['quantity'],
                        'size' => $itemData['size'] ?? null,
                        'color' => $itemData['color'] ?? null,
                    ];
                }

                $tax = $subtotal * 0.15; // 15% VAT calculation
                $shipping = $subtotal > 150 ? 0 : 15.00; // Free shipping over $150
                $total = $subtotal + $tax + $shipping;

                // 2. Create the main Order
                $order = Order::create([
                    'order_number' => Order::generateOrderNumber(),
                    'user_id' => $user->id,
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'shipping' => $shipping,
                    'total' => $total,
                    'status' => 'pending',
                    'payment_status' => 'paid', // Simulating successful checkout immediately
                    'payment_method' => $validated['payment_method'],
                    'shipping_address' => $validated['shipping_address'],
                    'notes' => $validated['notes'] ?? null,
                ]);

                // 3. Create OrderItems
                foreach ($orderItemsData as $orderItemData) {
                    $orderItemData['order_id'] = $order->id;
                    OrderItem::create($orderItemData);
                }

                return $order;
            });

            return response()->json([
                'message' => 'Order placed successfully',
                'order' => Order::with('items')->find($result->id)
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Display the specified order.
     */
    public function show(string $id, Request $request)
    {
        $order = Order::with('items.product')->findOrFail($id);
        $user = $request->user();

        // Check permission: user must own the order or be an admin
        if (!$user->isAdmin() && $order->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        return response()->json($order);
    }

    /**
     * Update order status or payment status (Admin only).
     */
    public function updateStatus(Request $request, string $id)
    {
        $request->user()->isAdmin() || abort(403, 'Unauthorized action.');

        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|required|in:pending,processing,shipped,delivered,cancelled',
            'payment_status' => 'sometimes|required|in:pending,paid,failed,refunded',
        ]);

        $order->update($validated);

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order
        ]);
    }
}
