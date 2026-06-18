<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Users
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@voidstore.com',
            'password' => Hash::make('passpass'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('passpass'),
            'role' => 'customer',
        ]);

        // 2. Create Categories
        $categoriesData = [
            [
                'name' => 'Desk Accessories',
                'slug' => 'desk-accessories',
                'image' => 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=82',
                'description' => 'Monitor stands, organizers, and ergonomic essentials for the perfect workspace.',
                'accent' => '#8B7355',
                'sort_order' => 1,
            ],
            [
                'name' => 'Home Appliances',
                'slug' => 'home-appliances',
                'image' => 'https://images.unsplash.com/photo-1618944847828-82e943c3bedb?auto=format&fit=crop&w=1200&q=82',
                'description' => 'Fans, purifiers, and smart home devices for comfortable living.',
                'accent' => '#C4B49A',
                'sort_order' => 2,
            ],
            [
                'name' => 'Peripherals',
                'slug' => 'peripherals',
                'image' => 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=82',
                'description' => 'Keyboards, mice, and input devices for a seamless workflow.',
                'accent' => '#4A6FA5',
                'sort_order' => 3,
            ],
            [
                'name' => 'Audio',
                'slug' => 'audio',
                'image' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=82',
                'description' => 'Headphones, speakers, and DACs for audiophile-grade sound.',
                'accent' => '#4A5568',
                'sort_order' => 4,
            ],
            [
                'name' => 'Lighting',
                'slug' => 'lighting',
                'image' => 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=82',
                'description' => 'Desk lamps, light bars, and ambient lighting for focus and mood.',
                'accent' => '#D4A0A0',
                'sort_order' => 5,
            ],
            [
                'name' => 'Connectivity',
                'slug' => 'connectivity',
                'image' => 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=1200&q=82',
                'description' => 'Hubs, docks, and adapters that connect your entire setup.',
                'accent' => '#6B8FA3',
                'sort_order' => 6,
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $c) {
            $categories[$c['name']] = Category::create($c);
        }

        // 3. Create Products
        $productsData = [
            [
                'name' => 'Ergonomic Monitor Stand',
                'slug' => 'ergonomic-monitor-stand',
                'price' => 89.00,
                'original_price' => 120.00,
                'category_name' => 'Desk Accessories',
                'rating' => 4.8,
                'review_count' => 124,
                'badge' => 'Best Seller',
                'images' => [
                    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=82',
                    'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=900&q=82',
                    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=900&q=82',
                    'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=82',
                ],
                'colors' => ['#1a1a1a', '#8B7355', '#C0C0C0'],
                'sizes' => ['Standard', 'Wide', 'Ultra-Wide'],
                'description' => 'Premium aluminum monitor riser with built-in USB-C hub and cable management. Raises your display to ergonomic eye-level height, reducing neck strain during long work sessions. Features a non-slip base and supports monitors up to 32 inches.',
                'tags' => ['ergonomic', 'aluminum', 'desk setup'],
                'stock' => 8,
                'is_featured' => true,
            ],
            [
                'name' => 'Oscillating Tower Fan',
                'slug' => 'oscillating-tower-fan',
                'price' => 129.00,
                'original_price' => 169.00,
                'category_name' => 'Home Appliances',
                'rating' => 4.9,
                'review_count' => 89,
                'badge' => 'New',
                'images' => [
                    'https://images.unsplash.com/photo-1618944847828-82e943c3bedb?auto=format&fit=crop&w=900&q=82',
                    'https://images.unsplash.com/photo-1617375407361-9815e4fccfa0?auto=format&fit=crop&w=900&q=82',
                    'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=900&q=82',
                    'https://images.unsplash.com/photo-1631049552240-59c37f38802b?auto=format&fit=crop&w=900&q=82',
                ],
                'colors' => ['#F5F0E8', '#1a1a1a', '#6B7280'],
                'sizes' => ['32 inch', '40 inch', '48 inch'],
                'description' => 'Ultra-quiet bladeless tower fan with 12-speed settings and 90° oscillation. Features a programmable timer, sleep mode, and remote control. The brushless DC motor delivers powerful airflow at whisper-quiet levels — ideal for bedrooms and offices.',
                'tags' => ['bladeless', 'quiet', 'smart home'],
                'stock' => 23,
                'is_featured' => false,
            ],
            [
                'name' => 'Wireless Mechanical Keyboard',
                'slug' => 'wireless-mechanical-keyboard',
                'price' => 179.00,
                'original_price' => null,
                'category_name' => 'Peripherals',
                'rating' => 4.7,
                'review_count' => 56,
                'badge' => null,
                'images' => [
                    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=82',
                    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=82',
                    'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=900&q=82',
                    'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?auto=format&fit=crop&w=900&q=82',
                ],
                'colors' => ['#2C2C2C', '#F5F0E8', '#4A6FA5'],
                'sizes' => ['65%', '75%', 'Full-Size'],
                'description' => 'Hot-swappable wireless mechanical keyboard with Gateron Pro switches and south-facing RGB. Connects via Bluetooth 5.1, 2.4GHz dongle, or USB-C. Includes a 4000mAh battery lasting up to 200 hours, PBT double-shot keycaps, and gasket-mount construction for a premium typing feel.',
                'tags' => ['mechanical', 'wireless', 'RGB'],
                'stock' => 4,
                'is_featured' => true,
            ],
            [
                'name' => 'Noise-Cancelling Headphones',
                'slug' => 'noise-cancelling-headphones',
                'price' => 349.00,
                'original_price' => 450.00,
                'category_name' => 'Audio',
                'rating' => 4.6,
                'review_count' => 211,
                'badge' => 'Sale',
                'images' => [
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=82',
                    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=82',
                    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=82',
                    'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&w=900&q=82',
                ],
                'colors' => ['#2C2C2C', '#F5F0E8', '#4A5568'],
                'sizes' => ['Standard', 'Compact'],
                'description' => 'Over-ear wireless headphones with adaptive hybrid ANC and 40mm bio-cellulose drivers. Up to 30 hours of battery life with quick charge (10 min = 3 hours). Features multipoint Bluetooth 5.3, spatial audio support, and ultra-soft memory foam ear cushions for all-day comfort.',
                'tags' => ['ANC', 'wireless', 'hi-fi'],
                'stock' => 15,
                'is_featured' => true,
            ],
            [
                'name' => 'LED Architect Desk Lamp',
                'slug' => 'led-architect-desk-lamp',
                'price' => 95.00,
                'original_price' => 125.00,
                'category_name' => 'Lighting',
                'rating' => 5.0,
                'review_count' => 43,
                'badge' => 'Low Stock',
                'images' => [
                    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=82',
                    'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?auto=format&fit=crop&w=900&q=82',
                    'https://images.unsplash.com/photo-1534189749276-43e768c67be6?auto=format&fit=crop&w=900&q=82',
                    'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=82',
                ],
                'colors' => ['#1a1a1a', '#C0C0C0', '#8B7355'],
                'sizes' => ['One Size'],
                'description' => 'Adjustable LED desk lamp with 5 color temperatures and 10 brightness levels. Features a clamp-on design with a 360° flexible gooseneck arm spanning 31.5 inches. USB-A charging port built into the base. Eye-care technology eliminates flicker and glare for comfortable extended use.',
                'tags' => ['LED', 'adjustable', 'eye-care'],
                'stock' => 3,
                'is_featured' => false,
            ],
            [
                'name' => 'USB-C Docking Station',
                'slug' => 'usb-c-docking-station',
                'price' => 145.00,
                'original_price' => null,
                'category_name' => 'Connectivity',
                'rating' => 4.8,
                'review_count' => 178,
                'badge' => null,
                'images' => [
                    'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=82',
                    'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=900&q=82',
                    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=900&q=82',
                    'https://images.unsplash.com/photo-1597673030062-0a0f1a801a31?auto=format&fit=crop&w=900&q=82',
                ],
                'colors' => ['#2C2C2C', '#C0C0C0'],
                'sizes' => ['12-in-1', '16-in-1'],
                'description' => 'Universal USB-C docking station with dual HDMI 2.1 output supporting 4K@60Hz on two displays simultaneously. Features 100W Power Delivery pass-through, 10Gbps USB-A and USB-C data ports, SD/microSD card readers, Gigabit Ethernet, and 3.5mm audio. Compatible with Mac, Windows, and Chrome OS.',
                'tags' => ['USB-C', 'dual-monitor', 'universal'],
                'stock' => 42,
                'is_featured' => true,
            ],
        ];

        foreach ($productsData as $p) {
            $catName = $p['category_name'];
            unset($p['category_name']);
            $p['category_id'] = $categories[$catName]->id;
            Product::create($p);
        }
    }
}
