/**
 * Rating Algorithm Service
 * Calculates initial tutor ratings (3.0-4.5) based on credentials and profile quality
 * Base: 3.5, Max: 4.5 (leaves room for growth via real reviews)
 */

export interface RatingBreakdown {
  base: number;
  education: number;
  experience: number;
  certifications: number;
  video: number;
  profileCompleteness: number;
  total: number;
}

export interface RatingResult {
  suggestedRating: number;
  justification: string;
  credentialScore: number;
  breakdown: RatingBreakdown;
}

interface TutorData {
  highest_education?: string;
  teaching_duration?: string;
  teaching_experience?: boolean;
  certifications_array?: string[];
  certifications?: string[];
  video_link?: string;
  video_url?: string;
  bio?: string;
  motivation?: string;
  profile_photo_url?: string;
  id_card_front_url?: string;
  id_card_back_url?: string;
}

/**
 * Calculate education bonus points
 */
function getEducationBonus(education?: string): { points: number; reason: string } {
  if (!education) return { points: 0, reason: '' };

  const edu = education.toLowerCase();
  
  if (edu.includes('phd') || edu.includes('doctorate') || edu.includes('doctoral')) {
    return { points: 0.7, reason: 'PhD/Doctorate degree' };
  }
  if (edu.includes('master') || edu.includes('msc') || edu.includes('ma')) {
    return { points: 0.5, reason: 'Masters degree' };
  }
  if (edu.includes('bachelor') || edu.includes('bsc') || edu.includes('ba') || edu.includes('degree')) {
    return { points: 0.3, reason: 'Bachelor degree' };
  }
  if (edu.includes('diploma') || edu.includes('certificate')) {
    return { points: 0.1, reason: 'Diploma/Certificate' };
  }
  
  return { points: 0, reason: '' };
}

/**
 * Calculate experience bonus points
 */
function getExperienceBonus(experience?: boolean, duration?: string): { points: number; reason: string } {
  if (!experience) return { points: 0, reason: '' };
  if (!duration) return { points: 0.2, reason: 'Has teaching experience (duration not specified)' };

  const dur = duration.toLowerCase();
  
  // Extract years if possible (e.g., "5 years", "2-3 years", etc.)
  const yearMatch = dur.match(/(\d+)/);
  if (yearMatch) {
    const years = parseInt(yearMatch[1]);
    if (years >= 5) {
      return { points: 0.6, reason: `5+ years teaching experience` };
    }
    if (years >= 3) {
      return { points: 0.4, reason: `3-5 years teaching experience` };
    }
    if (years >= 1) {
      return { points: 0.2, reason: `1-2 years teaching experience` };
    }
  }
  
  // Check for keywords
  if (dur.includes('5') || dur.includes('five') || dur.includes('five+')) {
    return { points: 0.6, reason: '5+ years teaching experience' };
  }
  if (dur.includes('3') || dur.includes('three') || dur.includes('3-5')) {
    return { points: 0.4, reason: '3-5 years teaching experience' };
  }
  if (dur.includes('1') || dur.includes('2') || dur.includes('one') || dur.includes('two')) {
    return { points: 0.2, reason: '1-2 years teaching experience' };
  }
  
  return { points: 0.2, reason: 'Has teaching experience' };
}

/**
 * Calculate certifications bonus points
 */
function getCertificationsBonus(certifications?: string[]): { points: number; reason: string } {
  if (!certifications || certifications.length === 0) {
    return { points: 0, reason: '' };
  }
  
  const count = certifications.length;
  const points = Math.min(count * 0.1, 0.3); // Max 0.3 points, 0.1 per cert
  
  return {
    points,
    reason: `${count} certification${count > 1 ? 's' : ''} (${points.toFixed(1)} points)`
  };
}

/**
 * Calculate video bonus points
 */
