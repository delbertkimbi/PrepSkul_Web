'use client';

import Link from 'next/link';
import TutorStatusBadge from './TutorStatusBadge';

interface TutorCardProps {
  tutor: {
    id: string;
    profile_photo_url?: string | null;
    profiles?: {
      full_name?: string;
      phone_number?: string;
    } | null;
    tutoring_areas?: string[] | null;
    city?: string | null;
    teaching_duration?: string | null;
    status: string;
    is_hidden?: boolean;
    created_at: string;
  };
}

export default function TutorCard({ tutor }: TutorCardProps) {
  const displayName = tutor.profiles?.full_name || 'Unknown';
  const initials = displayName.charAt(0).toUpperCase();
  const subjects = Array.isArray(tutor.tutoring_areas) 
    ? tutor.tutoring_areas.join(', ') 
    : 'No subjects listed';
  const location = tutor.city || 'Location not specified';
  const experience = tutor.teaching_duration || 'Less than 1 year';
  const appliedDate = new Date(tutor.created_at).toLocaleDateString();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Profile Photo */}
        <div className="flex-shrink-0">
          {tutor.profile_photo_url ? (
            <img 
              src={tutor.profile_photo_url} 
              alt={displayName} 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {initials}
              </span>
            </div>
          )}
        </div>

        {/* Tutor Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 text-lg truncate">{displayName}</h3>
            <TutorStatusBadge status={tutor.status} isHidden={tutor.is_hidden} className="flex-shrink-0" />
          </div>
          
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{subjects}</p>
          
          <div className="space-y-1 text-sm text-gray-500">
            <p className="flex items-center gap-1">
              <span className="font-medium">Location:</span> {location}
            </p>
            <p className="flex items-center gap-1">
              <span className="font-medium">Experience:</span> {experience}
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
          href={`/admin/tutors/${tutor.id}`}
          className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
