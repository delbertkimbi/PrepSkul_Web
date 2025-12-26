'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TutorRequest {
  id: string;
  requester_id: string;
  requester_name: string | null;
  requester_phone: string | null;
  requester_type: string | null;
  subjects: string[];
  education_level: string;
  specific_requirements: string | null;
  teaching_mode: string;
  budget_min: number;
  budget_max: number;
  tutor_gender: string | null;
  tutor_qualification: string | null;
  preferred_days: string[];
  preferred_time: string;
  location: string;
  urgency: string;
  additional_notes: string | null;
  status: 'pending' | 'in_progress' | 'matched' | 'closed';
  matched_tutor_id: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string | null;
  matched_at: string | null;
}

interface Tutor {
  id: string;
  user_id: string;
  subjects?: string[];
  teaching_mode?: string;
  teaching_modes?: string[];
  hourly_rate?: number | string;
  location?: string;
  bio?: string;
  status: string;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
  };
}

interface TutorMatchingClientProps {
  request: TutorRequest;
  matchingTutors: Tutor[];
  suggestedTutors: Tutor[];
}

export default function TutorMatchingClient({ 
  request, 
  matchingTutors, 
  suggestedTutors 
}: TutorMatchingClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(request.status);
  const [adminNotes, setAdminNotes] = useState(request.admin_notes || '');
  const [selectedTutorId, setSelectedTutorId] = useState(request.matched_tutor_id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/tutor-requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          admin_notes: adminNotes,
          matched_tutor_id: selectedTutorId || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update request');
      }

      setStatus(newStatus);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTutor = async (tutorId: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/tutor-requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'matched',
          matched_tutor_id: tutorId,
          matched_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign tutor');
      }

      setSelectedTutorId(tutorId);
      setStatus('matched');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to assign tutor');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'matched':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPrice = (price: number | string | undefined) => {
    if (!price) return 'Not specified';
    const num = typeof price === 'string' ? parseInt(price.replace(/[^0-9]/g, '')) : price;
    return `${num.toLocaleString()} XAF`;
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Request Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
            {status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Requester Information</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Name:</span> {request.requester_name || 'Not provided'}</p>
              <p><span className="font-medium">Phone:</span> {request.requester_phone || 'Not provided'}</p>
              <p><span className="font-medium">Type:</span> {request.requester_type || 'Not specified'}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Learning Requirements</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Subjects:</span> {request.subjects.join(', ')}</p>
              <p><span className="font-medium">Level:</span> {request.education_level}</p>
              {request.specific_requirements && (
                <p><span className="font-medium">Requirements:</span> {request.specific_requirements}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Tutor Preferences</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Teaching Mode:</span> {request.teaching_mode.toUpperCase()}</p>
              <p><span className="font-medium">Budget:</span> {request.budget_min.toLocaleString()} - {request.budget_max.toLocaleString()} XAF/month</p>
              {request.tutor_gender && (
                <p><span className="font-medium">Gender:</span> {request.tutor_gender}</p>
              )}
              {request.tutor_qualification && (
                <p><span className="font-medium">Qualification:</span> {request.tutor_qualification}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Schedule & Location</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Days:</span> {request.preferred_days.join(', ')}</p>
              <p><span className="font-medium">Time:</span> {request.preferred_time}</p>
              <p><span className="font-medium">Location:</span> {request.location}</p>
              <p><span className="font-medium">Urgency:</span> <span className={request.urgency === 'urgent' ? 'text-red-600 font-semibold' : ''}>{request.urgency.toUpperCase()}</span></p>
            </div>
          </div>
        </div>

        {request.additional_notes && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Additional Notes</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.additional_notes}</p>
          </div>
        )}

        {/* Admin Notes */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Notes
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add notes about this request..."
          />
        </div>

        {/* Status Actions */}
        <div className="mt-6 flex gap-3">
          {status !== 'in_progress' && (
            <button
              onClick={() => handleStatusUpdate('in_progress')}
              disabled={loading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
            >
              Mark In Progress
            </button>
          )}
          {status !== 'closed' && (
            <button
              onClick={() => handleStatusUpdate('closed')}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Close Request
            </button>
          )}
        </div>
      </div>

      {/* Matching Tutors */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Matching Tutors ({matchingTutors.length})
        </h2>

        {matchingTutors.length === 0 ? (
          <p className="text-gray-500 text-sm">No perfect matches found. See suggested tutors below.</p>
        ) : (
          <div className="space-y-4">
            {matchingTutors.map((tutor) => (
              <div
                key={tutor.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {tutor.profiles?.full_name || 'Unknown Tutor'}
                      </h3>
                      {selectedTutorId === tutor.id && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          ASSIGNED
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <p><span className="font-medium">Subjects:</span> {(tutor.subjects || []).join(', ') || 'Not specified'}</p>
                      <p><span className="font-medium">Rate:</span> {formatPrice(tutor.hourly_rate)}</p>
                      <p><span className="font-medium">Email:</span> {tutor.profiles?.email || 'Not provided'}</p>
                      <p><span className="font-medium">Phone:</span> {tutor.profiles?.phone_number || 'Not provided'}</p>
                    </div>
                    {tutor.bio && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tutor.bio}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Link
                      href={`/admin/tutors/${tutor.user_id}`}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50"
                    >
                      View Profile
                    </Link>
                    {selectedTutorId !== tutor.id && (
                      <button
                        onClick={() => handleAssignTutor(tutor.id)}
                        disabled={loading}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Assign Tutor
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Tutors */}
      {suggestedTutors.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Suggested Tutors ({suggestedTutors.length})
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            These tutors partially match the requirements. Consider them if no perfect matches are available.
          </p>

          <div className="space-y-4">
            {suggestedTutors.map((tutor) => (
              <div
                key={tutor.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-yellow-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {tutor.profiles?.full_name || 'Unknown Tutor'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <p><span className="font-medium">Subjects:</span> {(tutor.subjects || []).join(', ') || 'Not specified'}</p>
                      <p><span className="font-medium">Rate:</span> {formatPrice(tutor.hourly_rate)}</p>
                      <p><span className="font-medium">Email:</span> {tutor.profiles?.email || 'Not provided'}</p>
                      <p><span className="font-medium">Phone:</span> {tutor.profiles?.phone_number || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Link
                      href={`/admin/tutors/${tutor.user_id}`}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => handleAssignTutor(tutor.id)}
                      disabled={loading}
                      className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                    >
                      Assign Anyway
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Tutors Found */}
      {matchingTutors.length === 0 && suggestedTutors.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">No Matching Tutors Found</h3>
          <p className="text-yellow-700 text-sm mb-4">
            No tutors in the database match this request. Consider:
          </p>
          <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
            <li>Contacting tutors outside the platform</li>
            <li>Expanding search criteria</li>
            <li>Contacting the requester to adjust requirements</li>
          </ul>
        </div>
      )}
    </div>
  );
}



