'use client';

import { useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X } from 'lucide-react';

export default function VenuePhotoUpload({
  value,
  onChange,
  uploadUrl = '/api/admin/offline-ops/upload-venue-photo',
}: {
  value: string;
  onChange: (url: string) => void;
  uploadUrl?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPEG, PNG, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(uploadUrl, { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.hint ? `${json.error} — ${json.hint}` : json.error || 'Upload failed');
      }
      if (json.url) onChange(json.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-slate-700 font-medium">Venue photo (KYC)</Label>
      <p className="text-xs text-slate-500">Upload a photo of the teaching venue for onsite/hybrid periods.</p>

      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Venue"
            className="h-28 w-auto max-w-full rounded-md border border-[#1B2C4F]/20 object-cover"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute top-1 right-1 h-7 w-7 p-0 bg-white/90"
            onClick={() => onChange('')}
            aria-label="Remove photo"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="border-[#1B2C4F]/25"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {uploading ? 'Uploading…' : value ? 'Replace photo' : 'Upload photo'}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
            Remove
          </Button>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
