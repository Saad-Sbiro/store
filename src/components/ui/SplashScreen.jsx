import { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setLeaving(true), 950);
    const hideTimer = window.setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1850);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, [onComplete]);

  useEffect(() => {
    if (!visible) return undefined;

    document.documentElement.classList.add('voidstore-splash-lock');
    return () => document.documentElement.classList.remove('voidstore-splash-lock');
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`voidstore-splash ${leaving ? 'voidstore-splash--leave' : ''}`}
      aria-label="Welcome"
      role="status"
    >
      <div className="voidstore-splash__mark">
        <span className="voidstore-splash__logo">Welcome</span>
      </div>
    </div>
  );
}
