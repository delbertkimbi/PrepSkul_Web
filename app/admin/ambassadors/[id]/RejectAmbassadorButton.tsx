'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

interface RejectAmbassadorButtonProps {
  ambassadorId: string;
  ambassadorName: string;
}

export default function RejectAmbassadorButton({ 
  ambassadorId, 
  ambassadorName 
}: RejectAmbassadorButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReject = async () => {
    if (!confirm(`Are you sure you want to reject and delete ${ambassadorName}'s application? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!ambassadorId) {
        setError('Invalid ambassador ID');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/ambassadors/${ambassadorId}/reject`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        setError(`Failed to parse server response. Status: ${response.status}`);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errorMessage = data.details 
          ? `${data.error || 'Failed to reject ambassador'}: ${data.details}`
          : data.error || data.message || 'Failed to reject ambassador';
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (data.success) {
        router.push(`/admin/ambassadors?success=rejected&id=${ambassadorId}`);
        router.refresh();
      } else {
        setError(data.error || 'Failed to reject ambassador');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Reject ambassador error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleReject}
        disabled={loading}
        variant="destructive"
        className="w-full"
      >
        <XCircle className="w-4 h-4 mr-2" />
        {loading ? 'Rejecting...' : 'Reject & Delete Application'}
      </Button>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      <p className="text-xs text-gray-500">
        This will permanently delete the application from the system
      </p>
    </div>
  );
}

