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
    let embedUrl = videoUrl;
    let videoId = '';

    // Handle different YouTube URL formats
    if (videoUrl.includes('youtube.com/watch')) {
      // Extract video ID from watch URL (handles params like ?v=VIDEO_ID&other=params)
      const match = videoUrl.match(/[?&]v=([^&]+)/);
      videoId = match ? match[1] : '';
      embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : embedUrl;
    } else if (videoUrl.includes('youtu.be/')) {
      // Handle short youtu.be links
      const parts = videoUrl.split('youtu.be/');
      videoId = parts[1] ? parts[1].split('?')[0].split('&')[0] : '';
      embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : embedUrl;
    } else if (videoUrl.includes('youtube.com/embed/')) {
      // Already an embed URL
      embedUrl = videoUrl;
    } else if (videoUrl.includes('youtube.com/v/')) {
      // Handle v/ format
      const match = videoUrl.match(/\/v\/([^?&]+)/);
      videoId = match ? match[1] : '';
      embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : embedUrl;
    } else {
      // Fallback: try to extract any potential video ID
      const match = videoUrl.match(/(?:youtube\.com\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      videoId = match ? match[1] : '';
      embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : embedUrl;
    }

    // If we couldn't extract a valid embed URL, show error
    if (!embedUrl || (!embedUrl.includes('embed/') && !videoId)) {
      return (
        <div className="relative w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-sm mb-2">Unable to parse YouTube URL</p>
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

    return (
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <video
        src={videoUrl}
        controls
        className="absolute top-0 left-0 w-full h-full rounded-lg bg-black"
        onError={() => setHasError(true)}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
