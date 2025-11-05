/**
 * Pricing Algorithm Service
 * Calculates pricing tiers and recommended prices based on tutor credentials
 * XAF currency: 3,000-15,000 per session
 */

export type PricingTier = 'entry' | 'standard' | 'premium' | 'expert';

export interface PricingTierInfo {
  tier: PricingTier;
  label: string;
  minPrice: number;
  maxPrice: number;
  description: string;
}

export interface PricingResult {
  suggestedTier: PricingTier;
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  justification: string;
  monthlyPrices: {
    threeSessions: number;
    fourSessions: number;
  };
}

interface TutorData {
  highest_education?: string;
  teaching_duration?: string;
  teaching_experience?: boolean;
  certifications_array?: string[];
  certifications?: string[];
  tutoring_areas?: string[];
  specializations?: string[];
  languages?: string[];
}

/**
 * Pricing tier definitions (XAF per session)
 */
export const PRICING_TIERS: Record<PricingTier, PricingTierInfo> = {
  entry: {
    tier: 'entry',
    label: 'Entry Level',
    minPrice: 3000,
    maxPrice: 5000,
    description: 'New tutors with basic credentials'
  },
  standard: {
    tier: 'standard',
    label: 'Standard',
    minPrice: 5000,
    maxPrice: 8000,
    description: 'Experienced tutors with good credentials'
  },
  premium: {
    tier: 'premium',
    label: 'Premium',
    minPrice: 8000,
    maxPrice: 12000,
    description: 'Highly qualified tutors and specialists'
  },
  expert: {
    tier: 'expert',
    label: 'Expert',
    minPrice: 12000,
    maxPrice: 15000,
    description: 'Exceptional credentials and proven track record'
  }
};

/**
 * Calculate education score (0-100)
 */
function calculateEducationScore(education?: string): number {
  if (!education) return 0;
  
  const edu = education.toLowerCase();
  
  if (edu.includes('phd') || edu.includes('doctorate') || edu.includes('doctoral')) {
    return 100;
  }
  if (edu.includes('master') || edu.includes('msc') || edu.includes('ma')) {
    return 75;
  }
  if (edu.includes('bachelor') || edu.includes('bsc') || edu.includes('ba') || edu.includes('degree')) {
    return 50;
  }
  if (edu.includes('diploma') || edu.includes('certificate')) {
    return 25;
  }
  
  return 0;
}

/**
 * Calculate experience score (0-100)
 */
function calculateExperienceScore(experience?: boolean, duration?: string): number {
  if (!experience) return 0;
  if (!duration) return 25;
  
  const dur = duration.toLowerCase();
  
  // Extract years
  const yearMatch = dur.match(/(\d+)/);
  if (yearMatch) {
    const years = parseInt(yearMatch[1]);
    if (years >= 5) return 100;
    if (years >= 3) return 75;
    if (years >= 1) return 50;
  }
  
  // Check for keywords
  if (dur.includes('5') || dur.includes('five') || dur.includes('five+')) {
    return 100;
  }
  if (dur.includes('3') || dur.includes('three') || dur.includes('3-5')) {
    return 75;
  }
  if (dur.includes('1') || dur.includes('2') || dur.includes('one') || dur.includes('two')) {
    return 50;
  }
  
  return 25;
}

/**
 * Calculate certifications score (0-30)
 */
function calculateCertificationsScore(certifications?: string[]): number {
  if (!certifications || certifications.length === 0) return 0;
  
  // Each certification adds 10 points, max 30
  return Math.min(certifications.length * 10, 30);
}

/**
 * Calculate subject specialization bonus (0-20)
 */
function calculateSubjectBonus(areas?: string[], specializations?: string[]): number {
  let bonus = 0;
  const allSubjects = [...(areas || []), ...(specializations || [])];
  
  // STEM subjects get higher value
  const stemKeywords = ['math', 'mathematics', 'science', 'physics', 'chemistry', 'biology', 
                       'engineering', 'computer', 'programming', 'coding', 'technology'];
  
  const hasSTEM = allSubjects.some(subject => 
    stemKeywords.some(keyword => subject.toLowerCase().includes(keyword))
  );
  
  if (hasSTEM) bonus += 10;
  
  // Multiple specializations
  if (allSubjects.length >= 3) bonus += 10;
  
  return Math.min(bonus, 20);
}

/**
 * Calculate language bonus (0-10)
 */
function calculateLanguageBonus(languages?: string[]): number {
  if (!languages || languages.length === 0) return 0;
  
  // Bilingual or multilingual tutors are more valuable
  if (languages.length >= 3) return 10;
  if (languages.length >= 2) return 5;
  
  return 0;
}

/**
 * Calculate total credential score (0-260)
 */
function calculateTotalScore(tutorData: TutorData): number {
  const educationScore = calculateEducationScore(tutorData.highest_education);
  const experienceScore = calculateExperienceScore(
    tutorData.teaching_experience,
    tutorData.teaching_duration
  );
  const certScore = calculateCertificationsScore(
    tutorData.certifications_array || tutorData.certifications
  );
  const subjectBonus = calculateSubjectBonus(
    tutorData.tutoring_areas,
    tutorData.specializations
  );
  const languageBonus = calculateLanguageBonus(tutorData.languages);
  
  return educationScore + experienceScore + certScore + subjectBonus + languageBonus;
}

