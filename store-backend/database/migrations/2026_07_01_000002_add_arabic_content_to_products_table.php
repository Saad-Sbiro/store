<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('name_ar')->nullable()->after('name');
            $table->text('description_ar')->nullable()->after('description');
        });

        $translations = [
            'table-pour-pc' => [
                'name_ar' => 'طاولة للحاسوب',
                'description_ar' => 'طاولة عملية ومريحة للحاسوب، مناسبة للعمل والدراسة وتنظيم مساحة المكتب.',
            ],
            'ergonomic-monitor-stand' => [
                'name_ar' => 'حامل شاشة مريح',
                'description_ar' => 'حامل شاشة من الألومنيوم مع موزع USB-C وتنظيم للكابلات. يرفع الشاشة إلى مستوى مريح للعين ويساعد على تقليل إجهاد الرقبة، مع قاعدة مانعة للانزلاق ودعم للشاشات حتى 32 بوصة.',
            ],
            'wireless-mechanical-keyboard' => [
                'name_ar' => 'لوحة مفاتيح ميكانيكية لاسلكية',
                'description_ar' => 'لوحة مفاتيح ميكانيكية قابلة لتبديل المفاتيح، تعمل عبر البلوتوث أو اتصال 2.4GHz أو USB-C. بطارية بسعة 4000mAh وأزرار PBT متينة لتجربة كتابة مريحة.',
            ],
            'noise-cancelling-headphones' => [
                'name_ar' => 'سماعات لاسلكية عازلة للضوضاء',
                'description_ar' => 'سماعات لاسلكية فوق الأذن بعزل ضوضاء متكيف ومكبرات صوت 40mm. توفر حتى 30 ساعة من الاستخدام مع شحن سريع ووسائد مريحة للاستعمال طوال اليوم.',
            ],
            'led-architect-desk-lamp' => [
                'name_ar' => 'مصباح مكتب LED قابل للتعديل',
                'description_ar' => 'مصباح مكتب LED بخمس درجات لحرارة اللون وعشرة مستويات للسطوع. يتميز بذراع مرنة ومنفذ شحن USB-A وإضاءة مريحة للعين دون وميض.',
            ],
            'usb-c-docking-station' => [
                'name_ar' => 'محطة توصيل USB-C',
                'description_ar' => 'محطة توصيل USB-C تدعم شاشتين بدقة 4K ومنافذ بيانات سريعة وشحن حتى 100W، مع قارئ بطاقات ومنفذ Ethernet وصوت 3.5mm. متوافقة مع Mac وWindows وChrome OS.',
            ],
        ];

        foreach ($translations as $slug => $content) {
            DB::table('products')->where('slug', $slug)->update($content);
        }
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['name_ar', 'description_ar']);
        });
    }
};
