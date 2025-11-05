'use client';

interface TutorStatusBadgeProps {
  status: string;
  isHidden?: boolean;
  className?: string;
}

export default function TutorStatusBadge({ status, isHidden = false, className = '' }: TutorStatusBadgeProps) {
  // If hidden, show hidden badge regardless of status
  if (isHidden) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
        Hidden
      </span>
    );
  }

  const statusConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
    pending: { label: 'Pending', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
    approved: { label: 'Approved', bgColor: 'bg-green-100', textColor: 'text-green-800' },
    rejected: { label: 'Rejected', bgColor: 'bg-red-100', textColor: 'text-red-800' },
    needs_improvement: { label: 'Needs Improvement', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
    suspended: { label: 'Blocked', bgColor: 'bg-black', textColor: 'text-white' },
  };

  const config = statusConfig[status] || { label: status, bgColor: 'bg-gray-100', textColor: 'text-gray-800' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}>
      {config.label}
    </span>
  );
}
