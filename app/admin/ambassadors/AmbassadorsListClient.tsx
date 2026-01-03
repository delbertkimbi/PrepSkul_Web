'use client';

import { useState } from 'react';
import AmbassadorCard from '../components/AmbassadorCard';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type TabType = 'all' | 'pending' | 'approved' | 'rejected';

interface AmbassadorsListClientProps {
  ambassadors: any[];
}

export default function AmbassadorsListClient({ ambassadors }: AmbassadorsListClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');

  // Get unique regions for filter
  const regions = Array.from(new Set(ambassadors.map(a => a.region).filter(Boolean))).sort();

  // Filter ambassadors
  const filteredAmbassadors = ambassadors.filter((ambassador) => {
    // Status filter
    if (activeTab !== 'all' && ambassador.application_status !== activeTab) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = ambassador.full_name?.toLowerCase().includes(query);
      const matchesCity = ambassador.city?.toLowerCase().includes(query);
      const matchesRegion = ambassador.region?.toLowerCase().includes(query);
      if (!matchesName && !matchesCity && !matchesRegion) {
        return false;
      }
    }

    // Region filter
    if (regionFilter !== 'all' && ambassador.region !== regionFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['all', 'pending', 'approved', 'rejected'] as TabType[]).map((tab) => {
            const count = tab === 'all' 
              ? ambassadors.length 
              : ambassadors.filter(a => a.application_status === tab).length;
            
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({count})
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search by name, city, or region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Regions</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {/* Ambassador Cards Grid */}
      {filteredAmbassadors.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No ambassadors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || regionFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No applications match this status'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAmbassadors.map((ambassador) => (
            <AmbassadorCard key={ambassador.id} ambassador={ambassador} />
          ))}
        </div>
      )}
    </div>
  );
}

