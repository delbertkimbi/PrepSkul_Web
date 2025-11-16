import type { AcademyLevelId } from './academy-data';

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

const STORAGE_KEY = 'prepskul.academy.progress.v1';

export function loadProgress(): AcademyProgressState {
	if (typeof window === 'undefined') return { levels: {} };
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return { levels: {} };
		return JSON.parse(raw);
	} catch {
		return { levels: {} };
	}
}

export function saveProgress(state: AcademyProgressState): void {
	if (typeof window === 'undefined') return;
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function recordModuleScore(levelId: AcademyLevelId, moduleId: string, scorePercent: number): AcademyProgressState {
	const current = loadProgress();
	const level = current.levels[levelId] ?? { modules: {} };
	const existing = level.modules[moduleId] ?? { scorePercent: 0, isPassed: false };
	level.modules[moduleId] = {
		...existing,
		scorePercent,
		isPassed: scorePercent >= PASS_THRESHOLD,
	};
	current.levels[levelId] = level;
	saveProgress(current);
	return current;
}

export function markSectionVideoWatched(levelId: AcademyLevelId, moduleId: string, sectionId: string): AcademyProgressState {
	const current = loadProgress();
	const level = current.levels[levelId] ?? { modules: {} };
	const mod = level.modules[moduleId] ?? { scorePercent: 0, watchedSections: [], isPassed: false };
	const watched = new Set(mod.watchedSections ?? []);
	watched.add(sectionId);
	mod.watchedSections = Array.from(watched);
	level.modules[moduleId] = mod;
	current.levels[levelId] = level;
	saveProgress(current);
	return current;
}

export function getModuleWatchedSections(levelId: AcademyLevelId, moduleId: string): string[] {
	const state = loadProgress();
	return state.levels[levelId]?.modules?.[moduleId]?.watchedSections ?? [];
}

export function getModuleCompletionPercentFromWatched(levelId: AcademyLevelId, moduleId: string, totalVideoCount: number): number {
	if (!totalVideoCount || totalVideoCount <= 0) return 0;
	const watched = getModuleWatchedSections(levelId, moduleId).length;
	return Math.round((watched / totalVideoCount) * 100);
}

export function canAccessModule(levelId: AcademyLevelId, moduleOrderIds: string[], targetModuleId: string): boolean {
	const idx = moduleOrderIds.indexOf(targetModuleId);
	if (idx <= 0) return true; // First module always accessible
	const prevId = moduleOrderIds[idx - 1];
	const state = loadProgress();
	const passed = state.levels[levelId]?.modules?.[prevId]?.isPassed === true;
	return passed;
}

export function isLevelCompleted(levelId: AcademyLevelId, moduleOrderIds: string[]): boolean {
	const state = loadProgress();
	const level = state.levels[levelId];
	if (!level) return false;
	return moduleOrderIds.every(id => level.modules[id]?.isPassed === true);
}

export function canAccessFinalQuiz(levelId: AcademyLevelId, moduleOrderIds: string[]): boolean {
	return isLevelCompleted(levelId, moduleOrderIds);
}

export function recordFinalQuizScore(levelId: AcademyLevelId, scorePercent: number): AcademyProgressState {
	const current = loadProgress();
	const level = current.levels[levelId] ?? { modules: {} };
	level.finalQuiz = {
		scorePercent,
		isPassed: scorePercent >= PASS_THRESHOLD,
		completedAt: new Date().toISOString(),
	};
	current.levels[levelId] = level;
	saveProgress(current);
	return current;
}

export function getFinalQuizStatus(levelId: AcademyLevelId): { scorePercent: number; isPassed: boolean } | null {
	const state = loadProgress();
	const finalQuiz = state.levels[levelId]?.finalQuiz;
	if (!finalQuiz) return null;
	return {
		scorePercent: finalQuiz.scorePercent,
		isPassed: finalQuiz.isPassed,
	};
}

export function updateSectionProgress(levelId: AcademyLevelId, moduleId: string, sectionId: string, progress: number): AcademyProgressState {
    const current = loadProgress();
    const level = current.levels[levelId] ?? { modules: {} };
    const mod = level.modules[moduleId] ?? { scorePercent: 0, watchedSections: [], sectionProgress: {}, isPassed: false };
    
    if (!mod.sectionProgress) mod.sectionProgress = {};
    mod.sectionProgress[sectionId] = progress;
    
    if (progress === 100 && !mod.watchedSections?.includes(sectionId)) {
        const watched = new Set(mod.watchedSections ?? []);
        watched.add(sectionId);
        mod.watchedSections = Array.from(watched);
    }
    
    level.modules[moduleId] = mod;
    current.levels[levelId] = level;
    saveProgress(current);

    // Dispatch progress update event
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('prepskul:progress-updated'));
    }
    
    return current;
}

export function getSectionProgress(levelId: AcademyLevelId, moduleId: string, sectionId: string): number {
    const state = loadProgress();
    return state.levels[levelId]?.modules?.[moduleId]?.sectionProgress?.[sectionId] ?? 0;
}

export function getModuleQuizStatus(levelId: AcademyLevelId, moduleId: string): boolean {
    const state = loadProgress();
    return state.levels[levelId]?.modules?.[moduleId]?.isPassed ?? false;
}

export function issueCertificate(levelId: AcademyLevelId, tutorName: string): string {
    const state = loadProgress();
    const level = state.levels[levelId] ?? { modules: {} };
    const code = generateVerificationCode(levelId, tutorName);
	level.completedCertificate = {
		issuedAt: new Date().toISOString(),
		verificationCode: code,
		tutorName,
	};
	state.levels[levelId] = level;
	saveProgress(state);
	return code;
}

export function getCertificate(levelId: AcademyLevelId) {
	const state = loadProgress();
	return state.levels[levelId]?.completedCertificate;
}

function generateVerificationCode(levelId: string, tutorName: string): string {
	const base = `${levelId}:${tutorName}:${Date.now()}`;
	let hash = 0;
	for (let i = 0; i < base.length; i++) hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
	return `PS-${hash.toString(16).toUpperCase()}`;
}


