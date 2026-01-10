'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FlaggedMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  flags: any[];
  status: 'review' | 'approved' | 'blocked' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  action_taken?: string;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    user_type: string;
  };
  conversation?: {
    id: string;
    student_id: string;
    tutor_id: string;
  };
}

interface FlagsListClientProps {
  initialFlags: FlaggedMessage[];
}

export default function FlagsListClient({ initialFlags }: FlagsListClientProps) {
  const [flags, setFlags] = useState<FlaggedMessage[]>(initialFlags);
  const [filter, setFilter] = useState<'all' | 'review' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [selectedFlag, setSelectedFlag] = useState<FlaggedMessage | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionTaken, setActionTaken] = useState<string>('');
  const [isResolving, setIsResolving] = useState(false);
  const router = useRouter();

  const filteredFlags = flags.filter(flag => {
    if (filter === 'all') return true;
    if (filter === 'review') return flag.status === 'review';
    return flag.severity === filter;
  });

  const handleResolve = async (flagId: string, action: 'approve' | 'block' | 'resolve') => {
    setIsResolving(true);
    try {
      const response = await fetch('/api/admin/flagged-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flaggedMessageId: flagId,
          action,
          reviewNotes: resolutionNotes,
          actionTaken: actionTaken || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to resolve flag');
      }

      const { flaggedMessage } = await response.json();

      // Update local state
      setFlags(flags.map(flag =>
        flag.id === flagId ? flaggedMessage : flag
      ));

      setSelectedFlag(null);
      setResolutionNotes('');
      setActionTaken('');
      router.refresh();
    } catch (error: any) {
      console.error('Error resolving flag:', error);
      alert(`Failed to resolve flag: ${error.message}`);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      case 'resolved':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFlagTypes = (flags: any[]) => {
    if (!Array.isArray(flags)) return 'Unknown';
    return flags.map((f: any) => f.type || 'unknown').join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'review', 'critical', 'high', 'medium', 'low'] as const).map((filterOption) => (
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredFlags.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No flagged messages found
            </div>
          ) : (
            filteredFlags.map((flag) => (
              <div
                key={flag.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedFlag(flag)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(flag.severity)}`}>
                        {flag.severity}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(flag.status)}`}>
                        {flag.status}
                      </span>
                      {flag.action_taken && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          {flag.action_taken}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {flag.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        From: {flag.sender?.full_name || 'Unknown User'}
                      </span>
                      <span>
                        Flags: {getFlagTypes(flag.flags)}
                      </span>
                      <span>
                        {new Date(flag.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Resolution Modal */}
      {selectedFlag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Review Flagged Message</h2>
                <button
                  onClick={() => {
                    setSelectedFlag(null);
                    setResolutionNotes('');
                    setActionTaken('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sender
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedFlag.sender?.full_name || 'Unknown User'} ({selectedFlag.sender?.user_type || 'unknown'})
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message Content
                  </label>
                  <div className="p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedFlag.content}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detected Flags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedFlag.flags) && selectedFlag.flags.map((f: any, idx: number) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(f.severity || selectedFlag.severity)}`}
                      >
                        {f.type || 'unknown'}: {f.reason || 'No reason provided'}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action Taken
                  </label>
                  <select
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    <option value="warning">Warning</option>
                    <option value="mute_24h">Mute 24h</option>
                    <option value="mute_7d">Mute 7 days</option>
                    <option value="ban">Ban User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Notes
                  </label>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add notes about this review..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleResolve(selectedFlag.id, 'approve')}
                    disabled={isResolving}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve Message
                  </button>
                  <button
                    onClick={() => handleResolve(selectedFlag.id, 'block')}
                    disabled={isResolving}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Block Message
                  </button>
                  <button
                    onClick={() => handleResolve(selectedFlag.id, 'resolve')}
                    disabled={isResolving}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