function getVideoBonus(videoLink?: string, videoUrl?: string): { points: number; reason: string } {
  const hasVideo = !!(videoLink || videoUrl);
  return {
    points: hasVideo ? 0.2 : 0,
    reason: hasVideo ? 'Introduction video provided' : ''
  };
}

/**
 * Calculate profile completeness bonus
 */
function getProfileCompletenessBonus(data: TutorData): { points: number; reason: string } {
  let completeness = 0;
  const checks: string[] = [];
  
  if (data.bio || data.motivation) {
    completeness += 0.03;
    checks.push('bio');
  }
  if (data.profile_photo_url) {
    completeness += 0.03;
    checks.push('photo');
  }
  if (data.id_card_front_url && data.id_card_back_url) {
    completeness += 0.04;
    checks.push('ID verification');
  }
  
  const points = Math.min(completeness, 0.1); // Max 0.1 points
  
  return {
    points,
    reason: checks.length > 0 ? `Complete profile (${checks.join(', ')})` : ''
  };
}

/**
 * Calculate credential score (0-100) for display purposes
 */
function calculateCredentialScore(breakdown: RatingBreakdown): number {
  // Normalize to 0-100 scale
  // Max possible total is 3.5 + 0.7 + 0.6 + 0.3 + 0.2 + 0.1 = 5.4
  // We want to map 3.5-4.5 range to a 0-100 score
  const minRating = 3.5;
  const maxRating = 4.5;
  const currentRating = breakdown.total;
  
  const score = ((currentRating - minRating) / (maxRating - minRating)) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Main function: Calculate initial rating for a tutor
 */
export function calculateInitialRating(tutorData: TutorData): RatingResult {
  const BASE_RATING = 3.5;
  const MAX_RATING = 4.5;
  
  // Calculate all bonuses
  const educationBonus = getEducationBonus(tutorData.highest_education);
  const experienceBonus = getExperienceBonus(
    tutorData.teaching_experience,
    tutorData.teaching_duration
  );
  const certsBonus = getCertificationsBonus(
    tutorData.certifications_array || tutorData.certifications
  );
  const videoBonus = getVideoBonus(tutorData.video_link, tutorData.video_url);
  const completenessBonus = getProfileCompletenessBonus(tutorData);
  
  // Calculate breakdown
  const breakdown: RatingBreakdown = {
    base: BASE_RATING,
    education: educationBonus.points,
    experience: experienceBonus.points,
    certifications: certsBonus.points,
    video: videoBonus.points,
    profileCompleteness: completenessBonus.points,
    total: BASE_RATING + 
           educationBonus.points + 
           experienceBonus.points + 
           certsBonus.points + 
           videoBonus.points + 
           completenessBonus.points
  };
  
  // Cap at maximum
  const suggestedRating = Math.min(breakdown.total, MAX_RATING);
  
  // Round to 1 decimal place
  const roundedRating = Math.round(suggestedRating * 10) / 10;
  
  // Build justification text
  const reasons: string[] = [];
  if (educationBonus.reason) reasons.push(educationBonus.reason);
  if (experienceBonus.reason) reasons.push(experienceBonus.reason);
  if (certsBonus.reason) reasons.push(certsBonus.reason);
  if (videoBonus.reason) reasons.push(videoBonus.reason);
  if (completenessBonus.reason) reasons.push(completenessBonus.reason);
  
  const justification = reasons.length > 0
    ? `Based on: ${reasons.join(', ')}. This initial rating will grow as you receive student reviews.`
    : 'Standard initial rating. This will grow as you receive student reviews.';
  
  // Calculate credential score
  const credentialScore = calculateCredentialScore(breakdown);
  
  return {
    suggestedRating: roundedRating,
    justification,
    credentialScore,
    breakdown
  };
}

/**
 * Format rating for display
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Get rating color/styling based on value
 */
export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'text-yellow-500'; // Top rated
  if (rating >= 4.0) return 'text-green-600'; // Excellent
  if (rating >= 3.5) return 'text-blue-600'; // Good
  return 'text-gray-600'; // Standard
}
