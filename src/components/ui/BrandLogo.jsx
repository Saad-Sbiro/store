import clsx from 'clsx';

import symbolLogo from '../../assets/logozadi_noback.png';
import wordmarkLogo from '../../assets/zadinoback.png';

const sizeClasses = {
  sm: {
    symbolFrame: 'h-7 w-6',
    symbolImage: 'h-10 w-10',
    wordmarkFrame: 'h-7 w-12',
    wordmarkImage: 'h-14 w-14',
  },
  md: {
    symbolFrame: 'h-9 w-8',
    symbolImage: 'h-[52px] w-[52px]',
    wordmarkFrame: 'h-9 w-16',
    wordmarkImage: 'h-[76px] w-[76px]',
  },
  lg: {
    symbolFrame: 'h-16 w-14',
    symbolImage: 'h-24 w-24',
    wordmarkFrame: 'h-16 w-28',
    wordmarkImage: 'h-32 w-32',
  },
};

export default function BrandLogo({
  compact = false,
  inverse = false,
  size = 'md',
  className,
}) {
  const dimensions = sizeClasses[size] || sizeClasses.md;
  const imageFilter = inverse ? 'brightness-0 invert' : '';

  return (
    <span
      role="img"
      aria-label="زادي"
      className={clsx('inline-flex shrink-0 items-center gap-1', className)}
    >
      <span className={clsx('relative block shrink-0 overflow-hidden', dimensions.symbolFrame)}>
        <img
          src={symbolLogo}
          alt=""
          aria-hidden="true"
          draggable="false"
          className={clsx(
            'absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 object-contain',
            dimensions.symbolImage,
            imageFilter
          )}
        />
      </span>

      {!compact && (
        <span className={clsx('relative block shrink-0 translate-y-[4px] overflow-hidden', dimensions.wordmarkFrame)}>
          <img
            src={wordmarkLogo}
            alt=""
            aria-hidden="true"
            draggable="false"
            className={clsx(
              'absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 object-contain',
              dimensions.wordmarkImage,
              imageFilter
            )}
          />
        </span>
      )}
    </span>
  );
}
