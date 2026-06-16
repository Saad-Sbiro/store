// ─────────────────────────────────────────────
// FILE: src/admin/pages/SiteEditorPage.jsx
// Full storefront control panel
// ─────────────────────────────────────────────

import { useState } from 'react';
import { Save, RotateCcw, Check, Globe, Palette, Type, Layout, Bell } from 'lucide-react';
import { useAdminStore } from '../../store/useAdminStore';

const ACCENT_PRESETS = [
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Violet', value: '#8b5cf6' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Sky', value: '#0ea5e9' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Teal', value: '#14b8a6' },
];

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c]/60 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#2a2a2a]">
        <div className="w-8 h-8 rounded-lg bg-white/30/15 flex items-center justify-center text-white/70">
          <Icon size={15} />
        </div>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-white/60 text-xs font-medium mb-1.5">{label}</label>
      {hint && <p className="text-white/30 text-[11px] mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, textarea, mono }) {
  const cls = `w-full bg-[#222222]/50 border border-[#3a3a3a] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30 placeholder-white/30 transition-colors ${mono ? 'font-mono' : ''}`;
  return textarea
    ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3} className={`${cls} resize-none`} />
    : <input value={value} onChange={onChange} placeholder={placeholder} className={cls} />;
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-xl px-1.5 py-1 text-left transition-colors hover:bg-white/[0.03] group"
    >
      <span className={`relative h-5 w-10 rounded-full transition-all duration-200 ${checked ? 'bg-white/30' : 'bg-white/10'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
      </span>
      <span className="flex-1 text-sm text-white/70 transition-colors group-hover:text-white">{label}</span>
      {checked && <Check size={12} className="text-white/70" />}
    </button>
  );
}

export default function SiteEditorPage() {
  const { siteSettings, updateSiteSettings, resetSiteSettings } = useAdminStore();
  const [saved, setSaved] = useState(false);

  const set = (key, val) => updateSiteSettings({ [key]: val });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all site settings to defaults?')) resetSiteSettings();
  };

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex items-center gap-3 justify-end">
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-white/50 bg-[#222222]/50 border border-[#3a3a3a] px-3 py-2 rounded-xl hover:text-white hover:bg-white/10 transition-all">
          <Globe size={13} /> Preview Store
        </a>
        <button onClick={handleReset} className="flex items-center gap-2 text-xs text-white/50 bg-[#222222]/50 border border-[#3a3a3a] px-3 py-2 rounded-xl hover:text-rose-400 hover:border-rose-500/30 transition-all">
          <RotateCcw size={13} /> Reset Defaults
        </button>
        <button onClick={handleSave} className={`flex items-center gap-2 text-xs text-white font-medium px-4 py-2 rounded-xl transition-all shadow-lg ${saved ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-gradient-to-r from-neutral-600 to-neutral-700 shadow-black/20 hover:from-neutral-500 hover:to-neutral-600'}`}>
          {saved ? <><Check size={13} /> Saved!</> : <><Save size={13} /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Branding */}
        <Section icon={Type} title="Branding & Identity">
          <Field label="Store Name"><Input value={siteSettings.storeName} onChange={e => set('storeName', e.target.value)} placeholder="VOIDSTORE" /></Field>
          <Field label="Tagline"><Input value={siteSettings.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Curated desk technology" /></Field>
          <Field label="Hero Title" hint="Use \\n for line breaks">
            <Input value={siteSettings.heroTitle} onChange={e => set('heroTitle', e.target.value)} placeholder="Sharper\nSetups" textarea />
          </Field>
          <Field label="Hero Subtitle">
            <Input value={siteSettings.heroSubtitle} onChange={e => set('heroSubtitle', e.target.value)} placeholder="Quiet tools for focused rooms..." textarea />
          </Field>
        </Section>

        {/* Colors */}
        <Section icon={Palette} title="Colors & Theme">
          <Field label="Accent Color">
            <div className="flex flex-wrap gap-2 mb-3">
              {ACCENT_PRESETS.map(c => (
                <button key={c.value} onClick={() => set('accentColor', c.value)}
                  title={c.label}
                  className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${siteSettings.accentColor === c.value ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
                  style={{ background: c.value }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input type="color" value={siteSettings.accentColor} onChange={e => set('accentColor', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0" />
              <input value={siteSettings.accentColor} onChange={e => set('accentColor', e.target.value)}
                className="flex-1 bg-[#222222]/50 border border-[#3a3a3a] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-white/30 font-mono" />
            </div>
          </Field>
          <div className="p-4 rounded-xl border border-[#2a2a2a] bg-[#1c1c1c]/40">
            <p className="text-white/40 text-xs mb-3">Live Preview</p>
            <div className="flex gap-3 flex-wrap">
              <button className="px-4 py-2 text-sm text-white rounded-xl font-medium" style={{ background: siteSettings.accentColor }}>Primary Button</button>
              <button className="px-4 py-2 text-sm rounded-xl font-medium border" style={{ color: siteSettings.accentColor, borderColor: siteSettings.accentColor + '40', background: siteSettings.accentColor + '15' }}>Outline Button</button>
              <span className="px-2 py-1 text-xs rounded-full" style={{ background: siteSettings.accentColor + '20', color: siteSettings.accentColor }}>Badge</span>
            </div>
          </div>
        </Section>

        {/* Sections visibility */}
        <Section icon={Layout} title="Page Sections">
          <p className="text-white/40 text-xs mb-4">Toggle which sections appear on your homepage</p>
          <div className="space-y-3">
            {[
              { key: 'showHero', label: 'Hero Banner' },
              { key: 'showFeatured', label: 'Featured Products' },
              { key: 'showCategories', label: 'Category Grid' },
              { key: 'showTestimonials', label: 'Testimonials' },
              { key: 'showNewsletter', label: 'Newsletter Section' },
            ].map(({ key, label }) => (
              <Toggle key={key} checked={siteSettings[key]} onChange={v => set(key, v)} label={label} />
            ))}
          </div>
        </Section>

        {/* Announcement & Social */}
        <Section icon={Bell} title="Announcement & Social">
          <Toggle checked={siteSettings.showAnnouncementBar} onChange={v => set('showAnnouncementBar', v)} label="Show Announcement Bar" />
          <Field label="Announcement Text">
            <Input value={siteSettings.announcementBar} onChange={e => set('announcementBar', e.target.value)} placeholder="Free shipping on orders over $150..." />
          </Field>
          <Field label="Instagram URL"><Input value={siteSettings.footerInstagram} onChange={e => set('footerInstagram', e.target.value)} placeholder="https://instagram.com/yourstore" mono /></Field>
          <Field label="Twitter / X URL"><Input value={siteSettings.footerTwitter} onChange={e => set('footerTwitter', e.target.value)} placeholder="https://twitter.com/yourstore" mono /></Field>
          <Field label="Pinterest URL"><Input value={siteSettings.footerPinterest} onChange={e => set('footerPinterest', e.target.value)} placeholder="https://pinterest.com/yourstore" mono /></Field>
        </Section>
      </div>

      {/* Admin password section */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
            <Bell size={15} />
          </div>
          <div>
            <h4 className="text-amber-300 font-semibold text-sm mb-1">Admin Password</h4>
            <p className="text-amber-400/70 text-xs leading-relaxed">
              The current local admin password is <code className="font-mono bg-amber-500/15 px-1.5 py-0.5 rounded text-amber-300">password123</code>.
              To change it, update the <code className="font-mono">LOCAL_ADMIN_PASSWORD</code> constant in <code className="font-mono">src/admin/AdminLogin.jsx</code>.
              Backend login is still used when available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
