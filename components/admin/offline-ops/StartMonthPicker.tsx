'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { monthYearOptions } from '@/lib/offline-month-utils';

export type StartMonthValue = { month: number; year: number };

export default function StartMonthPicker({
  value,
  onChange,
  label = 'Start month *',
}: {
  value: StartMonthValue;
  onChange: (v: StartMonthValue) => void;
  label?: string;
}) {
  const { months, years } = monthYearOptions(3, 1);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label>{label}</Label>
        <Select
          value={String(value.month)}
          onValueChange={(v) => onChange({ ...value, month: Number(v) })}
        >
          <SelectTrigger className="mt-1 border-[#1B2C4F]/20">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Year *</Label>
        <Select
          value={String(value.year)}
          onValueChange={(v) => onChange({ ...value, year: Number(v) })}
        >
          <SelectTrigger className="mt-1 border-[#1B2C4F]/20">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
