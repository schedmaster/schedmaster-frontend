import Image from 'next/image';
import { BRAND_ICON_URL } from '../lib/brand';

type BrandLogoProps = Readonly<{
  variant?: 'horizontal' | 'full' | 'symbol' | 'wordmark';
  className?: string;
  eager?: boolean;
}>;

const ASSETS = {
  full: { src: '/brand/schedmaster-logo.svg', width: 760, height: 575 },
  symbol: { src: BRAND_ICON_URL, width: 421, height: 445 },
  wordmark: { src: '/brand/schedmaster-wordmark.svg', width: 760, height: 107 },
} as const;

export default function BrandLogo({
  variant = 'symbol',
  className = '',
  eager = false,
}: BrandLogoProps) {
  const parts = variant === 'horizontal' ? (['symbol', 'wordmark'] as const) : [variant];

  return (
    <span className={`sm-logo sm-logo--${variant} ${className}`} role="img" aria-label="SchedMaster">
      {parts.map((part) => (
        <Image
          key={part}
          {...ASSETS[part]}
          alt=""
          aria-hidden="true"
          className={`sm-logo__${part}`}
          loading={eager ? 'eager' : 'lazy'}
          unoptimized
        />
      ))}
    </span>
  );
}
