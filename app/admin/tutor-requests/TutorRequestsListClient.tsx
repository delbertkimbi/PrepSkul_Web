'use client';

import { useState } from 'react';
import Link from 'next/link';
// Date formatting helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

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

interface TutorRequestsListClientProps {
  initialRequests: TutorRequest[];
}

export default function TutorRequestsListClient({ initialRequests }: TutorRequestsListClientProps) {
  const [requests, setRequests] = useState<TutorRequest[]>(initialRequests);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'matched' | 'closed'>('all');

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter);

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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'urgent':
        return 'text-red-600 font-semibold';
      case 'normal':
        return 'text-blue-600';
      case 'flexible':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1 p-4">
          {(['all', 'pending', 'in_progress', 'matched', 'closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="divide-y divide-gray-200">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No tutor requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <Link
              key={request.id}
              href={`/admin/tutor-requests/${request.id}`}
              className="block p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`text-sm ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(request.created_at)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {request.requester_name || 'Unknown User'}
                    {request.requester_type && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({request.requester_type})
                      </span>
                    )}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Subjects:</span>{' '}
                      {request.subjects.join(', ')}
                    </div>
                    <div>
                      <span className="font-medium">Level:</span> {request.education_level}
                    </div>
                    <div>
                      <span className="font-medium">Teaching Mode:</span>{' '}
                      {request.teaching_mode.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium">Budget:</span>{' '}
                      {request.budget_min.toLocaleString()} - {request.budget_max.toLocaleString()} XAF/month
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {request.location}
                    </div>
                    <div>
                      <span className="font-medium">Schedule:</span>{' '}
                      {request.preferred_days.join(', ')} • {request.preferred_time}
                    </div>
                  </div>

                  {request.requester_phone && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Phone:</span> {request.requester_phone}
                    </div>
                  )}

                  {request.matched_tutor_id && (
                    <div className="mt-2 text-sm text-green-600">
                      ✅ Matched with tutor
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

