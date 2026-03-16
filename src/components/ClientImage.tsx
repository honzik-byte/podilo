'use client';

import { useState } from 'react';

interface ClientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc: string;
}

export default function ClientImage({ src, alt, className, fallbackSrc }: ClientImageProps) {
  const [error, setError] = useState(false);

  return (
    <img 
      src={error ? fallbackSrc : src} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
    />
  );
}
