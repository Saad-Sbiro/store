import { useEffect, useState } from 'react';
import logoImg from '../../assets/logo.png';

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
      aria-label="Welcome"
      role="status"
    >
      <div className="cutportal-splash__mark flex flex-col items-center gap-4">
        <img src={logoImg} alt="Cutportal Logo" className="h-16 w-auto object-contain brightness-0 invert animate-pulse" draggable="false" />
        <span className="cutportal-splash__logo tracking-[0.2em] uppercase font-bold text-[14px]">Cutportal</span>
      </div>
    </div>
  );
}