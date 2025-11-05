'use client';

import { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const [hasError, setHasError] = useState(false);

  if (!videoUrl) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center text-gray-500">
          <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No video uploaded</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="relative w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-sm mb-2">Unable to load video</p>
          <a 
            href={videoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 hover:underline transition"
          >
            <ExternalLink className="w-4 h-4" />
            Open in new tab
          </a>
        </div>
      </div>
    );
  }

  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    const embedUrl = videoUrl.includes('youtube.com/watch') 
      ? videoUrl.replace('watch?v=', 'embed/')
      : videoUrl.includes('youtu.be')
      ? `https://www.youtube.com/embed/${videoUrl.split('/').pop()}`
      : videoUrl;

    return (
      <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
      <video
        src={videoUrl}
        controls
        className="w-full h-full"
        onError={() => setHasError(true)}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
