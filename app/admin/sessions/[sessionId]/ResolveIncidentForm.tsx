'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ResolveIncidentForm({ incidentId }: { incidentId: string }) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResolve = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('safety_incidents')
        .update({
          resolved: true,
          resolved_by: user?.id ?? null,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes || null,
        })
        .eq('id', incidentId);

      if (error) throw error;
      router.refresh();
    } catch (e) {
      console.error('Resolve incident error:', e);
      alert('Failed to resolve. You may need to be an admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shrink-0 flex flex-col gap-2 items-end">
      <input
        type="text"
        placeholder="Resolution notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm w-48"
      />
      <button
        onClick={handleResolve}
        disabled={loading}
        className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Resolving...' : 'Mark resolved'}
      </button>
    </div>
  );
}
