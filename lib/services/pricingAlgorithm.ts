/**
 * Pricing Algorithm Service
 * Calculates suggested session pricing based on tutor credentials
 */

export type PricingTier = 'starter' | 'standard' | 'premium' | 'elite';

export interface PricingTierInfo {
  tier: PricingTier;
  label: string;
  minPrice: number;
  maxPrice: number;
  description: string;
}

export const PRICING_TIERS: Record<PricingTier, PricingTierInfo> = {
  starter: {
    tier: 'starter',
    label: 'Starter',
    minPrice: 3000,
    maxPrice: 5000,
    description: 'New tutors or those with basic qualifications',
  },
  standard: {
    tier: 'standard',
    label: 'Standard',
    minPrice: 5000,
    maxPrice: 8000,
    description: 'Experienced tutors with good qualifications',
  },
  premium: {
    tier: 'premium',
    label: 'Premium',
    minPrice: 8000,
    maxPrice: 12000,
    description: 'Highly qualified tutors with extensive experience',
  },
  elite: {
    tier: 'elite',
    label: 'Elite',
    minPrice: 12000,
    maxPrice: 15000,
    description: 'Top-tier tutors with exceptional credentials',
  },
};

export interface PricingResult {
  suggestedPrice: number;
  suggestedTier: PricingTier;
  justification: string;
}

export function calculatePricing(tutor: {
  highest_education?: string;
  teaching_duration?: string;
  teaching_experience?: boolean;
  has_teaching_experience?: boolean;
  certifications_array?: string[];
  certifications?: string[];
  tutoring_areas?: string[];
  specializations?: string[];
  admin_approved_rating?: number;
  initial_rating_suggested?: number;
}): PricingResult {
  // Use admin-approved rating if available, otherwise use suggested rating
  const rating = tutor.admin_approved_rating || tutor.initial_rating_suggested || 3.5;
  
  // Base pricing on rating
  // Rating 3.0-3.3 = Starter (3000-5000)
  // Rating 3.4-3.7 = Standard (5000-8000)
  // Rating 3.8-4.1 = Premium (8000-12000)
  // Rating 4.2-4.5 = Elite (12000-15000)
  
  let suggestedTier: PricingTier;
  let suggestedPrice: number;
  const reasons: string[] = [];

  if (rating >= 4.2) {
    suggestedTier = 'elite';
    suggestedPrice = 13500; // Middle of elite range
    reasons.push('Elite rating (4.2+)');
  } else if (rating >= 3.8) {
    suggestedTier = 'premium';
    suggestedPrice = 10000; // Middle of premium range
    reasons.push('Premium rating (3.8-4.1)');
  } else if (rating >= 3.4) {
    suggestedTier = 'standard';
    suggestedPrice = 6500; // Middle of standard range
    reasons.push('Standard rating (3.4-3.7)');
  } else {
    suggestedTier = 'starter';
    suggestedPrice = 4000; // Middle of starter range
    reasons.push('Starter rating (3.0-3.3)');
  }

  // Adjust based on education
  const education = tutor.highest_education?.toLowerCase() || '';
  if (education.includes('phd') || education.includes('doctorate')) {
    suggestedPrice += 1000;
    reasons.push('PhD qualification');
  } else if (education.includes('master')) {
    suggestedPrice += 500;
    reasons.push('Master\'s degree');
  }

  // Adjust based on experience
  const hasExperience = tutor.teaching_experience || tutor.has_teaching_experience;
  const duration = tutor.teaching_duration?.toLowerCase() || '';
  if (hasExperience && (duration.includes('5+') || duration.includes('more than 5'))) {
    suggestedPrice += 1000;
    reasons.push('5+ years experience');
  } else if (hasExperience && (duration.includes('3') || duration.includes('4'))) {
    suggestedPrice += 500;
    reasons.push('3-4 years experience');
  }

  // Adjust based on certifications
  const certs = tutor.certifications_array || tutor.certifications || [];
  if (certs.length >= 3) {
    suggestedPrice += 500;
    reasons.push('Multiple certifications');
  }

  // Ensure price is within tier bounds
  const tierInfo = PRICING_TIERS[suggestedTier];
  suggestedPrice = Math.max(tierInfo.minPrice, Math.min(tierInfo.maxPrice, suggestedPrice));
  
  // Round to nearest 500
  suggestedPrice = Math.round(suggestedPrice / 500) * 500;

  const justification = reasons.join(', ');

  return {
    suggestedPrice,
    suggestedTier,
    justification,
  };
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-CM', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getTierColor(tier: PricingTier): string {
  switch (tier) {
    case 'elite':
      return 'bg-purple-100 text-purple-700';
    case 'premium':
      return 'bg-blue-100 text-blue-700';
    case 'standard':
      return 'bg-green-100 text-green-700';
    case 'starter':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

