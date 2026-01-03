'use client';

import Link from 'next/link';
import AmbassadorStatusBadge from './AmbassadorStatusBadge';

interface AmbassadorCardProps {
  ambassador: {
    id: string;
    full_name: string;
    city: string;
    region: string;
    application_status: string;
    profile_image_url?: string | null;
    created_at: string;
  };
}

export default function AmbassadorCard({ ambassador }: AmbassadorCardProps) {
  const displayName = ambassador.full_name || 'Unknown';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const location = `${ambassador.city}, ${ambassador.region}`;
  const appliedDate = new Date(ambassador.created_at).toLocaleDateString();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Profile Photo */}
        <div className="flex-shrink-0">
          {ambassador.profile_image_url ? (
            <img 
              src={ambassador.profile_image_url} 
              alt={displayName} 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {initials}
              </span>
            </div>
          )}
        </div>

        {/* Ambassador Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 text-lg truncate">{displayName}</h3>
            <AmbassadorStatusBadge status={ambassador.application_status} className="flex-shrink-0" />
          </div>
          
          <div className="space-y-1 text-sm text-gray-500">
            <p className="flex items-center gap-1">
              <span className="font-medium">Location:</span> {location}
            </p>
            <p className="flex items-center gap-1">
              <span className="font-medium">Applied:</span> {appliedDate}
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link 
          href={`/admin/ambassadors/${ambassador.id}`}
          className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

