import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setLeaving(true), 1550);
    const hideTimer = window.setTimeout(() => setVisible(false), 2150);

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
      <div className="voidstore-splash__frame" aria-hidden="true" />
      <div className="voidstore-splash__mark">
        <span className="voidstore-splash__eyebrow">VOIDSTORE</span>
        <span className="voidstore-splash__logo">
          <span>VOID</span>
          <span>STORE</span>
        </span>
        <span className="voidstore-splash__tagline">Curated desk technology</span>
      </div>
    </div>
  );
}
