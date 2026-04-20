'use client';

import useSWR from 'swr';
import { useState } from 'react';

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

type Row = {
  id: string;
  createdAt: string;
  rating: number;
  comment: string;
  suggestedReply: string;
  whatsappLink: string | null;
  author: { full_name?: string; phone_number?: string; email?: string } | null;
  session: { id: string; subject?: string; scheduled_date?: string; scheduled_time?: string } | null;
};

export default function FeedbackInboxClient() {
  const { data, isLoading, mutate } = useSWR('/api/admin/feedback/inbox', fetcher, { refreshInterval: 30000 });
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});

  const generate = async (feedbackId: string) => {
    const res = await fetch('/api/admin/feedback/generate-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedbackId }),
    });
    const json = await res.json();
    if (!res.ok) return;
    setReplyMap((prev) => ({ ...prev, [feedbackId]: json.suggestedReply || '' }));
    if (json.whatsappLink) window.open(json.whatsappLink, '_blank');
    mutate();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Feedback Inbox</h1>
        <p className="text-sm text-gray-600 mt-1">
          Review session feedback, generate recommended replies, and open WhatsApp with preloaded messages.
        </p>
      </div>
      {isLoading && <p className="text-sm text-gray-500">Loading feedback...</p>}
      {(!isLoading && (data?.rows || []).length === 0) && (
        <div className="bg-white border border-gray-200 p-5 rounded-none text-sm text-gray-600">
          No feedback submitted yet.
        </div>
      )}
      <div className="space-y-3">
        {(data?.rows || []).map((row: Row) => {
          const reply = replyMap[row.id] || row.suggestedReply;
          return (
            <div key={row.id} className="bg-white border border-gray-200 rounded-none p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">{row.author?.full_name || 'Unknown learner'}</span>
                <span className="text-xs border border-gray-300 px-2 py-0.5 rounded-none">Rating: {row.rating}/5</span>
                <span className="text-xs text-gray-500">{new Date(row.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">{row.comment}</p>
              <div className="mt-3 border border-gray-200 bg-gray-50 p-3 rounded-none">
                <p className="text-xs font-semibold text-gray-700">Suggested reply</p>
                <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{reply || 'No suggestion yet'}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => generate(row.id)}
                  className="border border-gray-300 px-3 py-1.5 text-xs font-medium text-[#1B2C4F] hover:bg-gray-50 rounded-none"
                >
                  Generate + Open WhatsApp
                </button>
                {row.whatsappLink && (
                  <a
                    href={row.whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-gray-300 px-3 py-1.5 text-xs font-medium text-[#1B2C4F] hover:bg-gray-50 rounded-none"
                  >
                    Open WhatsApp
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

