'use client';

import { useState } from 'react';

interface ProfileImageProps {
  src: string;
  alt: string;
  fallbackInitial: string;
}

export default function ProfileImage({ src, alt, fallbackInitial }: ProfileImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="w-full h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
        <span className="text-6xl font-bold text-white">
          {fallbackInitial}
        </span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
      onError={() => setHasError(true)}
    />
  );
}
