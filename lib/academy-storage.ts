import type { AcademyLevelId } from './academy-data';
import { academySupabase } from './academy-supabase';

export interface ModuleProgress {
	scorePercent: number; // 0-100
    // Sections (by id) for which the video has been watched to completion
    watchedSections?: string[];
	isPassed: boolean; // true only if scorePercent >= PASS_THRESHOLD
    // Track individual section progress (0-100)
    sectionProgress?: Record<string, number>;
}

export interface LevelProgress {
	modules: Record<string, ModuleProgress>;
	finalQuiz?: {
		scorePercent: number;
		isPassed: boolean;
		completedAt?: string; // ISO
	};
	completedCertificate?: {
		issuedAt: string; // ISO
		verificationCode: string;
		tutorName: string;
	};
}

export interface AcademyProgressState {
	levels: Partial<Record<AcademyLevelId, LevelProgress>>;
}

export const PASS_THRESHOLD = 70; // percent required to pass and unlock next module

// Cache for progress data (to avoid excessive API calls)
let progressCache: AcademyProgressState | null = null;
let cacheUserId: string | null = null;

/**
 * Get current user ID
 */
async function getCurrentUserId(): Promise<string | null> {
	const { data: { user } } = await academySupabase.auth.getUser();
	return user?.id || null;
}

/**
 * Load all progress from Supabase
 */
export async function loadProgress(): Promise<AcademyProgressState> {
	const userId = await getCurrentUserId();
	if (!userId) return { levels: {} };

	// Return cached data if available and user hasn't changed
	if (progressCache && cacheUserId === userId) {
		return progressCache;
	}

	try {
		// Fetch all progress records for this user
		const { data: progressRecords, error } = await academySupabase
			.from('academy_progress')
			.select('*')
			.eq('user_id', userId);

		if (error) throw error;

		// Fetch final quiz records
		const { data: finalQuizzes, error: quizError } = await academySupabase
			.from('academy_level_quizzes')
			.select('*')
			.eq('user_id', userId);

		if (quizError) throw quizError;

		// Fetch certificates
		const { data: certificates, error: certError } = await academySupabase
			.from('academy_certificates')
			.select('*')
			.eq('user_id', userId);

		if (certError) throw certError;

		// Transform database records into AcademyProgressState format
		const state: AcademyProgressState = { levels: {} };

		// Group progress by level
		progressRecords?.forEach((record) => {
			const levelId = record.level_id as AcademyLevelId;
			if (!state.levels[levelId]) {
				state.levels[levelId] = { modules: {} };
			}

			const sectionProgress: Record<string, number> = {};
			if (record.section_progress && typeof record.section_progress === 'object') {
				Object.entries(record.section_progress).forEach(([key, value]) => {
					sectionProgress[key] = typeof value === 'number' ? value : 0;
				});
			}

			state.levels[levelId]!.modules[record.module_id] = {
				scorePercent: record.quiz_score || 0,
				isPassed: record.is_passed || false,
				watchedSections: record.watched_sections || [],
				sectionProgress,
			};
		});

		// Add final quiz data
		finalQuizzes?.forEach((quiz) => {
			const levelId = quiz.level_id as AcademyLevelId;
			if (!state.levels[levelId]) {
				state.levels[levelId] = { modules: {} };
			}
			state.levels[levelId]!.finalQuiz = {
				scorePercent: quiz.score,
				isPassed: quiz.is_passed,
				completedAt: quiz.completed_at,
			};
		});

		// Add certificate data
		certificates?.forEach((cert) => {
			const levelId = cert.level_id as AcademyLevelId;
			if (!state.levels[levelId]) {
				state.levels[levelId] = { modules: {} };
			}
			state.levels[levelId]!.completedCertificate = {
				issuedAt: cert.issued_at,
				verificationCode: cert.verification_code,
				tutorName: cert.tutor_name,
			};
		});

		// Cache the result
		progressCache = state;
		cacheUserId = userId;

		return state;
	} catch (error) {
		console.error('Error loading progress:', error);
		return { levels: {} };
	}
}

/**
 * Save module quiz score to Supabase
 */
