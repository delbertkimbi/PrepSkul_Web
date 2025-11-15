export interface ModuleProgress {
  moduleId: string;
  completed: boolean;
  score: number;
  completedAt?: Date;
}

export interface LevelProgress {
  levelId: string;
  modules: ModuleProgress[];
  certificateId?: string;
  certificateIssuedAt?: Date;
}

export interface UserProgress {
  userId: string;
  userName: string;
  levels: LevelProgress[];
}

export const isLevelCompleted = (levelProgress: LevelProgress): boolean => {
  return levelProgress.modules.every(module => module.completed);
};

export const generateCertificateId = (levelId: string, userId: string): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${levelId.toUpperCase()}-${timestamp}${random}`;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const updateModuleProgress = (
  userProgress: UserProgress,
  levelId: string,
  moduleId: string,
  score: number
): UserProgress => {
  const updatedProgress = { ...userProgress };
  const levelIndex = updatedProgress.levels.findIndex(l => l.levelId === levelId);

  if (levelIndex === -1) {
    // Create new level progress if it doesn't exist
    updatedProgress.levels.push({
      levelId,
      modules: [{
        moduleId,
        completed: true,
        score,
        completedAt: new Date()
      }]
    });
  } else {
    const moduleIndex = updatedProgress.levels[levelIndex].modules.findIndex(
      m => m.moduleId === moduleId
    );

    if (moduleIndex === -1) {
      // Add new module progress
      updatedProgress.levels[levelIndex].modules.push({
        moduleId,
        completed: true,
        score,
        completedAt: new Date()
      });
    } else {
      // Update existing module progress
      updatedProgress.levels[levelIndex].modules[moduleIndex] = {
        moduleId,
        completed: true,
        score,
        completedAt: new Date()
      };
    }
  }

  // Check if all modules are completed and generate certificate if needed
  const level = updatedProgress.levels.find(l => l.levelId === levelId);
  if (level && isLevelCompleted(level) && !level.certificateId) {
    level.certificateId = generateCertificateId(levelId, updatedProgress.userId);
    level.certificateIssuedAt = new Date();
  }

  return updatedProgress;
};