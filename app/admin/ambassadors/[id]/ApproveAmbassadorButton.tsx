'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface ApproveAmbassadorButtonProps {
  ambassadorId: string;
  ambassadorEmail: string;
  ambassadorName: string;
}

export default function ApproveAmbassadorButton({ 
  ambassadorId, 
  ambassadorEmail, 
  ambassadorName 
}: ApproveAmbassadorButtonProps) {
  const router = useRouter();

  const handleApprove = () => {
    router.push(`/admin/ambassadors/${ambassadorId}/approve`);
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleApprove}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Approve Application
      </Button>
      <p className="text-xs text-gray-500">
        You'll be able to review and customize the approval email before sending
      </p>
    </div>
  );
}

