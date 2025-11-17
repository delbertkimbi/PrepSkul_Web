/**
 * Rating Algorithm Service
 * Calculates initial tutor rating based on credentials and experience
 */

export interface RatingResult {
  suggestedRating: number;
  credentialScore: number;
  justification: string;
}

export function calculateInitialRating(tutor: {
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
}): RatingResult {
  let score = 0;
  const reasons: string[] = [];

  // Education Level (0-30 points)
  const education = tutor.highest_education?.toLowerCase() || '';
  if (education.includes('phd') || education.includes('doctorate')) {
    score += 30;
    reasons.push('PhD/Doctorate degree');
  } else if (education.includes('master') || education.includes('masters')) {
    score += 25;
    reasons.push('Master\'s degree');
  } else if (education.includes('bachelor') || education.includes('degree')) {
    score += 20;
    reasons.push('Bachelor\'s degree');
  } else if (education.includes('diploma') || education.includes('certificate')) {
    score += 15;
    reasons.push('Diploma/Certificate');
  } else {
    score += 10;
    reasons.push('Basic education');
  }

  // Teaching Experience (0-25 points)
  const hasExperience = tutor.teaching_experience || tutor.has_teaching_experience;
  const duration = tutor.teaching_duration?.toLowerCase() || '';
  
  if (hasExperience) {
    if (duration.includes('5+') || duration.includes('more than 5')) {
      score += 25;
      reasons.push('5+ years teaching experience');
    } else if (duration.includes('3') || duration.includes('4')) {
      score += 20;
      reasons.push('3-4 years teaching experience');
    } else if (duration.includes('2') || duration.includes('1')) {
      score += 15;
      reasons.push('1-2 years teaching experience');
    } else {
      score += 10;
      reasons.push('Some teaching experience');
    }
  } else {
    score += 5;
    reasons.push('Limited teaching experience');
  }

  // Certifications (0-20 points)
  const certs = tutor.certifications_array || tutor.certifications || [];
  if (certs.length >= 3) {
    score += 20;
    reasons.push(`${certs.length} certifications`);
  } else if (certs.length >= 2) {
    score += 15;
    reasons.push(`${certs.length} certifications`);
  } else if (certs.length >= 1) {
    score += 10;
    reasons.push(`${certs.length} certification`);
  } else {
    score += 5;
    reasons.push('No certifications listed');
  }

  // Subject Expertise (0-15 points)
  const subjects = tutor.tutoring_areas || tutor.specializations || [];
  if (subjects.length >= 5) {
    score += 15;
    reasons.push(`${subjects.length} subject areas`);
  } else if (subjects.length >= 3) {
    score += 12;
    reasons.push(`${subjects.length} subject areas`);
  } else if (subjects.length >= 1) {
    score += 8;
    reasons.push(`${subjects.length} subject area`);
  } else {
    score += 3;
    reasons.push('No subjects specified');
  }

  // Profile Completeness (0-10 points)
  let completeness = 0;
  if (tutor.profile_photo_url) completeness += 2;
  if (tutor.id_card_front_url && tutor.id_card_back_url) completeness += 3;
  if (tutor.video_link || tutor.video_url) completeness += 3;
  if (tutor.bio || tutor.motivation) completeness += 2;
  score += completeness;
  if (completeness >= 8) {
    reasons.push('Complete profile');
  } else if (completeness >= 5) {
    reasons.push('Mostly complete profile');
  } else {
    reasons.push('Incomplete profile');
  }

  // Convert score (0-100) to rating (3.0-4.5)
  // Score 0-40 = 3.0-3.3
  // Score 41-60 = 3.4-3.7
  // Score 61-80 = 3.8-4.1
  // Score 81-100 = 4.2-4.5
  let suggestedRating: number;
  if (score <= 40) {
    suggestedRating = 3.0 + (score / 40) * 0.3;
  } else if (score <= 60) {
    suggestedRating = 3.3 + ((score - 40) / 20) * 0.4;
  } else if (score <= 80) {
    suggestedRating = 3.7 + ((score - 60) / 20) * 0.4;
  } else {
    suggestedRating = 4.1 + ((score - 80) / 20) * 0.4;
  }

  // Round to 1 decimal place
  suggestedRating = Math.round(suggestedRating * 10) / 10;
  
  // Ensure within bounds
  suggestedRating = Math.max(3.0, Math.min(4.5, suggestedRating));

  const justification = reasons.join(', ');

  return {
    suggestedRating,
    credentialScore: score,
    justification,
  };
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function getRatingColor(rating: number): string {
  if (rating >= 4.2) return 'text-green-600';
  if (rating >= 3.8) return 'text-blue-600';
  if (rating >= 3.4) return 'text-yellow-600';
  return 'text-orange-600';
}

