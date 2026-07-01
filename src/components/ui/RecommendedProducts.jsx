import { Link } from 'react-router-dom';

import { formatPrice } from '../../utils/formatPrice';
import { getPrimaryProductImage, getProductPrice } from '../../utils/productData';

export default function RecommendedProducts({ products = [] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-surface-200 py-10 font-arabic" dir="rtl">
      <div className="mb-5">
        <p className="text-[12px] font-semibold text-ink-400">اختيارات إضافية</p>
        <h2 className="mt-1 text-xl font-bold text-ink-900">منتجات قد تعجبك</h2>
      </div>

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 no-scrollbar">
        {products.map((product) => {
          const image = getPrimaryProductImage(product);
          const name = product.name_ar?.trim() || product.name;

          return (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              className="w-[68vw] max-w-[250px] shrink-0 snap-start overflow-hidden rounded-lg border border-surface-200 bg-white"
              aria-label={`عرض ${name}`}
            >
              <div className="aspect-[4/3] bg-surface-100">
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-[12px] text-ink-400">
                    الصورة ستتوفر قريباً
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="line-clamp-2 min-h-11 text-[14px] font-bold leading-6 text-ink-900">
                  {name}
                </h3>
                <p className="mt-2 text-[14px] font-extrabold text-ink-900">
                  {formatPrice(getProductPrice(product))}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
