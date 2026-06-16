import { useState } from 'react';
import { CheckCircle2, KeyRound, Loader2, ShieldAlert } from 'lucide-react';

import { api } from '../../services/api';

export default function AccountPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password !== passwordConfirmation) {
      setError('New password and confirmation do not match.');
      return;
    }

    setSaving(true);
    try {
      const result = await api.updateAdminPassword(currentPassword, password, passwordConfirmation);
      setSuccess(result.message || 'Password updated successfully.');
      setCurrentPassword('');
      setPassword('');
      setPasswordConfirmation('');
    } catch (err) {
      setError(err.message || 'Unable to update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <section className="rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c]/60 p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
            <KeyRound size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Admin Password</h2>
            <p className="text-xs text-white/40">Update the password used to access this dashboard.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            <ShieldAlert size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-white/50">Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              className="w-full rounded-xl border border-[#3a3a3a] bg-[#222222]/60 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-white/30 focus:ring-1 focus:ring-white/15"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-white/50">New password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
              className="w-full rounded-xl border border-[#3a3a3a] bg-[#222222]/60 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-white/30 focus:ring-1 focus:ring-white/15"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-white/50">Confirm new password</span>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              minLength={8}
              required
              className="w-full rounded-xl border border-[#3a3a3a] bg-[#222222]/60 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-white/30 focus:ring-1 focus:ring-white/15"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Save password
          </button>
        </form>
      </section>
    </div>
  );
}