export async function recordModuleScore(levelId: AcademyLevelId, moduleId: string, scorePercent: number): Promise<AcademyProgressState> {
	const userId = await getCurrentUserId();
	if (!userId) {
		console.error('No user logged in');
		return { levels: {} };
	}

	const isPassed = scorePercent >= PASS_THRESHOLD;

	try {
		// Upsert progress record
		const { error } = await academySupabase
			.from('academy_progress')
			.upsert({
				user_id: userId,
				level_id: levelId,
				module_id: moduleId,
				quiz_score: scorePercent,
				is_passed: isPassed,
				started_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			}, {
				onConflict: 'user_id,level_id,module_id',
			});

		if (error) throw error;

		// Invalidate cache
		progressCache = null;

		// Reload and return
		return await loadProgress();
	} catch (error) {
		console.error('Error recording module score:', error);
		return await loadProgress();
	}
}

/**
 * Mark a section video as watched
 */
export async function markSectionVideoWatched(levelId: AcademyLevelId, moduleId: string, sectionId: string): Promise<AcademyProgressState> {
	const userId = await getCurrentUserId();
	if (!userId) {
		console.error('No user logged in');
		return { levels: {} };
	}

	try {
		// Get current progress
		const { data: existing } = await academySupabase
			.from('academy_progress')
			.select('watched_sections')
			.eq('user_id', userId)
			.eq('level_id', levelId)
			.eq('module_id', moduleId)
			.maybeSingle();

		const watchedSections = new Set(existing?.watched_sections || []);
		watchedSections.add(sectionId);

		// Update progress
		const { error } = await academySupabase
			.from('academy_progress')
			.upsert({
				user_id: userId,
				level_id: levelId,
				module_id: moduleId,
				watched_sections: Array.from(watchedSections),
				updated_at: new Date().toISOString(),
			}, {
				onConflict: 'user_id,level_id,module_id',
			});

		if (error) throw error;

		// Invalidate cache
		progressCache = null;

		// Dispatch progress update event
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('prepskul:progress-updated'));
		}

		return await loadProgress();
	} catch (error) {
		console.error('Error marking section as watched:', error);
		return await loadProgress();
	}
}

/**
 * Get watched sections for a module
 */
export async function getModuleWatchedSections(levelId: AcademyLevelId, moduleId: string): Promise<string[]> {
	const state = await loadProgress();
	return state.levels[levelId]?.modules?.[moduleId]?.watchedSections ?? [];
}

/**
 * Get module completion percent from watched sections
 */
export async function getModuleCompletionPercentFromWatched(levelId: AcademyLevelId, moduleId: string, totalVideoCount: number): Promise<number> {
	if (!totalVideoCount || totalVideoCount <= 0) return 0;
	const watched = await getModuleWatchedSections(levelId, moduleId);
	return Math.round((watched.length / totalVideoCount) * 100);
}

/**
 * Check if user can access a module (previous module must be passed)
 */
export async function canAccessModule(levelId: AcademyLevelId, moduleOrderIds: string[], targetModuleId: string): Promise<boolean> {
	const idx = moduleOrderIds.indexOf(targetModuleId);
	if (idx <= 0) return true; // First module always accessible
	const prevId = moduleOrderIds[idx - 1];
	const state = await loadProgress();
	const passed = state.levels[levelId]?.modules?.[prevId]?.isPassed === true;
	return passed;
}

/**
 * Check if level is completed (all modules passed)
 */
export async function isLevelCompleted(levelId: AcademyLevelId, moduleOrderIds: string[]): Promise<boolean> {
	const state = await loadProgress();
	const level = state.levels[levelId];
	if (!level) return false;
	return moduleOrderIds.every(id => level.modules[id]?.isPassed === true);
}

/**
 * Check if user can access final quiz
 */
export async function canAccessFinalQuiz(levelId: AcademyLevelId, moduleOrderIds: string[]): Promise<boolean> {
	return await isLevelCompleted(levelId, moduleOrderIds);
}

/**
 * Record final quiz score
 */
export async function recordFinalQuizScore(levelId: AcademyLevelId, scorePercent: number): Promise<AcademyProgressState> {
	const userId = await getCurrentUserId();
	if (!userId) {
		console.error('No user logged in');
		return { levels: {} };
	}

	const isPassed = scorePercent >= PASS_THRESHOLD;

	try {
		const { error } = await academySupabase
			.from('academy_level_quizzes')
			.upsert({
				user_id: userId,
				level_id: levelId,
				score: scorePercent,
				is_passed: isPassed,
				completed_at: new Date().toISOString(),
			}, {
				onConflict: 'user_id,level_id',
			});

		if (error) throw error;

		// Invalidate cache
		progressCache = null;

		return await loadProgress();
	} catch (error) {
		console.error('Error recording final quiz score:', error);
		return await loadProgress();
	}
}

