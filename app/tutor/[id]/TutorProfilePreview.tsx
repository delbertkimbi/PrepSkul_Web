'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, BookOpen, Clock, CheckCircle, Download, ExternalLink } from 'lucide-react';

interface TutorProfilePreviewProps {
  tutor: any;
  profile: {
    full_name: string;
    avatar_url: string | null;
    email: string | null;
    phone_number: string | null;
  };
  isAuthenticated: boolean;
  userRole: string | null;
  tutorId: string;
}

export default function TutorProfilePreview({
  tutor,
  profile,
  isAuthenticated,
  userRole,
  tutorId,
}: TutorProfilePreviewProps) {
  const [imageError, setImageError] = useState(false);

  const tutorName = profile.full_name || 'Tutor';
  const tutorAvatar = profile.avatar_url;
  const subjects = tutor.subjects as string[] | string | null;
  const subjectsArray = Array.isArray(subjects) 
    ? subjects 
    : (typeof subjects === 'string' ? [subjects] : []);
  const bio = tutor.bio as string | null;
  const location = tutor.location as string | null;
  const hourlyRate = tutor.hourly_rate as number | null;
  const rating = tutor.rating as number | null;
  const totalReviews = tutor.total_reviews as number | null;
  const isVerified = tutor.is_verified as boolean | null;

  // Determine if user can book this tutor
  const canBook = isAuthenticated && (userRole === 'student' || userRole === 'learner' || userRole === 'parent');
  const isTutor = userRole === 'tutor';

  // Deep link URLs
  const appDeepLink = `prepskul://tutor/${tutorId}`;
  const webUrl = `https://app.prepskul.com/tutor/${tutorId}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="https://app.prepskul.com" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">PrepSkul</span>
            </Link>
            {!isAuthenticated && (
              <div className="flex items-center space-x-4">
                <Link
                  href="https://app.prepskul.com/auth-method-selection"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign In
                </Link>
                <Link
                  href="https://app.prepskul.com/auth-method-selection"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tutor Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <div className="relative">
                {tutorAvatar && !imageError ? (
                  <Image
                    src={tutorAvatar}
                    alt={tutorName}
                    width={120}
                    height={120}
                    className="rounded-full border-4 border-white shadow-lg"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-30 h-30 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-4xl font-bold text-blue-600">
                      {tutorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {isVerified && (
                  <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-white">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>

              {/* Tutor Info */}
              <div className="flex-1 text-white">
                <h1 className="text-3xl font-bold mb-2">{tutorName}</h1>
                {subjectsArray.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-lg">{subjectsArray.join(', ')}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center space-x-2 text-blue-100">
                    <MapPin className="w-5 h-5" />
                    <span>{location}</span>
                  </div>
                )}
                {rating && (
                  <div className="flex items-center space-x-2 mt-3">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-semibold">{rating.toFixed(1)}</span>
                    </div>
                    {totalReviews && (
                      <span className="text-blue-100">
                        ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tutor Details */}
          <div className="p-8">
            {bio && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">About</h2>
                <p className="text-gray-700 leading-relaxed">{bio}</p>
              </div>
            )}

            {hourlyRate && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Pricing</h2>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <span className="text-lg font-semibold">{hourlyRate.toLocaleString()} XAF/hour</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              {canBook ? (
                <div className="space-y-4">
                  <a
                    href={appDeepLink}
                    className="block w-full bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Open in PrepSkul App to Book
                  </a>
                  <p className="text-sm text-gray-600 text-center">
                    Or{' '}
                    <a href={webUrl} className="text-blue-600 hover:underline">
                      continue on web
                    </a>
                  </p>
                </div>
              ) : isTutor ? (
                <div className="space-y-4">
                  <a
                    href={appDeepLink}
                    className="block w-full bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Open in PrepSkul App
                  </a>
                  <p className="text-sm text-gray-600 text-center">
                    You'll be taken to your tutor dashboard
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <a
                    href={appDeepLink}
                    className="block w-full bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Open in PrepSkul App
                  </a>
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">
                      Sign up to book this tutor and start learning!
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                      <Link
                        href="https://app.prepskul.com/auth-method-selection"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Sign Up Free
                      </Link>
                      <span className="text-gray-400">•</span>
                      <Link
                        href="https://app.prepskul.com/auth-method-selection"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Sign In
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Download App CTA */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Get the PrepSkul App
          </h3>
          <p className="text-gray-600 mb-4">
            Book tutors, schedule sessions, and track your progress on the go
          </p>
          <div className="flex items-center justify-center space-x-4">
            <a
              href="https://play.google.com/store/apps/details?id=com.prepskul.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <Download className="w-5 h-5" />
              <span>Download for Android</span>
            </a>
            <span className="text-gray-400">•</span>
            <a
              href="https://apps.apple.com/app/prepskul"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <Download className="w-5 h-5" />
              <span>Download for iOS</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

