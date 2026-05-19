'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { buildWhatsAppUrl } from '@/lib/services/admin-feedback-reply-engine';

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

type TutorReportSnippet = {
  attended?: boolean | null;
  topics_covered?: string | null;
  learner_engagement?: string | null;
  issues?: string | null;
} | null;

type Row = {
  id: string;
  createdAt: string;
  rating: number;
  comment: string;
  suggestedReply: string;
  whatsappLink: string | null;
  hasTutorReport: boolean;
  tutorReport: TutorReportSnippet;
  tutorName?: string | null;
  author: { full_name?: string; phone_number?: string; email?: string } | null;
  session: { id: string; subject?: string; scheduled_date?: string; scheduled_time?: string } | null;
};

export default function FeedbackInboxClient() {
  const { data, isLoading, mutate } = useSWR('/api/admin/feedback/inbox', fetcher, { refreshInterval: 30000 });
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');

  const generate = async (feedbackId: string, openWa = false) => {
    setStatus('');
    const res = await fetch('/api/admin/feedback/generate-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedbackId }),
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus(json.error || 'Could not generate reply');
      return;
    }
    setReplyMap((prev) => ({ ...prev, [feedbackId]: json.suggestedReply || '' }));
    if (openWa && json.whatsappLink) window.open(json.whatsappLink, '_blank', 'noopener,noreferrer');
    mutate();
  };

  const openWhatsApp = (row: Row) => {
    const reply = replyMap[row.id] || row.suggestedReply;
    const url = buildWhatsAppUrl(row.author?.phone_number, reply);
    if (!url) {
      setStatus('No phone number on file for this family.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Feedback Inbox</h1>
        <p className="text-sm text-gray-600 mt-1">
          Replies are tailored to what the family wrote and what the tutor reported. Edit before sending on WhatsApp or
          email.
        </p>
      </div>
      {status && <p className="text-sm text-red-600">{status}</p>}
      {isLoading && <p className="text-sm text-gray-500">Loading feedback...</p>}
      {!isLoading && (data?.rows || []).length === 0 && (
        <div className="bg-white border border-gray-200 p-5 rounded-lg text-sm text-gray-600">
          No feedback submitted yet.
        </div>
      )}
      <div className="space-y-3">
        {(data?.rows || []).map((row: Row) => {
          const reply = replyMap[row.id] || row.suggestedReply;
          return (
            <div key={row.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">{row.author?.full_name || 'Unknown learner'}</span>
                <span className="text-xs border border-gray-300 px-2 py-0.5 rounded-md">
                  Rating: {row.rating}/5
                </span>
                {row.session?.subject && (
                  <span className="text-xs text-gray-500">{row.session.subject}</span>
                )}
                <span className="text-xs text-gray-500">{new Date(row.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">{row.comment}</p>

              {row.hasTutorReport && row.tutorReport && (
                <div className="mt-3 border border-slate-200 bg-slate-50 p-3 rounded-lg text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-800">
                    Tutor report{row.tutorName ? ` (${row.tutorName})` : ''}
                  </p>
                  <p>Attended: {row.tutorReport.attended === false ? 'No' : row.tutorReport.attended ? 'Yes' : '—'}</p>
                  {row.tutorReport.topics_covered && <p>Topics: {row.tutorReport.topics_covered}</p>}
                  {row.tutorReport.learner_engagement && <p>Engagement: {row.tutorReport.learner_engagement}</p>}
                  {row.tutorReport.issues && <p>Issues noted: {row.tutorReport.issues}</p>}
                </div>
              )}

              <div className="mt-3 border border-[#1B2C4F]/15 bg-[#1B2C4F]/5 p-3 rounded-lg">
                <p className="text-xs font-semibold text-[#1B2C4F]">Suggested admin reply</p>
                <textarea
                  className="mt-2 w-full min-h-[140px] text-sm border border-slate-200 rounded-lg p-2.5 bg-white"
                  value={reply}
                  onChange={(e) => setReplyMap((prev) => ({ ...prev, [row.id]: e.target.value }))}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => generate(row.id, false)}
                  className="border border-gray-300 px-3 py-1.5 text-xs font-medium text-[#1B2C4F] hover:bg-gray-50 rounded-md"
                >
                  Regenerate reply
                </button>
                <button
                  type="button"
                  onClick={() => openWhatsApp(row)}
                  disabled={!row.author?.phone_number && !reply}
                  className="border border-emerald-600 bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 rounded-md disabled:opacity-50"
                >
                  Send via WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => generate(row.id, true)}
                  className="border border-gray-300 px-3 py-1.5 text-xs font-medium text-[#1B2C4F] hover:bg-gray-50 rounded-md"
                >
                  Regenerate & open WhatsApp
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