/**
 * Get final quiz status
 */
export async function getFinalQuizStatus(levelId: AcademyLevelId): Promise<{ scorePercent: number; isPassed: boolean } | null> {
	const state = await loadProgress();
	const finalQuiz = state.levels[levelId]?.finalQuiz;
	if (!finalQuiz) return null;
	return {
		scorePercent: finalQuiz.scorePercent,
		isPassed: finalQuiz.isPassed,
	};
}

/**
 * Update section progress
 */
export async function updateSectionProgress(levelId: AcademyLevelId, moduleId: string, sectionId: string, progress: number): Promise<AcademyProgressState> {
	const userId = await getCurrentUserId();
	if (!userId) {
		console.error('No user logged in');
		return { levels: {} };
	}

	try {
		// Get current progress
		const { data: existing } = await academySupabase
			.from('academy_progress')
			.select('section_progress, watched_sections')
			.eq('user_id', userId)
			.eq('level_id', levelId)
			.eq('module_id', moduleId)
			.maybeSingle();

		const sectionProgress: Record<string, number> = (existing?.section_progress as Record<string, number>) || {};
		sectionProgress[sectionId] = progress;

		const watchedSections = new Set(existing?.watched_sections || []);
		if (progress === 100) {
			watchedSections.add(sectionId);
		}

		// Update progress
		const { error } = await academySupabase
			.from('academy_progress')
			.upsert({
				user_id: userId,
				level_id: levelId,
				module_id: moduleId,
				section_progress: sectionProgress,
				watched_sections: Array.from(watchedSections),
				updated_at: new Date().toISOString(),
			}, {
				onConflict: 'user_id,level_id,module_id',
			});

		if (error) throw error;

		// Invalidate cache
		progressCache = null;

		// Dispatch progress update event
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('prepskul:progress-updated'));
		}

		return await loadProgress();
	} catch (error) {
		console.error('Error updating section progress:', error);
		return await loadProgress();
	}
}

/**
 * Get section progress
 */
export async function getSectionProgress(levelId: AcademyLevelId, moduleId: string, sectionId: string): Promise<number> {
	const state = await loadProgress();
	return state.levels[levelId]?.modules?.[moduleId]?.sectionProgress?.[sectionId] ?? 0;
}

/**
 * Get module quiz status
 */
export async function getModuleQuizStatus(levelId: AcademyLevelId, moduleId: string): Promise<boolean> {
	const state = await loadProgress();
	return state.levels[levelId]?.modules?.[moduleId]?.isPassed ?? false;
}

/**
 * Issue certificate
 */
export async function issueCertificate(levelId: AcademyLevelId, tutorName: string): Promise<string> {
	const userId = await getCurrentUserId();
	if (!userId) {
		console.error('No user logged in');
		return '';
	}

	const code = generateVerificationCode(levelId, tutorName);

	try {
		const { error } = await academySupabase
			.from('academy_certificates')
			.insert({
				user_id: userId,
				level_id: levelId,
				tutor_name: tutorName,
				verification_code: code,
				issued_at: new Date().toISOString(),
			});

		if (error) throw error;

		// Invalidate cache
		progressCache = null;

		return code;
	} catch (error) {
		console.error('Error issuing certificate:', error);
		return '';
	}
}

/**
 * Get certificate
 */
export async function getCertificate(levelId: AcademyLevelId) {
	const state = await loadProgress();
	return state.levels[levelId]?.completedCertificate;
}

function generateVerificationCode(levelId: string, tutorName: string): string {
	const base = `${levelId}:${tutorName}:${Date.now()}`;
	let hash = 0;
	for (let i = 0; i < base.length; i++) hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
	return `PS-${hash.toString(16).toUpperCase()}`;
}

/**
 * Clear progress cache (useful after logout or when forcing refresh)
 */
export function clearProgressCache() {
	progressCache = null;
	cacheUserId = null;
}
