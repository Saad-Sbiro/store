import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setLeaving(true), 1180);
    const hideTimer = window.setTimeout(() => setVisible(false), 1680);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (!visible) return undefined;

    document.documentElement.classList.add('voidstore-splash-lock');
    return () => document.documentElement.classList.remove('voidstore-splash-lock');
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`voidstore-splash ${leaving ? 'voidstore-splash--leave' : ''}`}
      aria-label="Loading VOIDSTORE"
      role="status"
    >
      <div className="voidstore-splash__mark">
        <span className="voidstore-splash__eyebrow">Curated essentials</span>
        <span className="voidstore-splash__logo">VOIDSTORE</span>
        <span className="voidstore-splash__line" aria-hidden="true" />
      </div>
    </div>
  );
}
