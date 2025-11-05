'use client';

import Link from 'next/link';
import { CheckCircle, XCircle, AlertCircle, Eye, EyeOff, Ban, Settings } from 'lucide-react';

interface ActionButtonsProps {
  tutorId: string;
  status: string;
  isHidden?: boolean;
}

export default function ActionButtons({ tutorId, status, isHidden }: ActionButtonsProps) {
  // For PENDING tutors
  if (status === 'pending' || status === 'needs_improvement') {
    return (
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
        <Link
          href={`/admin/tutors/${tutorId}/approve/rating-pricing`}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <CheckCircle className="w-5 h-5" />
          Approve Tutor
        </Link>
        <Link
          href={`/admin/tutors/${tutorId}/improve/reasons`}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
        >
          <AlertCircle className="w-5 h-5" />
          Request Improvements
        </Link>
        <Link
          href={`/admin/tutors/${tutorId}/reject/reasons`}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          <XCircle className="w-5 h-5" />
          Reject Application
        </Link>
      </div>
    );
  }

  // For APPROVED tutors
  if (status === 'approved' && !isHidden) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
        <Link
          href={`/admin/tutors/${tutorId}/approve/rating-pricing`}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Settings className="w-5 h-5" />
          Edit Rating/Pricing
        </Link>
        <Link
          href={`/admin/tutors/${tutorId}/hide`}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          <EyeOff className="w-5 h-5" />
          Hide Tutor
        </Link>
        <Link
          href={`/admin/tutors/${tutorId}/block`}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          <Ban className="w-5 h-5" />
          Block Tutor
        </Link>
      </div>
    );
  }

  // For APPROVED but HIDDEN tutors
  if (status === 'approved' && isHidden) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
        <Link
          href={`/admin/tutors/${tutorId}/unhide`}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <Eye className="w-5 h-5" />
          Unhide Tutor
        </Link>
        <Link
          href={`/admin/tutors/${tutorId}/approve/rating-pricing`}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Settings className="w-5 h-5" />
          Edit Rating/Pricing
        </Link>
        <Link
          href={`/admin/tutors/${tutorId}/block`}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          <Ban className="w-5 h-5" />
          Block Tutor
        </Link>
      </div>
    );
  }

  // For REJECTED tutors
  if (status === 'rejected') {
    return (
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
        <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium">
          Status: Rejected
        </div>
        <Link
          href={`/admin/tutors/${tutorId}/approve/rating-pricing`}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <CheckCircle className="w-5 h-5" />
          Restore & Approve
        </Link>
      </div>
    );
  }

  // For SUSPENDED/BLOCKED tutors
  if (status === 'suspended') {
    return (
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
        <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-lg font-medium">
          Status: Blocked
        </div>
      </div>
    );
  }

  return null;
}
