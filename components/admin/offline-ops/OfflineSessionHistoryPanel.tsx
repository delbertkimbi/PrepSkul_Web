'use client';

import { useMemo } from 'react';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { displayBillingMonthLabel } from '@/lib/offline-month-utils';

export type OfflineSchedulingPeriodLite = {
  id: string;
  period_start?: string | null;
  period_end?: string | null;
  start_month_label?: string | null;
  operation_state?: string | null;
  is_historical_import?: boolean | null;
  subjects?: string[] | null;
  pay_per_month_xaf?: number | null;
};

export type SessionHistoryRow = {
  id: string;
  offline_scheduling_period_id?: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  duration_minutes: number | null;
  subject: string | null;
  status: string | null;
  tutorReport?: {
    attended?: boolean | null;
    topics_covered?: string | null;
    learner_engagement?: string | null;
    issues?: string | null;
    completed_at?: string | null;
  } | null;
  learnerFeedback?: {
    rating?: number | null;
    comment?: string | null;
    created_at?: string | null;
  } | null;
};

function formatWhen(date?: string | null, time?: string | null) {
  if (!date) return '—';
  const t = time ? time.slice(0, 5) : '';
  return t ? `${date} · ${t}` : date;
}

function humanStatus(status?: string | null) {
  const n = String(status || '').toLowerCase();
  if (n === 'pending_admin_review') return 'awaiting admin review';
  return n.replaceAll('_', ' ') || 'unknown';
}

function periodTitle(period: OfflineSchedulingPeriodLite | null, monthKey: string) {
  if (period) {
    return displayBillingMonthLabel(period.start_month_label, period.period_start);
  }
  if (monthKey && monthKey.length >= 7) {
    const [y, m] = monthKey.split('-').map(Number);
    if (y && m) return displayBillingMonthLabel(null, `${y}-${String(m).padStart(2, '0')}-01`);
  }
  return monthKey;
}

export default function OfflineSessionHistoryPanel({
  sessions,
  periods = [],
}: {
  sessions: SessionHistoryRow[];
  periods?: OfflineSchedulingPeriodLite[];
}) {
  const periodById = useMemo(() => new Map(periods.map((p) => [p.id, p])), [periods]);

  const groups = useMemo(() => {
    const byKey = new Map<
      string,
      { period: OfflineSchedulingPeriodLite | null; monthKey: string; sessions: SessionHistoryRow[] }
    >();

    for (const s of sessions) {
      const monthKey = (s.scheduled_date || '').slice(0, 7) || 'unknown';
      const period = s.offline_scheduling_period_id
        ? periodById.get(s.offline_scheduling_period_id) || null
        : null;
      const groupKey = period?.id || `month:${monthKey}`;
      if (!byKey.has(groupKey)) {
        byKey.set(groupKey, { period, monthKey, sessions: [] });
      }
      byKey.get(groupKey)!.sessions.push(s);
    }

    return [...byKey.values()]
      .map((g) => ({
        ...g,
        sessions: [...g.sessions].sort((a, b) => {
          const da = `${a.scheduled_date || ''} ${a.scheduled_time || ''}`;
          const db = `${b.scheduled_date || ''} ${b.scheduled_time || ''}`;
          return da.localeCompare(db);
        }),
      }))
      .sort((a, b) => {
        const da = a.period?.period_start || a.monthKey;
        const db = b.period?.period_start || b.monthKey;
        return da.localeCompare(db);
      });
  }, [sessions, periodById]);

  const evaluatedCount = sessions.filter((s) =>
    ['evaluated', 'completed'].includes(String(s.status || '').toLowerCase())
  ).length;
  const feedbackCount = sessions.filter((s) => s.learnerFeedback).length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="border-[#4A6FBF] text-[#1B2C4F]">
          <History className="h-4 w-4 mr-2" />
          Full session history
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1B2C4F]">Session history</DialogTitle>
          <DialogDescription>
            {sessions.length} session{sessions.length === 1 ? '' : 's'} · {evaluatedCount} evaluated ·{' '}
            {feedbackCount} with learner feedback
          </DialogDescription>
        </DialogHeader>

        {sessions.length === 0 ? (
          <p className="text-sm text-slate-600">No sessions linked to this matching yet.</p>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => {
              const title = periodTitle(group.period, group.monthKey);
              const state = group.period?.operation_state || '—';
              const historical = group.period?.is_historical_import;
              return (
                <section key={group.period?.id || group.monthKey} className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
                    <h3 className="font-semibold text-[#1B2C4F]">{title}</h3>
                    {historical && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                        historical import
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#4A6FBF]/10 text-[#1B2C4F] border border-[#4A6FBF]/20">
                      {state}
                    </span>
                    {group.period?.pay_per_month_xaf != null && (
                      <span className="text-xs text-slate-600">
                        {Number(group.period.pay_per_month_xaf).toLocaleString()} XAF / mo
                      </span>
                    )}
                    {group.period?.subjects?.length ? (
                      <span className="text-xs text-slate-500">{group.period.subjects.join(', ')}</span>
                    ) : null}
                  </div>

                  <ul className="space-y-3">
                    {group.sessions.map((s) => {
                      const tr = s.tutorReport;
                      const lf = s.learnerFeedback;
                      return (
                        <li
                          key={s.id}
                          className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 text-sm space-y-2"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-[#1B2C4F]">
                              {formatWhen(s.scheduled_date, s.scheduled_time)}
                            </span>
                            {s.subject && (
                              <span className="text-slate-600">· {s.subject}</span>
                            )}
                            <span className="text-xs uppercase px-2 py-0.5 rounded border bg-white">
                              {humanStatus(s.status)}
                            </span>
                          </div>

                          {tr && (
                            <div className="rounded-md bg-white border border-slate-200 p-2 space-y-1">
                              <p className="text-xs font-semibold text-slate-700">Tutor report</p>
                              <p>
                                Attended:{' '}
                                <strong>
                                  {tr.attended === true ? 'Yes' : tr.attended === false ? 'No' : '—'}
                                </strong>
                              </p>
                              {tr.topics_covered && (
                                <p>
                                  <span className="text-slate-600">Topics:</span> {tr.topics_covered}
                                </p>
                              )}
                              {tr.learner_engagement && (
                                <p>
                                  <span className="text-slate-600">Engagement:</span> {tr.learner_engagement}
                                </p>
                              )}
                              {tr.issues && (
                                <p>
                                  <span className="text-slate-600">Issues:</span> {tr.issues}
                                </p>
                              )}
                            </div>
                          )}

                          {lf ? (
                            <div className="rounded-md bg-white border border-[#4A6FBF]/20 p-2 space-y-1">
                              <p className="text-xs font-semibold text-[#4A6FBF]">Learner feedback</p>
                              {lf.rating != null && (
                                <p>
                                  Rating: <strong>{lf.rating}/5</strong>
                                </p>
                              )}
                              {lf.comment && <p className="text-slate-700">{lf.comment}</p>}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500">No learner feedback yet.</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
