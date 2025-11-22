'use client';

import { useState } from 'react';
import { Star, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { calculateInitialRating, formatRating, getRatingColor } from '@/lib/services/ratingAlgorithm';
import { calculatePricing, formatPrice, getTierColor, PRICING_TIERS, type PricingTier } from '@/lib/services/pricingAlgorithm';

interface TutorData {
  highest_education?: string;
  teaching_duration?: string;
  teaching_experience?: boolean;
  has_teaching_experience?: boolean;
  certifications_array?: string[];
  certifications?: string[];
  tutoring_areas?: string[];
  specializations?: string[];
  languages?: string[];
  video_link?: string;
  video_url?: string;
  bio?: string;
  motivation?: string;
  profile_photo_url?: string;
  id_card_front_url?: string;
  id_card_back_url?: string;
  initial_rating_suggested?: number;
  admin_approved_rating?: number;
  rating_justification?: string;
  base_session_price?: number;
  price_3_sessions_weekly?: number;
  price_4_sessions_weekly?: number;
  pricing_tier?: PricingTier;
  expected_rate?: number;
  hourly_rate?: number;
  payment_method?: string;
  payment_details?: any;
}

interface RatingPricingSectionProps {
  tutor: TutorData;
  tutorId: string;
}

export default function RatingPricingSection({ tutor, tutorId }: RatingPricingSectionProps) {
  // Calculate suggested rating and pricing
  const ratingResult = calculateInitialRating(tutor);
  const pricingResult = calculatePricing(tutor);

  // Helper function to validate and get a valid tier
  const getValidTier = (tier: any): PricingTier => {
    if (tier && typeof tier === 'string' && (tier === 'starter' || tier === 'standard' || tier === 'premium' || tier === 'elite')) {
      return tier as PricingTier;
    }
    return pricingResult.suggestedTier;
  };

  // State for admin-modified values
  const [adminRating, setAdminRating] = useState<number>(
    tutor.admin_approved_rating || ratingResult.suggestedRating
  );
  const [adminPrice, setAdminPrice] = useState<number>(
    tutor.base_session_price || pricingResult.suggestedPrice
  );
  const [adminTier, setAdminTier] = useState<PricingTier>(
    getValidTier(tutor.pricing_tier || pricingResult.suggestedTier)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Calculate monthly prices based on admin price
  const monthlyPrices = {
    threeSessions: adminPrice * 12,
    fourSessions: adminPrice * 16
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch(`/api/admin/tutors/${tutorId}/rating-pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_approved_rating: adminRating,
          base_session_price: adminPrice,
          pricing_tier: adminTier,
          initial_rating_suggested: ratingResult.suggestedRating,
          rating_justification: ratingResult.justification,
          credential_score: ratingResult.credentialScore
        })
      });

      if (!response.ok) throw new Error('Failed to save');

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving rating/pricing:', error);
      alert('Failed to save rating and pricing. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const ratingDeviation = Math.abs(adminRating - ratingResult.suggestedRating);
  const priceDeviation = Math.abs(adminPrice - pricingResult.suggestedPrice);
  const showWarning = ratingDeviation > 0.3 || priceDeviation > 2000;

  // Handle expected_rate - might be stored as TEXT, NUMERIC, or null
  const parseRate = (rate: any): number => {
    if (!rate) return 0;
    if (typeof rate === 'number') return rate;
    if (typeof rate === 'string') {
      // Remove currency symbols and parse
      const cleaned = rate.replace(/[^\d.,]/g, '').replace(',', '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };
  
  const tutorRequestedRate = parseRate(tutor.expected_rate) || parseRate(tutor.hourly_rate) || 0;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Rating & Pricing</h2>
        <p className="text-sm text-gray-500 mt-0.5">Set the tutor's rating and session price</p>
      </div>

      {/* Tutor's Desired Payment Range - Compact & Subtle Reference */}
      {tutorRequestedRate > 0 && (
        <div className="flex items-center justify-between p-2.5 bg-gray-50/50 border border-gray-200 rounded-md">
          <span className="text-xs text-gray-500">Tutor requested:</span>
          <span className="text-xs font-medium text-gray-700">
            {formatPrice(tutorRequestedRate)}
            {tutor.payment_method && ` • ${tutor.payment_method}`}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Section */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Initial Rating (3.0 - 4.5)
            </label>
            
            {/* Suggested Rating - Compact */}
            <div className="bg-blue-50/30 border border-blue-100 rounded-lg p-2.5 mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500">Suggested</span>
                <span className="text-xs text-gray-400">{ratingResult.credentialScore}/100</span>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <Star className={`w-4 h-4 ${getRatingColor(ratingResult.suggestedRating)} fill-current`} />
                <span className={`text-base font-semibold ${getRatingColor(ratingResult.suggestedRating)}`}>
                  {formatRating(ratingResult.suggestedRating)}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{ratingResult.justification}</p>
            </div>

            {/* Admin Rating Input */}
            <div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="3.0"
                  max="4.5"
                  step="0.1"
                  value={adminRating}
                  onChange={(e) => setAdminRating(parseFloat(e.target.value) || 3.0)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex items-center gap-1.5">
                  <Star className={`w-5 h-5 ${getRatingColor(adminRating)} fill-current`} />
                  <span className={`text-lg font-semibold ${getRatingColor(adminRating)}`}>
                    {formatRating(adminRating)}
                  </span>
                </div>
              </div>
              {showWarning && ratingDeviation > 0.3 && (
                <div className="flex items-center gap-2 mt-2 text-amber-600 text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Significantly different from suggestion ({formatRating(Math.abs(ratingDeviation))} points)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Session Price (XAF)
            </label>
            
            {/* Suggested Pricing - Compact */}
            <div className="bg-purple-50/30 border border-purple-100 rounded-lg p-2.5 mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500">Suggested</span>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getTierColor(pricingResult.suggestedTier)}`}>
                  {PRICING_TIERS[pricingResult.suggestedTier].label}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base font-semibold text-gray-900">
                  {formatPrice(pricingResult.suggestedPrice)}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{pricingResult.justification}</p>
            </div>

            {/* Admin Pricing Input */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1.5 block">Pricing Tier</label>
                <select
                  value={adminTier}
                  onChange={(e) => {
                    const newTier = getValidTier(e.target.value);
                    setAdminTier(newTier);
                    const tierInfo = PRICING_TIERS[newTier];
                    if (tierInfo) {
                      // Auto-adjust price to middle of tier range
                      setAdminPrice(Math.round((tierInfo.minPrice + tierInfo.maxPrice) / 2 / 500) * 500);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {Object.values(PRICING_TIERS).map((tier) => (
                    <option key={tier.tier} value={tier.tier}>
                      {tier.label} ({formatPrice(tier.minPrice)} - {formatPrice(tier.maxPrice)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-1.5 block">Session Price</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={PRICING_TIERS[adminTier]?.minPrice || 3000}
                    max={PRICING_TIERS[adminTier]?.maxPrice || 15000}
                    step="500"
                    value={adminPrice}
                    onChange={(e) => setAdminPrice(parseInt(e.target.value) || 3000)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <span className="text-sm text-gray-600">XAF</span>
                </div>
                {PRICING_TIERS[adminTier] && (
                  <p className="text-xs text-gray-400 mt-1">
                    Range: {formatPrice(PRICING_TIERS[adminTier].minPrice)} - {formatPrice(PRICING_TIERS[adminTier].maxPrice)}
                  </p>
                )}
                {showWarning && priceDeviation > 2000 && (
                  <div className="flex items-center gap-2 mt-2 text-amber-600 text-xs">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Significantly different from suggestion ({formatPrice(priceDeviation)} difference)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Pricing Preview - Compact */}
      <div className="flex items-center justify-between p-3 bg-gray-50/30 border border-gray-200 rounded-lg">
        <span className="text-xs text-gray-500">Monthly preview:</span>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400">3x/week</p>
            <p className="text-sm font-semibold text-gray-900">{formatPrice(monthlyPrices.threeSessions)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">4x/week</p>
            <p className="text-sm font-semibold text-gray-900">{formatPrice(monthlyPrices.fourSessions)}</p>
          </div>
        </div>
      </div>

      {/* Student Preview - Hidden by default */}
      {showPreview && (
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/30">
          <p className="text-xs font-medium text-gray-700 mb-3">Student preview</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Star className={`w-5 h-5 ${getRatingColor(adminRating)} fill-current`} />
              <span className={`text-lg font-semibold ${getRatingColor(adminRating)}`}>
                {formatRating(adminRating)}
              </span>
            </div>
            <div className="flex-1 border-l border-gray-300 pl-4">
              <p className="text-xs text-gray-500 mb-0.5">Per session</p>
              <p className="text-lg font-semibold text-gray-900">{formatPrice(adminPrice)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Preview Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1.5 transition"
        >
          <Eye className="w-3.5 h-3.5" />
          {showPreview ? 'Hide' : 'Show'} student preview
        </button>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Saved!</span>
            </div>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || adminRating < 3.0 || adminRating > 4.5 || adminPrice < 3000 || adminPrice > 15000}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-sm font-medium"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
