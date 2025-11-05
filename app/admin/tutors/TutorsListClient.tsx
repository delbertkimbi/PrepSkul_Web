'use client';

import { useState, useMemo } from 'react';
import TutorCard from '../components/TutorCard';

interface Tutor {
  id: string;
  profile_photo_url?: string | null;
  profiles?: {
    full_name?: string;
    phone_number?: string;
    email?: string;
  } | null;
  tutoring_areas?: string[] | null;
  city?: string | null;
  teaching_duration?: string | null;
  status: string;
  is_hidden?: boolean;
  created_at: string;
}

interface TutorsListClientProps {
  tutors: Tutor[];
}

type TabType = 'all' | 'pending' | 'approved' | 'rejected' | 'needs_improvement' | 'hidden' | 'blocked';

const tabs: { id: TabType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'needs_improvement', label: 'Needs Improvement' },
  { id: 'hidden', label: 'Hidden' },
  { id: 'blocked', label: 'Blocked' },
];

export default function TutorsListClient({ tutors }: TutorsListClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Extract unique subjects and locations for filters
  const allSubjects = useMemo(() => {
    const subjects = new Set<string>();
    tutors.forEach(tutor => {
      if (Array.isArray(tutor.tutoring_areas)) {
        tutor.tutoring_areas.forEach(subj => subjects.add(subj));
      }
    });
    return Array.from(subjects).sort();
  }, [tutors]);

  const allLocations = useMemo(() => {
    const locations = new Set<string>();
    tutors.forEach(tutor => {
      if (tutor.city) locations.add(tutor.city);
    });
    return Array.from(locations).sort();
  }, [tutors]);

  // Filter tutors based on active tab, search, and filters
  const filteredTutors = useMemo(() => {
    let filtered = tutors;

    // Filter by tab/status
    if (activeTab === 'all') {
      // Show all except truly blocked (suspended)
      filtered = tutors.filter(t => t.status !== 'suspended');
    } else if (activeTab === 'hidden') {
      filtered = tutors.filter(t => t.is_hidden === true);
    } else if (activeTab === 'blocked') {
      filtered = tutors.filter(t => t.status === 'suspended');
    } else {
      filtered = tutors.filter(t => {
        if (activeTab === 'needs_improvement') {
          return t.status === 'needs_improvement' && !t.is_hidden;
        }
        return t.status === activeTab && !t.is_hidden;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tutor => {
        const name = tutor.profiles?.full_name?.toLowerCase() || '';
        const subjects = Array.isArray(tutor.tutoring_areas) 
          ? tutor.tutoring_areas.join(' ').toLowerCase() 
          : '';
        const location = tutor.city?.toLowerCase() || '';
        const email = tutor.profiles?.email?.toLowerCase() || '';
        return name.includes(query) || 
               subjects.includes(query) || 
               location.includes(query) ||
               email.includes(query);
      });
    }

    // Filter by subject
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(tutor => 
        Array.isArray(tutor.tutoring_areas) && 
        tutor.tutoring_areas.includes(subjectFilter)
      );
    }

    // Filter by location
    if (locationFilter !== 'all') {
      filtered = filtered.filter(tutor => tutor.city === locationFilter);
    }

    return filtered;
  }, [tutors, activeTab, searchQuery, subjectFilter, locationFilter]);

  // Count tutors per tab
  const getTabCount = (tab: TabType) => {
    if (tab === 'all') return tutors.filter(t => t.status !== 'suspended').length;
    if (tab === 'hidden') return tutors.filter(t => t.is_hidden === true).length;
    if (tab === 'blocked') return tutors.filter(t => t.status === 'suspended').length;
    if (tab === 'needs_improvement') {
      return tutors.filter(t => t.status === 'needs_improvement' && !t.is_hidden).length;
    }
    return tutors.filter(t => t.status === tab && !t.is_hidden).length;
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-1">
        <div className="flex flex-wrap gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const count = getTabCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search tutors by name, subject, location, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Subjects</option>
            {allSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Locations</option>
            {allLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredTutors.length} of {getTabCount(activeTab)} {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} tutor{filteredTutors.length !== 1 ? 's' : ''}
      </div>

      {/* Tutor Cards Grid */}
      {filteredTutors.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tutors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || subjectFilter !== 'all' || locationFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No tutors match this status'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      )}
    </div>
  );
}
