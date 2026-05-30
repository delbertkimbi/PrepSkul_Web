'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

export type KycDoc = {
  label: string;
  url: string | null;
};

function DocTile({ label, url }: { label: string; url: string }) {
  const [error, setError] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
      <p className="px-3 py-2 text-sm font-medium text-gray-700 border-b border-gray-200 bg-white">
        {label}
      </p>
      <div className="p-2 bg-white">
        {!error ? (
          <a href={url} target="_blank" rel="noreferrer" className="block">
            <img
              src={url}
              alt={label}
              className="w-full max-h-80 object-contain rounded-md bg-gray-100"
              onError={() => setError(true)}
            />
          </a>
        ) : (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-12 text-sm text-indigo-600 hover:underline"
          >
            <ExternalLink size={16} />
            Open {label}
          </a>
        )}
      </div>
      <div className="px-3 py-2 border-t border-gray-100">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-indigo-600 hover:underline"
        >
          Open full size
        </a>
      </div>
    </div>
  );
}

export default function KycDocumentGallery({ docs }: { docs: KycDoc[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {docs.map((doc) =>
        doc.url ? (
          <DocTile key={doc.label} label={doc.label} url={doc.url} />
        ) : (
          <div
            key={doc.label}
            className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500"
          >
            {doc.label} — not provided
          </div>
        )
      )}
    </div>
  );
}
