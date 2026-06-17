import clsx from 'clsx';

export default function RingLoader({ className = '' }) {
  return (
    <svg className={clsx('ring-loader', className)} width="240" height="240" viewBox="0 0 240 240" aria-hidden="true">
      <circle className="ring-loader__ring ring-loader__ring--a" cx="120" cy="120" r="105" fill="none" strokeWidth="20" strokeDasharray="0 660" strokeDashoffset="-330" strokeLinecap="round" />
      <circle className="ring-loader__ring ring-loader__ring--b" cx="120" cy="120" r="35" fill="none" strokeWidth="20" strokeDasharray="0 220" strokeDashoffset="-110" strokeLinecap="round" />
      <circle className="ring-loader__ring ring-loader__ring--c" cx="85" cy="120" r="70" fill="none" strokeWidth="20" strokeDasharray="0 440" strokeLinecap="round" />
      <circle className="ring-loader__ring ring-loader__ring--d" cx="155" cy="120" r="70" fill="none" strokeWidth="20" strokeDasharray="0 440" strokeLinecap="round" />
    </svg>
  );
}
