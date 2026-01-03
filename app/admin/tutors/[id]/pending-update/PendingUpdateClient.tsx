'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PendingUpdateClientProps {
  tutorId: string;
  tutorUserId: string;
  pendingChanges: Record<string, any>;
  currentValues: Record<string, any>;
  singleField?: string; // If provided, only show buttons for this field
  fieldName?: string; // Human-readable field name for single field mode
}

export default function PendingUpdateClient({ 
  tutorId, 
  tutorUserId,
  pendingChanges,
  currentValues,
  singleField,
  fieldName
}: PendingUpdateClientProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle single field approval
  const handleApproveField = async (field: string) => {
    if (!confirm(`Are you sure you want to approve the change to "${fieldName || field}"?`)) {
      return;
    }

    setIsApproving(field);
    setError(null);

    try {
      const response = await fetch(`/api/admin/tutors/${tutorId}/pending-update/approve-field`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ field }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve field');
      }

      // Refresh the page to show updated state
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred while approving the field');
      setIsApproving(null);
    }
  };

  // Handle single field rejection
  const handleRejectField = async (field: string) => {
    const reason = prompt(`Please provide a reason for rejecting the change to "${fieldName || field}" (optional):`);
    
    if (reason === null) {
      // User cancelled
      return;
    }

    setIsRejecting(field);
    setError(null);

    try {
      const response = await fetch(`/api/admin/tutors/${tutorId}/pending-update/reject-field`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ field, reason: reason || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject field');
      }

      // Refresh the page to show updated state
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred while rejecting the field');
      setIsRejecting(null);
    }
  };

  // Handle approve all
  const handleApproveAll = async () => {
    if (!confirm('Are you sure you want to approve all pending changes? This will update the tutor\'s profile immediately.')) {
      return;
    }

    setIsApproving('all');
    setError(null);

    try {
      const response = await fetch(`/api/admin/tutors/${tutorId}/pending-update/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve changes');
      }

      // Redirect to tutor detail page
      router.push(`/admin/tutors/${tutorId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred while approving changes');
      setIsApproving(null);
    }
  };

  // Handle reject all
  const handleRejectAll = async () => {
    const reason = prompt('Please provide a reason for rejecting all changes (optional):');
    
    if (reason === null) {
      // User cancelled
      return;
    }

    setIsRejecting('all');
    setError(null);

    try {
      const response = await fetch(`/api/admin/tutors/${tutorId}/pending-update/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: reason || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject changes');
      }

      // Redirect to pending tutors page
      router.push('/admin/tutors');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred while rejecting changes');
      setIsRejecting(null);
    }
  };

  // Single field mode - show buttons for one field
  if (singleField) {
    return (
      <>
        {error && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
            {error}
          </div>
        )}
        <button
          onClick={() => handleApproveField(singleField)}
          disabled={isApproving === singleField || isRejecting === singleField}
          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isApproving === singleField ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Approving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Approve
            </>
          )}
        </button>
        <button
          onClick={() => handleRejectField(singleField)}
          disabled={isApproving === singleField || isRejecting === singleField}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isRejecting === singleField ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Rejecting...
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" />
              Reject
            </>
          )}
        </button>
      </>
    );
  }

  // All fields mode - show approve/reject all buttons
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleApproveAll}
            disabled={isApproving === 'all' || isRejecting === 'all'}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isApproving === 'all' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Approve All Changes
              </>
            )}
          </button>

          <button
            onClick={handleRejectAll}
            disabled={isApproving === 'all' || isRejecting === 'all'}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isRejecting === 'all' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                Reject All Changes
              </>
            )}
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-600">
          <strong>Note:</strong> You can approve or reject individual changes above, or use these buttons to approve/reject all changes at once.
        </p>
      </div>
    </div>
  );
}