/**
 * Determine pricing tier based on total score
 */
function determineTier(score: number): PricingTier {
  // Score ranges for each tier
  if (score >= 200) return 'expert';
  if (score >= 120) return 'premium';
  if (score >= 60) return 'standard';
  return 'entry';
}

/**
 * Calculate suggested price within tier
 */
function calculateSuggestedPrice(tier: PricingTier, score: number): number {
  const tierInfo = PRICING_TIERS[tier];
  
  // Map score (0-260) to price range within tier
  // For entry: 0-60 -> 3000-5000
  // For standard: 60-120 -> 5000-8000
  // For premium: 120-200 -> 8000-12000
  // For expert: 200-260 -> 12000-15000
  
  let tierMinScore = 0;
  let tierMaxScore = 60;
  
  switch (tier) {
    case 'entry':
      tierMinScore = 0;
      tierMaxScore = 60;
      break;
    case 'standard':
      tierMinScore = 60;
      tierMaxScore = 120;
      break;
    case 'premium':
      tierMinScore = 120;
      tierMaxScore = 200;
      break;
    case 'expert':
      tierMinScore = 200;
      tierMaxScore = 260;
      break;
  }
  
  // Normalize score within tier range
  const normalizedScore = Math.max(0, Math.min(1, 
    (score - tierMinScore) / (tierMaxScore - tierMinScore)
  ));
  
  // Calculate price within tier range
  const priceRange = tierInfo.maxPrice - tierInfo.minPrice;
  const suggestedPrice = tierInfo.minPrice + (normalizedScore * priceRange);
  
  // Round to nearest 500 XAF
  return Math.round(suggestedPrice / 500) * 500;
}

/**
 * Build justification text
 */
function buildJustification(
  tier: PricingTier,
  tutorData: TutorData,
  score: number
): string {
  const reasons: string[] = [];
  const tierInfo = PRICING_TIERS[tier];
  
  if (tutorData.highest_education) {
    reasons.push(`${tutorData.highest_education} education`);
  }
  
  if (tutorData.teaching_experience && tutorData.teaching_duration) {
    reasons.push(`${tutorData.teaching_duration} experience`);
  } else if (tutorData.teaching_experience) {
    reasons.push('teaching experience');
  }
  
  const certs = tutorData.certifications_array || tutorData.certifications;
  if (certs && certs.length > 0) {
    reasons.push(`${certs.length} certification${certs.length > 1 ? 's' : ''}`);
  }
  
  if (tutorData.tutoring_areas && tutorData.tutoring_areas.length > 0) {
    const isSTEM = tutorData.tutoring_areas.some(area => 
      ['math', 'science', 'physics', 'chemistry', 'biology', 'engineering', 'computer']
        .some(keyword => area.toLowerCase().includes(keyword))
    );
    if (isSTEM) {
      reasons.push('STEM specialization');
    }
  }
  
  if (reasons.length === 0) {
    return `${tierInfo.label} tier based on profile information.`;
  }
  
  return `${tierInfo.label} tier based on: ${reasons.join(', ')}.`;
}

/**
 * Calculate monthly prices
 */
function calculateMonthlyPrices(basePrice: number): {
  threeSessions: number;
  fourSessions: number;
} {
  return {
    threeSessions: basePrice * 12, // 3 sessions/week × 4 weeks
    fourSessions: basePrice * 16   // 4 sessions/week × 4 weeks
  };
}

/**
 * Main function: Calculate pricing for a tutor
 */
export function calculatePricing(tutorData: TutorData): PricingResult {
  // Calculate total credential score
  const totalScore = calculateTotalScore(tutorData);
  
  // Determine tier
  const suggestedTier = determineTier(totalScore);
  const tierInfo = PRICING_TIERS[suggestedTier];
  
  // Calculate suggested price
  const suggestedPrice = calculateSuggestedPrice(suggestedTier, totalScore);
  
  // Calculate monthly prices
  const monthlyPrices = calculateMonthlyPrices(suggestedPrice);
  
  // Build justification
  const justification = buildJustification(suggestedTier, tutorData, totalScore);
  
  return {
    suggestedTier,
    suggestedPrice,
    priceRange: {
      min: tierInfo.minPrice,
      max: tierInfo.maxPrice
    },
    justification,
    monthlyPrices
  };
}

/**
 * Format price in XAF
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

/**
 * Get tier color for UI
 */
export function getTierColor(tier: PricingTier): string {
  switch (tier) {
    case 'entry':
      return 'bg-blue-100 text-blue-800';
    case 'standard':
      return 'bg-green-100 text-green-800';
    case 'premium':
      return 'bg-purple-100 text-purple-800';
    case 'expert':
      return 'bg-yellow-100 text-yellow-800';
  }
}
