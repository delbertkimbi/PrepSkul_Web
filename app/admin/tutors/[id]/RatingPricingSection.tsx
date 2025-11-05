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
}

interface RatingPricingSectionProps {
  tutor: TutorData;
  tutorId: string;
}

export default function RatingPricingSection({ tutor, tutorId }: RatingPricingSectionProps) {
  // Calculate suggested rating and pricing
  const ratingResult = calculateInitialRating(tutor);
  const pricingResult = calculatePricing(tutor);

  // State for admin-modified values
  const [adminRating, setAdminRating] = useState<number>(
    tutor.admin_approved_rating || ratingResult.suggestedRating
  );
  const [adminPrice, setAdminPrice] = useState<number>(
    tutor.base_session_price || pricingResult.suggestedPrice
  );
  const [adminTier, setAdminTier] = useState<PricingTier>(
    tutor.pricing_tier || pricingResult.suggestedTier
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Rating & Pricing</h2>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? 'Hide' : 'Show'} Preview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Section */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Initial Rating (3.0 - 4.5)
            </label>
            
            {/* Suggested Rating */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Algorithm Suggestion</p>
                  <div className="flex items-center gap-2">
                    <Star className={`w-5 h-5 ${getRatingColor(ratingResult.suggestedRating)} fill-current`} />
                    <span className={`text-lg font-bold ${getRatingColor(ratingResult.suggestedRating)}`}>
                      {formatRating(ratingResult.suggestedRating)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Credential Score</p>
                  <p className="text-sm font-semibold">{ratingResult.credentialScore}/100</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">{ratingResult.justification}</p>
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
                <div className="flex items-center gap-1">
                  <Star className={`w-6 h-6 ${getRatingColor(adminRating)} fill-current`} />
                  <span className={`text-xl font-bold ${getRatingColor(adminRating)}`}>
                    {formatRating(adminRating)}
                  </span>
                </div>
              </div>
              {showWarning && ratingDeviation > 0.3 && (
                <div className="flex items-center gap-2 mt-2 text-amber-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
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
            
            {/* Suggested Pricing */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Algorithm Suggestion</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTierColor(pricingResult.suggestedTier)}`}>
                      {PRICING_TIERS[pricingResult.suggestedTier].label}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(pricingResult.suggestedPrice)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600">{pricingResult.justification}</p>
            </div>

            {/* Admin Pricing Input */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Pricing Tier</label>
                <select
                  value={adminTier}
                  onChange={(e) => {
                    setAdminTier(e.target.value as PricingTier);
                    const tierInfo = PRICING_TIERS[e.target.value as PricingTier];
                    // Auto-adjust price to middle of tier range
                    setAdminPrice(Math.round((tierInfo.minPrice + tierInfo.maxPrice) / 2 / 500) * 500);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.values(PRICING_TIERS).map((tier) => (
                    <option key={tier.tier} value={tier.tier}>
                      {tier.label} ({formatPrice(tier.minPrice)} - {formatPrice(tier.maxPrice)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-1 block">Base Session Price</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={PRICING_TIERS[adminTier].minPrice}
                    max={PRICING_TIERS[adminTier].maxPrice}
                    step="500"
                    value={adminPrice}
                    onChange={(e) => setAdminPrice(parseInt(e.target.value) || 3000)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-600">XAF</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Range: {formatPrice(PRICING_TIERS[adminTier].minPrice)} - {formatPrice(PRICING_TIERS[adminTier].maxPrice)}
                </p>
                {showWarning && priceDeviation > 2000 && (
                  <div className="flex items-center gap-2 mt-2 text-amber-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Significantly different from suggestion ({formatPrice(priceDeviation)} difference)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Pricing Preview */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Monthly Pricing (Auto-calculated)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">3 Sessions/Week</p>
            <p className="text-lg font-bold text-gray-900">{formatPrice(monthlyPrices.threeSessions)}</p>
            <p className="text-xs text-gray-500">12 sessions/month</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">4 Sessions/Week</p>
            <p className="text-lg font-bold text-gray-900">{formatPrice(monthlyPrices.fourSessions)}</p>
            <p className="text-xs text-gray-500">16 sessions/month</p>
          </div>
        </div>
      </div>

      {/* Student Preview */}
      {showPreview && (
        <div className="mt-6 p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Student Preview</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Star className={`w-5 h-5 ${getRatingColor(adminRating)} fill-current`} />
              <span className={`text-lg font-bold ${getRatingColor(adminRating)}`}>
                {formatRating(adminRating)}
              </span>
              {adminRating >= 4.5 && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                  Top Rated
                </span>
              )}
            </div>
            <div className="flex-1 border-l border-gray-300 pl-4">
              <p className="text-xs text-gray-600 mb-1">Per Session</p>
              <p className="text-xl font-bold text-gray-900">{formatPrice(adminPrice)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Saved successfully!</span>
            </div>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || adminRating < 3.0 || adminRating > 4.5 || adminPrice < 3000 || adminPrice > 15000}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {isSaving ? 'Saving...' : 'Save Rating & Pricing'}
        </button>
      </div>
    </div>
  );
}
