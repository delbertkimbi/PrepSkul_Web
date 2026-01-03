'use client';

interface AmbassadorStatusBadgeProps {
  status: string;
  className?: string;
}

export default function AmbassadorStatusBadge({ status, className = '' }: AmbassadorStatusBadgeProps) {
  const statusConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
    pending: { label: 'Pending', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
    approved: { label: 'Approved', bgColor: 'bg-green-100', textColor: 'text-green-800' },
    rejected: { label: 'Rejected', bgColor: 'bg-red-100', textColor: 'text-red-800' },
  };

  const config = statusConfig[status] || { label: status, bgColor: 'bg-gray-100', textColor: 'text-gray-800' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}>
      {config.label}
    </span>
  );
}

