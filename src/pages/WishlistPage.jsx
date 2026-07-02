// ─────────────────────────────────────────────
// FILE: src/pages/WishlistPage.jsx
// Wishlist Page displaying saved items
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlistStore } from '../store/useWishlistStore';
import { api } from '../services/api';
import ProductCard from '../components/ui/ProductCard';

export default function WishlistPage() {
  const { ids } = useWishlistStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        const res = await api.getProducts({ per_page: 100 });
        const allProducts = res?.data || [];
        const filtered = allProducts.map(p => ({
          ...p,
          category: p.category?.name || 'Uncategorized',
        })).filter(p => ids.includes(p.id));
        setProducts(filtered);
      } catch (err) {
        console.error('Error fetching wishlisted products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [ids]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center" style={{ paddingTop: '108px' }}>
        <div className="w-8 h-8 border-4 border-ink-200 border-t-ink-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-surface-200 pb-5 mb-8">
          <div>
            <h1 className="font-hero text-section-sm md:text-section font-bold text-ink-900 leading-tight">
              Wishlist
            </h1>
            <p className="text-caption text-ink-400 mt-1">
              You have {products.length} {products.length === 1 ? 'item' : 'items'} saved in your wishlist.
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-panel border border-surface-200"
          >
            <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-6">
              <Heart size={24} className="text-ink-400" />
            </div>
            <h2 className="font-hero text-card-title font-bold text-ink-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-ink-400 text-body mb-8 max-w-sm mx-auto">
              Save items you love here to keep track of them and buy them later.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-ink-900 text-white px-6 py-3 rounded-btn text-btn font-semibold hover:bg-ink-600 transition-colors"
            >
              Start Exploring <ArrowRight size={15} />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
