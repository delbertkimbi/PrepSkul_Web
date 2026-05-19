'use client';

import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, User } from 'lucide-react';

export type LearnerPickerValue = {
  userId: string;
  fullName: string;
  email: string;
  userType: 'parent' | 'student';
} | null;

type Row = {
  id: string;
  fullName: string;
  email: string;
  userType: string;
};

export default function LearnerPicker({
  value,
  onChange,
  filterRole,
  label = 'Existing PrepSkul user *',
}: {
  value: LearnerPickerValue;
  onChange: (v: LearnerPickerValue) => void;
  /** 'parent' | 'student' | 'all' */
  filterRole?: 'parent' | 'student' | 'all';
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q });
        if (filterRole === 'parent') params.set('type', 'parent');
        else if (filterRole === 'student') params.set('type', 'learner');
        else params.set('type', 'all');
        const res = await fetch(`/api/admin/users/search?${params}`);
        const json = await res.json();
        if (!cancelled) {
          if (res.ok) {
            const filtered: Row[] = (json.users || []).filter((u: { userType?: string }) => {
              const t = String(u.userType || '').toLowerCase();
              if (filterRole === 'parent') return t === 'parent';
              if (filterRole === 'student') return t === 'learner' || t === 'student';
              return t === 'parent' || t === 'learner' || t === 'student';
            });
            setRows(filtered);
          } else {
            setRows([]);
          }
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
  }, [q, filterRole]);

  useEffect(() => {
    if (!open) return;
    setQ('');
  }, [open]);

  const selectedLabel = useMemo(() => {
    if (!value) return 'Search for the existing account by name or email';
    return `${value.fullName} — ${value.email}`;
  }, [value]);

  return (
    <div className="relative">
      <Label className="text-slate-700 font-medium">{label}</Label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-1 w-full flex items-center justify-between border border-[#1B2C4F]/20 bg-white px-3 py-2.5 text-left text-sm text-[#1B2C4F] hover:border-[#4A6FBF] rounded-md"
      >
        <span className={value ? 'font-medium' : 'text-slate-500'}>{selectedLabel}</span>
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-80 overflow-hidden border border-[#1B2C4F]/20 bg-white shadow-lg rounded-md">
          <div className="p-2 border-b border-slate-100">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type a name or email…"
              className="border-slate-200"
              autoFocus
            />
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {loading && <li className="px-3 py-2 text-sm text-slate-500">Searching…</li>}
            {!loading && rows.length === 0 && (
              <li className="px-3 py-2 text-sm text-slate-500">No matching account.</li>
            )}
            {rows.map((r) => {
              const t = String(r.userType || '').toLowerCase();
              const role: 'parent' | 'student' = t === 'parent' ? 'parent' : 'student';
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-slate-50 text-left"
                    onClick={() => {
                      onChange({
                        userId: r.id,
                        fullName: r.fullName,
                        email: r.email,
                        userType: role,
                      });
                      setOpen(false);
                    }}
                  >
                    <div className="h-9 w-9 rounded-full bg-[#1B2C4F]/10 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-[#1B2C4F]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#1B2C4F] truncate">{r.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{r.email}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{role}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
