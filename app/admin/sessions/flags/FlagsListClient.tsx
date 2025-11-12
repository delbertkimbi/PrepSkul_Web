'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminFlag {
  id: string;
  session_id: string;
  session_type: 'trial' | 'recurring';
  flag_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  transcript_excerpt?: string;
  resolved: boolean;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
}

interface FlagsListClientProps {
  initialFlags: AdminFlag[];
}

export default function FlagsListClient({ initialFlags }: FlagsListClientProps) {
  const [flags, setFlags] = useState<AdminFlag[]>(initialFlags);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low' | 'unresolved'>('all');
  const [selectedFlag, setSelectedFlag] = useState<AdminFlag | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const router = useRouter();

  const filteredFlags = flags.filter(flag => {
    if (filter === 'all') return true;
    if (filter === 'unresolved') return !flag.resolved;
    return flag.severity === filter;
  });

  const handleResolve = async (flagId: string) => {
    setIsResolving(true);
    try {
      const response = await fetch(`/api/admin/flags/${flagId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionNotes }),
      });

      if (!response.ok) throw new Error('Failed to resolve flag');

      // Update local state
      setFlags(flags.map(flag =>
        flag.id === flagId
          ? { ...flag, resolved: true, resolved_at: new Date().toISOString(), resolution_notes: resolutionNotes }
          : flag
      ));

      setSelectedFlag(null);
      setResolutionNotes('');
      router.refresh();
    } catch (error) {
      console.error('Error resolving flag:', error);
      alert('Failed to resolve flag');
    } finally {
      setIsResolving(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getFlagTypeLabel = (flagType: string) => {
    return flagType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'unresolved', 'critical', 'high', 'medium', 'low'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === filterOption
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      {/* Flags List */}
      <div className="space-y-4">
        {filteredFlags.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No flags found</p>
          </div>
        ) : (
          filteredFlags.map((flag) => (
            <div
              key={flag.id}
              className={`bg-white rounded-lg border-2 p-6 ${
                flag.resolved
                  ? 'border-gray-200 opacity-60'
                  : flag.severity === 'critical'
                  ? 'border-red-300'
                  : flag.severity === 'high'
                  ? 'border-orange-300'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(
                        flag.severity
                      )}`}
                    >
                      {flag.severity.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600">
                      {getFlagTypeLabel(flag.flag_type)}
                    </span>
                    {flag.resolved && (
                      <span className="text-sm text-green-600 font-medium">✓ Resolved</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {flag.description}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Session: {flag.session_id} ({flag.session_type})
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(flag.created_at).toLocaleString()}
                  </p>
                </div>
                {!flag.resolved && (
                  <button
                    onClick={() => setSelectedFlag(flag)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Resolve
                  </button>
                )}
              </div>

              {flag.transcript_excerpt && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Transcript Excerpt:</p>
                  <p className="text-sm text-gray-800 italic">"{flag.transcript_excerpt}"</p>
                </div>
              )}

              {flag.resolved && flag.resolution_notes && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs font-semibold text-green-700 mb-2">Resolution Notes:</p>
                  <p className="text-sm text-green-800">{flag.resolution_notes}</p>
                  <p className="text-xs text-green-600 mt-2">
                    Resolved: {new Date(flag.resolved_at!).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Resolve Modal */}
      {selectedFlag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Resolve Flag</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Flag Type: {getFlagTypeLabel(selectedFlag.flag_type)}</p>
              <p className="text-sm text-gray-600 mb-2">Severity: {selectedFlag.severity}</p>
              <p className="text-sm text-gray-800">{selectedFlag.description}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Notes (Optional)
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Add notes about how this flag was resolved..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedFlag(null);
                  setResolutionNotes('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolve(selectedFlag.id)}
                disabled={isResolving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {isResolving ? 'Resolving...' : 'Resolve Flag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






