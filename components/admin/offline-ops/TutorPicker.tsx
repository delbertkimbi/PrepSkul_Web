'use client';

import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, User } from 'lucide-react';

export type TutorPickerValue = { tutorUserId: string; tutorName: string } | null;

type TutorRow = {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  location: string;
  subjects: string[];
};

export default function TutorPicker({
  value,
  onChange,
}: {
  value: TutorPickerValue;
  onChange: (v: TutorPickerValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [tutors, setTutors] = useState<TutorRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/tutors/picker?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (!cancelled) {
          if (res.ok) setTutors(json.tutors || []);
          else setTutors([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const t = setTimeout(load, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  useEffect(() => {
    if (!open) return;
    setQ('');
  }, [open]);

  const selectedLabel = useMemo(() => {
    if (!value) return 'Select a verified tutor';
    return value.tutorName;
  }, [value]);

  return (
    <div className="relative">
      <Label className="text-slate-700 font-medium">Matched tutor *</Label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-1 w-full flex items-center justify-between border border-[#1B2C4F]/20 bg-white px-3 py-2.5 text-left text-sm text-[#1B2C4F] hover:border-[#4A6FBF]"
      >
        <span className={value ? 'font-medium' : 'text-slate-500'}>{selectedLabel}</span>
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-72 overflow-hidden border border-[#1B2C4F]/20 bg-white shadow-lg">
          <div className="p-2 border-b border-slate-100">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or email"
              className="border-slate-200"
              autoFocus
            />
          </div>
          <ul className="max-h-56 overflow-y-auto">
            {loading && <li className="px-3 py-2 text-sm text-slate-500">Loading tutors…</li>}
            {!loading && tutors.length === 0 && (
              <li className="px-3 py-2 text-sm text-slate-500">No approved tutors found.</li>
            )}
            {tutors.map((t) => (
              <li key={t.userId}>
                <button
                  type="button"
                  className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-slate-50 text-left"
                  onClick={() => {
                    onChange({ tutorUserId: t.userId, tutorName: t.fullName });
                    setOpen(false);
                  }}
                >
                  {t.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-[#1B2C4F]/10 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-[#1B2C4F]" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-[#1B2C4F] truncate">{t.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{t.email}</p>
                    {t.location && <p className="text-xs text-slate-400 truncate">{t.location}</p>}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
