import { useEffect, useState } from 'react';
import BrandLogo from './BrandLogo';

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

    document.documentElement.classList.add('cutportal-splash-lock');
    return () => document.documentElement.classList.remove('cutportal-splash-lock');
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`cutportal-splash ${leaving ? 'cutportal-splash--leave' : ''}`}
      aria-label="مرحباً بكم في زادي"
      role="status"
    >
      <div className="cutportal-splash__mark flex flex-col items-center">
        <BrandLogo inverse size="lg" className="animate-pulse" />
      </div>
    </div>
  );
}
