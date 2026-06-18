// ─────────────────────────────────────────────
// FILE: src/admin/pages/ProductsPage.jsx
// Full product CRUD manager
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X, Check, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';

const badgeOptions = [null, 'Best Seller', 'New', 'Sale', 'Low Stock'];

const emptyProduct = {
  name: '', slug: '', price: '', originalPrice: '',
  category_id: 1, description: '', stock: '',
  badge: null, rating: 4.5, reviewCount: 0,
  images: ['', '', '', ''], colors: [], sizes: [], tags: [],
};

function ProductModal({ product, categories, onSave, onClose }) {
  const promoTag = product?.tags?.find(t => t.startsWith('promo:'));
  const initialPromoCode = promoTag ? promoTag.split(':')[1] : '';
  const initialPromoDiscount = promoTag ? promoTag.split(':')[2] : '';

  const shippingTag = product?.tags?.find(t => t.startsWith('shipping:'));
  const initialShippingFee = shippingTag ? shippingTag.split(':')[1] : '0';

  const [form, setForm] = useState({
    ...emptyProduct,
    ...product,
    promoCode: initialPromoCode,
    promoDiscount: initialPromoDiscount,
    shippingFee: initialShippingFee,
    images: [...(product?.images || ['','','',''])]
  });
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState({ 0: false, 1: false, 2: false, 3: false });

  const handleFileChange = async (i, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [i]: true }));
    try {
      const res = await api.uploadFile(file);
      const imgs = [...form.images];
      imgs[i] = res.url;
      set('images', imgs);
    } catch (err) {
      console.error(err);
      setError(`Failed to upload image ${i+1}: ${err.message}`);
    } finally {
      setUploading(prev => ({ ...prev, [i]: false }));
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    if (!form.name.trim()) { setError('Product name is required'); return; }
    if (!form.price) { setError('Price is required'); return; }
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Clean old promo and shipping tags, and add new ones
    let newTags = (form.tags || []).filter(t => !t.startsWith('promo:') && !t.startsWith('shipping:'));
    if (form.promoCode && form.promoCode.trim()) {
      const discount = parseInt(form.promoDiscount) || 10;
      newTags.push(`promo:${form.promoCode.trim().toUpperCase()}:${discount}`);
    }

    const shipping = parseFloat(form.shippingFee) || 0;
    if (shipping > 0) {
      newTags.push(`shipping:${shipping}`);
    }

    onSave({
      ...form,
      slug,
      tags: newTags,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      stock: parseInt(form.stock) || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#1c1c1c] border border-[#3a3a3a] rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3a3a3a]">
          <h2 className="text-white font-semibold">{product?.id ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          {error && <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 flex items-center gap-2"><AlertTriangle size={13} />{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-full">
              <label className="block text-white/50 text-xs mb-1.5">Product Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className="w-full bg-[#222222]/50 border border-[#3a3a3a] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30" placeholder="Arc Leather Tote" />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1.5">Price (DH) *</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} className="w-full bg-[#222222]/50 border border-[#3a3a3a] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30" placeholder="2890" />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1.5">Original Price (DH)</label>
              <input type="number" value={form.originalPrice || ''} onChange={e => set('originalPrice', e.target.value)} className="w-full bg-[#222222]/50 border border-[#3a3a3a] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30" placeholder="3800 (leave blank if no discount)" />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1.5">Category</label>
              <select value={form.category_id || 1} onChange={e => set('category_id', e.target.value)} className="w-full bg-[#222222]/50 border border-[#3a3a3a] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30">
                {categories.map(c => <option key={c.id} value={c.id} className="bg-[#1c1c1c]">{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1.5">Stock</label>
              <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} className="w-full bg-[#222222]/50 border border-[#3a3a3a] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30" placeholder="10" />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1.5">Item Promo Code</label>
              <input value={form.promoCode || ''} onChange={e => set('promoCode', e.target.value)} className="w-full bg-[#222222]/50 border border-[#3a3a3a] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30" placeholder="e.g. LAPTOP20" />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1.5">Promo Discount (%)</label>
              <input type="number" value={form.promoDiscount || ''} onChange={e => set('promoDiscount', e.target.value)} className="w-full bg-[#222222]/50 border border-[#3a3a3a] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30" placeholder="e.g. 20" />
            </div>
            <div className="col-span-full">
              <label className="block text-white/50 text-xs mb-1.5 font-medium">Shipping Fee (DH) - 0 for Free Shipping</label>
              <input type="number" value={form.shippingFee} onChange={e => set('shippingFee', e.target.value)} className="w-full bg-[#222222]/50 border border-[#3a3a3a] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30" placeholder="0 (Free Shipping)" />
            </div>
            <div className="col-span-full">
              <label className="block text-white/50 text-xs mb-1.5">Badge</label>
              <div className="flex flex-wrap gap-2">
                {badgeOptions.map(b => (
                  <button key={String(b)} onClick={() => set('badge', b)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${form.badge === b ? 'bg-white/15 text-white/80 border-white/25' : 'text-white/50 border-[#3a3a3a] hover:border-white/20'}`}>
                    {b || 'None'}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-full">
              <label className="block text-white/50 text-xs mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="w-full bg-[#222222]/50 border border-[#3a3a3a] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30 resize-none" placeholder="Product description..." />
            </div>
            {[0,1,2,3].map(i => (
              <div key={i} className="flex flex-col">
                <label className="block text-white/50 text-xs mb-1.5 font-medium">Image {i+1}{i===0?' (Main)':''}</label>
                <div 
                  onClick={() => {
                    const fileInput = document.getElementById(`product-file-input-${i}`);
                    if (fileInput) fileInput.click();
                  }}
                  className="relative flex items-center justify-center h-28 w-full rounded-xl border border-dashed border-[#3a3a3a] bg-[#222222]/20 hover:bg-[#222222]/40 hover:border-white/20 transition-all overflow-hidden cursor-pointer group"
                >
                  {uploading[i] ? (
                    <div className="flex flex-col items-center gap-1.5 text-xs text-white/40">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span className="text-[10px]">Uploading...</span>
                    </div>
                  ) : form.images[i] ? (
                    <>
                      <img src={form.images[i]} alt={`Preview ${i+1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                        <button type="button" onClick={(e) => {
                          e.stopPropagation();
                          const fileInput = document.getElementById(`product-file-input-${i}`);
                          if (fileInput) fileInput.click();
                        }} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-[10px] font-medium transition-all">Replace</button>
                        <button type="button" onClick={(e) => {
                          e.stopPropagation();
                          const imgs = [...form.images];
                          imgs[i] = '';
                          set('images', imgs);
                        }} className="px-2 py-1 bg-rose-500/25 hover:bg-rose-500/40 rounded-lg text-rose-300 text-[10px] font-medium transition-all">Remove</button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-white/30 hover:text-white/50 text-center p-3 select-none">
                      <Plus size={16} />
                      <span className="text-[10px] font-medium uppercase tracking-wider">Choose Image</span>
                    </div>
                  )}
                  <input
                    id={`product-file-input-${i}`}
                    type="file"
                    accept="image/*"
                    onChange={e => handleFileChange(i, e.target.files[0])}
                    className="hidden"
                  />
                </div>
              </div>
            ))}
            <div className="col-span-full">
              <label className="block text-white/50 text-xs mb-1.5">Slug (auto-generated if blank)</label>
              <input value={form.slug} onChange={e => set('slug', e.target.value)} className="w-full bg-[#222222]/50 border border-[#3a3a3a] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30 font-mono" placeholder="arc-leather-tote" />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#3a3a3a] flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-white/50 hover:text-white bg-white/5 rounded-xl border border-[#3a3a3a] transition-all">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-gradient-to-r from-neutral-600 to-neutral-700 rounded-xl font-medium hover:from-neutral-500 hover:to-neutral-600 transition-all shadow-lg shadow-black/20">
            {product?.id ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProductsAndCategories = async () => {
    try {
      const cats = await api.getCategories();
      setDbCategories(cats);

      const res = await api.getProducts({ per_page: 100 });
      const mapped = (res?.data || []).map(p => ({
        ...p,
        originalPrice: p.originalPrice || p.original_price,
        reviewCount: p.reviewCount || p.review_count,
        category: p.category?.name || 'Uncategorized',
        category_id: p.category_id || p.category?.id || 1,
      }));
      setProducts(mapped);
    } catch (err) {
      console.error('Error fetching admin products/categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const handleSaveProduct = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        price: parseFloat(formData.price),
        original_price: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        category_id: parseInt(formData.category_id) || 1,
        images: formData.images.filter(x => x.trim() !== ''),
        colors: formData.colors || [],
        sizes: formData.sizes || [],
        tags: formData.tags || [],
        description: formData.description,
        stock: parseInt(formData.stock) || 0,
        badge: formData.badge || null,
        is_featured: true,
        is_active: true
      };

      if (formData.id) {
        await api.updateProduct(formData.id, payload);
      } else {
        await api.createProduct(payload);
      }
      fetchProductsAndCategories();
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.deleteProduct(id);
      fetchProductsAndCategories();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modal, setModal] = useState(null); // null | 'new' | product object
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selected, setSelected] = useState([]);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);

  const categories = ['All', ...dbCategories.map(c => c.name)];

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const selectAll = () => setSelected(filtered.map(p => p.id));
  const clearSelect = () => setSelected([]);

  const bulkDelete = async () => {
    for (const id of selected) {
      await api.deleteProduct(id);
    }
    fetchProductsAndCategories();
    setSelected([]);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full bg-[#222222]/50 border border-[#3a3a3a] text-white text-xs placeholder-white/30 rounded-xl pl-8 pr-3 py-2.5 outline-none focus:border-white/30" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${categoryFilter === c ? 'bg-white/15 text-white/80 border-white/25' : 'text-white/40 border-[#3a3a3a] hover:border-white/20'}`}>{c}</button>
          ))}
        </div>
        {selected.length > 0 && (
          <button onClick={bulkDelete} className="ml-auto flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg hover:bg-rose-500/20 transition-all">
            <Trash2 size={12} /> Delete {selected.length} selected
          </button>
        )}
        <div className={selected.length > 0 ? 'flex gap-2' : 'ml-auto flex gap-2'}>
          <button onClick={() => setCategoryManagerOpen(true)} className="flex items-center gap-2 text-xs text-white/70 bg-[#222222]/50 border border-[#3a3a3a] hover:bg-white/10 hover:text-white px-3.5 py-2 rounded-xl font-medium transition-all">
            Manage Categories
          </button>
          <button onClick={() => setModal('new')} className="flex items-center gap-2 text-xs text-white bg-gradient-to-r from-neutral-600 to-neutral-700 px-3.5 py-2 rounded-xl font-medium hover:from-neutral-500 hover:to-neutral-600 transition-all shadow-lg shadow-black/20">
            <Plus size={13} /> Add Product
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Products', val: products.length, color: 'text-white' },
          { label: 'In Stock', val: products.filter(p => p.stock > 0).length, color: 'text-emerald-400' },
          { label: 'Low Stock (<5)', val: products.filter(p => p.stock < 5 && p.stock > 0).length, color: 'text-amber-400' },
          { label: 'Out of Stock', val: products.filter(p => p.stock === 0).length, color: 'text-rose-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-[#2a2a2a] bg-[#1c1c1c]/60 px-4 py-3">
            <p className="text-white/40 text-xs">{s.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c]/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={e => e.target.checked ? selectAll() : clearSelect()} className="rounded" />
                </th>
                {['Product','Category','Price','Original','Stock','Badge','Rating','Actions'].map(h => (
                  <th key={h} className={`text-white/40 font-medium py-3 whitespace-nowrap ${h === 'Product' ? 'text-left px-2' : h === 'Actions' ? 'text-right px-4' : 'text-right px-3'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {filtered.map(p => (
                <tr key={p.id} className={`hover:bg-[#252525]/40 transition-colors ${selected.includes(p.id) ? 'bg-white/30/5' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-white/5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-medium leading-none mb-0.5">{p.name}</p>
                        <p className="text-white/30 font-mono text-[10px]">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right text-white font-medium">{formatPrice(p.price)}</td>
                  <td className="px-3 py-3 text-right text-white/40 line-through">{p.originalPrice ? formatPrice(p.originalPrice) : '—'}</td>
                  <td className="px-3 py-3 text-right">
                    <span className={`font-medium ${p.stock < 5 ? 'text-rose-400' : p.stock < 15 ? 'text-amber-400' : 'text-emerald-400'}`}>{p.stock}</span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    {p.badge ? <span className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded-full">{p.badge}</span> : <span className="text-white/20">—</span>}
                  </td>
                  <td className="px-3 py-3 text-right text-amber-400">★ {p.rating}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => setModal(p)} className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all" title="Edit"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-white/30 text-sm">No products match your search</div>}
        </div>
      </div>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1c1c1c] border border-[#3a3a3a] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400"><AlertTriangle size={18} /></div>
              <div><h3 className="text-white font-semibold">Delete Product</h3><p className="text-white/40 text-xs">This action cannot be undone</p></div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-white/50 bg-[#222222]/50 rounded-xl border border-[#3a3a3a] hover:text-white transition-all">Cancel</button>
              <button onClick={() => { handleDeleteProduct(deleteConfirm); setDeleteConfirm(null); }} className="px-4 py-2 text-sm text-white bg-rose-500/80 hover:bg-rose-500 rounded-xl transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <ProductModal
          product={modal === 'new' ? null : modal}
          categories={dbCategories}
          onSave={handleSaveProduct}
          onClose={() => setModal(null)}
        />
      )}

      {/* Category Manager Modal */}
      {categoryManagerOpen && (
        <CategoryManagerModal
          onClose={() => setCategoryManagerOpen(false)}
          onRefresh={fetchProductsAndCategories}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// CategoryManagerModal component
// ─────────────────────────────────────────────
function CategoryManagerModal({ onClose, onRefresh }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState(null); // null | 'new' | category object
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchCats = async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleSave = async (form) => {
    if (!form.name.trim()) { setError('Category name is required'); return; }
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    try {
      const payload = {
        name: form.name,
        slug,
        image: form.image || '',
        description: form.description || '',
        accent: form.accent || '#ffffff',
        sort_order: parseInt(form.sort_order) || 0,
        is_active: form.is_active ?? true
      };

      if (form.id) {
        await api.updateCategory(form.id, payload);
      } else {
        await api.createCategory(payload);
      }
      setEditingCat(null);
      setError('');
      fetchCats();
      onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteCategory(id);
      fetchCats();
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const handleFileChange = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadFile(file);
      setEditingCat(prev => ({ ...prev, image: res.url }));
    } catch (err) {
      console.error(err);
      setError(`Failed to upload image: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#1c1c1c] border border-[#3a3a3a] rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3a3a3a]">
          <h2 className="text-white font-semibold">Manage Categories</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        {editingCat ? (
          <div className="overflow-y-auto p-6 space-y-4 flex-1">
            <h3 className="text-white text-xs font-semibold uppercase tracking-wider text-white/50">{editingCat.id ? 'Edit Category' : 'New Category'}</h3>
            {error && <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/50 text-xs mb-1.5 font-medium">Category Name *</label>
                <input value={editingCat.name || ''} onChange={e => setEditingCat(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-[#222222]/50 border border-[#3a3a3a] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30" placeholder="Bags" />
              </div>

              <div>
                <label className="block text-white/50 text-xs mb-1.5 font-medium">Category Image</label>
                <div 
                  onClick={() => document.getElementById('category-file-input').click()}
                  className="relative flex items-center justify-center h-28 w-full rounded-xl border border-dashed border-[#3a3a3a] bg-[#222222]/20 hover:bg-[#222222]/40 hover:border-white/20 transition-all overflow-hidden cursor-pointer group"
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-1.5 text-xs text-white/40">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span className="text-[10px]">Uploading...</span>
                    </div>
                  ) : editingCat.image ? (
                    <>
                      <img src={editingCat.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                        <button type="button" onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById('category-file-input').click();
                        }} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-[10px] font-medium transition-all">Replace</button>
                        <button type="button" onClick={(e) => {
                          e.stopPropagation();
                          setEditingCat(prev => ({ ...prev, image: '' }));
                        }} className="px-2 py-1 bg-rose-500/25 hover:bg-rose-500/40 rounded-lg text-rose-300 text-[10px] font-medium transition-all">Remove</button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-white/30 hover:text-white/50 text-center p-3 select-none">
                      <Plus size={16} />
                      <span className="text-[10px] font-medium uppercase tracking-wider">Choose Image</span>
                    </div>
                  )}
                  <input
                    id="category-file-input"
                    type="file"
                    accept="image/*"
                    onChange={e => handleFileChange(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/50 text-xs mb-1.5 font-medium">Sort Order</label>
                  <input type="number" value={editingCat.sort_order ?? 0} onChange={e => setEditingCat(prev => ({ ...prev, sort_order: e.target.value }))} className="w-full bg-[#222222]/50 border border-[#3a3a3a] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30" placeholder="0" />
                </div>
                <div>
                  <label className="block text-white/50 text-xs mb-1.5 font-medium">Accent Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={editingCat.accent || '#ffffff'} onChange={e => setEditingCat(prev => ({ ...prev, accent: e.target.value }))} className="bg-transparent border border-none rounded cursor-pointer w-10 h-10 flex-shrink-0" />
                    <input type="text" value={editingCat.accent || '#ffffff'} onChange={e => setEditingCat(prev => ({ ...prev, accent: e.target.value }))} className="w-full bg-[#222222]/50 border border-[#3a3a3a] text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-white/30 font-mono" placeholder="#ffffff" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white/50 text-xs mb-1.5 font-medium">Description</label>
                <textarea value={editingCat.description || ''} onChange={e => setEditingCat(prev => ({ ...prev, description: e.target.value }))} rows={2} className="w-full bg-[#222222]/50 border border-[#3a3a3a] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30 resize-none" placeholder="Category description..." />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-[#3a3a3a]">
              <button onClick={() => setEditingCat(null)} className="px-4 py-2 text-xs text-white/50 bg-white/5 rounded-xl border border-[#3a3a3a] hover:text-white transition-all">Cancel</button>
              <button onClick={() => handleSave(editingCat)} className="px-4 py-2 text-xs text-white bg-gradient-to-r from-neutral-600 to-neutral-700 rounded-xl font-medium hover:from-neutral-500 hover:to-neutral-600 transition-all shadow-lg shadow-black/20">Save</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[50vh]">
              {loading ? (
                <div className="text-center text-white/40 text-xs py-8 animate-pulse">Loading categories...</div>
              ) : categories.length === 0 ? (
                <div className="text-center text-white/30 text-xs py-8 font-medium">No categories found.</div>
              ) : (
                categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#222222]/30 border border-[#2a2a2a] hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <img src={cat.image || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=100'} alt={cat.name} className="w-10 h-10 rounded-lg object-cover bg-white/5" />
                      <div>
                        <p className="text-white text-xs font-semibold">{cat.name}</p>
                        <p className="text-[10px] text-white/30 font-mono">{cat.slug}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingCat(cat)} className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"><Pencil size={12} /></button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 hover:bg-rose-500/10 rounded-lg text-white/40 hover:text-rose-400 transition-all"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-[#3a3a3a] flex gap-3">
              <button onClick={() => setEditingCat({ name: '', slug: '', image: '', description: '', accent: '#ffffff', sort_order: 0, is_active: true })} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-white bg-gradient-to-r from-neutral-600 to-neutral-700 rounded-xl font-medium hover:from-neutral-500 hover:to-neutral-600 transition-all shadow-lg shadow-black/20">
                <Plus size={14} /> Add Category
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
