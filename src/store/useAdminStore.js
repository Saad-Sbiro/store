import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { normalizeGeo } from '../utils/geo';

const SITE_SETTINGS_VERSION = 3;

const defaultSiteSettings = {
  siteSettingsVersion: SITE_SETTINGS_VERSION,
  storeName: 'CUTPORTAL',
  tagline: 'Curated desk technology',
  heroTitle: 'Sharper\nSetups',
  heroSubtitle: 'Quiet tools for focused rooms: stands, docks, lighting, and audio chosen for everyday work.',
  accentColor: '#6366f1',
  showHero: true,
  showFeatured: true,
  showCategories: true,
  showTestimonials: true,
  showNewsletter: true,
  footerInstagram: '#',
  footerTwitter: '#',
  footerPinterest: '#',
  announcementBar: 'New setup essentials available now - Returns within 14 days',
  showAnnouncementBar: false,
};

const legacySiteDefaults = {
  storeName: 'LUXE',
  tagline: 'Curated Essentials for Modern Living',
  heroTitle: 'Crafted for Those\nWho Notice.',
};

const normalizeSiteSettings = (settings) => {
  const persistedSettings = settings || {};
  const merged = { ...defaultSiteSettings, ...persistedSettings };
  const legacyAnnouncement = String(persistedSettings.announcementBar || '').toLowerCase();

  if (
    !persistedSettings.storeName
    || persistedSettings.storeName === legacySiteDefaults.storeName
    || persistedSettings.storeName === 'VOIDSTORE'
  ) {
    merged.storeName = defaultSiteSettings.storeName;
  }
  if (!persistedSettings.tagline || persistedSettings.tagline === legacySiteDefaults.tagline) {
    merged.tagline = defaultSiteSettings.tagline;
  }
  if (!persistedSettings.heroTitle || persistedSettings.heroTitle === legacySiteDefaults.heroTitle) {
    merged.heroTitle = defaultSiteSettings.heroTitle;
  }
  if (
    !persistedSettings.heroSubtitle
    || persistedSettings.heroSubtitle.startsWith('A curated edit of luxury essentials')
  ) {
    merged.heroSubtitle = defaultSiteSettings.heroSubtitle;
  }
  if (
    !persistedSettings.announcementBar
    || legacyAnnouncement.includes('shipping on orders over')
  ) {
    merged.announcementBar = defaultSiteSettings.announcementBar;
  }

  if (persistedSettings.siteSettingsVersion !== SITE_SETTINGS_VERSION) {
    merged.showAnnouncementBar = false;
  }
  merged.siteSettingsVersion = SITE_SETTINGS_VERSION;

  return merged;
};

export const useAdminStore = create(
  persist(
    (set) => ({
      // Products
      products: [],
      updateProduct: (id, updates) =>
        set(state => ({
          products: state.products.map(p => p.id === id ? { ...p, ...updates } : p),
        })),
      addProduct: (product) =>
        set(state => ({
          products: [...state.products, { ...product, id: String(Date.now()) }],
        })),
      deleteProduct: (id) =>
        set(state => ({
          products: state.products.filter(p => p.id !== id),
        })),

      // Orders
      orders: [],
      updateOrderStatus: (id, status) =>
        set(state => ({
          orders: state.orders.map(o => o.id === id ? { ...o, status } : o),
        })),
      addOrder: (order) =>
        set(state => ({ orders: [order, ...state.orders] })),

      // Site Settings
      siteSettings: { ...defaultSiteSettings },
      updateSiteSettings: (updates) =>
        set(state => ({
          siteSettings: { ...state.siteSettings, ...updates, siteSettingsVersion: SITE_SETTINGS_VERSION },
        })),
      resetSiteSettings: () => set({ siteSettings: { ...defaultSiteSettings } }),

      // Visitor Sessions
      sessions: [],
      addSession: (session) =>
        set(state => ({
          sessions: [{ ...session, geo: normalizeGeo(session.geo) }, ...state.sessions].slice(0, 500),
        })),
      clearSessions: () => set({ sessions: [] }),

      // AI Config & History
      aiConfig: {
        provider: 'nvidia',
        apiKey: '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',
        model: 'z-ai/glm-5.1',
      },
      setAiConfig: (config) =>
        set(state => ({ aiConfig: { ...state.aiConfig, ...config } })),
      aiHistory: [],
      addAiReport: (report) =>
        set(state => ({
          aiHistory: [report, ...state.aiHistory].slice(0, 50),
        })),
      clearAiHistory: () => set({ aiHistory: [] }),
    }),
    {
      name: 'admin-store',
      partialize: (state) => ({
        siteSettings: state.siteSettings,
        sessions: state.sessions,
        aiConfig: state.aiConfig,
        aiHistory: state.aiHistory,
      }),
      merge: (persisted, current) => {
        const safePersisted = { ...(persisted || {}) };
        delete safePersisted.products;
        delete safePersisted.orders;

        const merged = { ...current, ...safePersisted, products: [], orders: [] };
        merged.siteSettings = normalizeSiteSettings(safePersisted.siteSettings);
        merged.sessions = (merged.sessions || []).map(session => ({
          ...session,
          geo: normalizeGeo(session.geo),
        }));

        const validModels = ['z-ai/glm-5.1', 'moonshotai/kimi-k2.6', 'deepseek-ai/deepseek-r1'];
        if (merged.aiConfig) {
          if (!merged.aiConfig.model || !validModels.includes(merged.aiConfig.model)) {
            merged.aiConfig.model = 'z-ai/glm-5.1';
          }
        }

        if (merged.aiConfig?.apiKey === '1b7d351b-779e-4c0a-9b8a-6a1def66d503') {
          merged.aiConfig.apiKey = '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';
        }

        if (!merged.aiConfig?.apiKey) {
          merged.aiConfig = {
            ...merged.aiConfig,
            provider: 'nvidia',
            apiKey: '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',
            model: merged.aiConfig?.model || 'z-ai/glm-5.1',
          };
        }

        return merged;
      },
    }
  )
);
