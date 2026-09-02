'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ClientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc: string;
  /**
   * Rendered width of the image, so Next.js can pick a sensibly sized source
   * instead of shipping the full-resolution original. Defaults to full width.
   */
  sizes?: string;
  priority?: boolean;
}

export default function ClientImage({
  src,
  alt,
  className,
  fallbackSrc,
  sizes = '100vw',
  priority = false,
}: ClientImageProps) {
  const [error, setError] = useState(false);

  // Fallbacks are inline data: URIs, which the image optimizer can't process.
  if (error) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={fallbackSrc} alt={alt} className={className} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
