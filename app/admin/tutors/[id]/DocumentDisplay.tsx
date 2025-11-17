'use client';

import { Download, FileText } from 'lucide-react';
import { useState } from 'react';

interface DocumentDisplayProps {
  url: string;
  title: string;
}

export default function DocumentDisplay({ url, title }: DocumentDisplayProps) {
  const [imageError, setImageError] = useState(false);

  // Helper function to detect file type from URL
  const getFileType = (url: string): 'image' | 'pdf' | 'word' | 'other' => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)) return 'image';
    if (lowerUrl.match(/\.pdf$/)) return 'pdf';
    if (lowerUrl.match(/\.(doc|docx)$/)) return 'word';
    return 'other';
  };

  const fileType = getFileType(url);

  if (fileType === 'image' && !imageError) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <p className="text-sm font-medium text-gray-700 mb-3">{title}</p>
        <div className="relative w-full max-w-2xl bg-white rounded-lg border border-gray-200 overflow-hidden">
          <img 
            src={url} 
            alt={title}
            className="w-full h-auto max-h-96 object-contain rounded-lg"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <Download size={16} />
          Download {title}
        </a>
      </div>
    );
  }

  // For PDFs, Word docs, and other files, or if image failed to load
  const handleFileClick = () => {
    if (fileType === 'pdf') {
      // Open PDF in new tab
      window.open(url, '_blank');
    } else if (fileType === 'word') {
      // For Word docs, try to open in appropriate viewer
      window.open(url, '_blank');
    } else {
      // For other files, download or open in new tab
      window.open(url, '_blank');
    }
  };

  return (
    <button
      onClick={handleFileClick}
      className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left"
    >
      <FileText className="text-blue-600 flex-shrink-0" size={20} />
      <span className="flex-1 font-medium text-gray-900">{title}</span>
      <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
        {fileType === 'pdf' ? 'PDF' : fileType === 'word' ? 'Word' : 'File'}
      </span>
      <Download className="text-gray-400 flex-shrink-0" size={18} />
    </button>
  );
}
