// ============================================================
// ProgressEngine — Improvement Scoring, Trends, Summaries
// Pure TypeScript. No framework imports. No direct DB calls.
// ============================================================

import type {
  EngineRepos,
  ProgressSummary,
  TrendDataPoint,
} from './types';

export function createProgressEngine(repos: Pick<
  EngineRepos,
  'workout' | 'workoutSet' | 'personalRecord' | 'progressEvent'
>) {
  return {
    /**
     * Calculate the improvement percentage between old and new PR.
     */
    calculateImprovementScore(oldPR: number, newPR: number): number {
      if (oldPR <= 0) return 1; // First PR = 100% improvement
      return (newPR - oldPR) / oldPR;
    },

    /**
     * Get a summary of progress for a user over a given period.
     */
    async getProgressSummary(
      userId: string,
      days: number
    ): Promise<ProgressSummary> {
      const workouts = await repos.workout.getHistory(userId, days);
      const prs = await repos.personalRecord.listByUser(userId);

      let totalSets = 0;
      let totalVolume = 0;

      for (const workout of workouts) {
        const sets = await repos.workoutSet.listByWorkout(workout.id);
        totalSets += sets.length;
        totalVolume += sets.reduce((acc, set) => acc + set.weight * set.reps, 0);
      }

      return {
        totalWorkouts: workouts.length,
        totalSets,
        totalVolume,
        prCount: prs.length,
        averageProgressScore: 0, // Will be computed from progress events later
      };
    },

    /**
     * Get strength trend data for a specific exercise over time.
     */
    async getStrengthTrends(
      userId: string,
      exerciseId: string,
      days: number
    ): Promise<TrendDataPoint[]> {
      const workouts = await repos.workout.getHistory(userId, days);
      const trends: TrendDataPoint[] = [];

      for (const workout of workouts) {
        const sets = await repos.workoutSet.listByWorkout(workout.id);
        const exerciseSets = sets.filter(s => s.exerciseId === exerciseId);

        if (exerciseSets.length > 0) {
          const maxWeight = Math.max(...exerciseSets.map(s => s.weight));
          const volume = exerciseSets.reduce((acc, s) => acc + s.weight * s.reps, 0);

          trends.push({
            date: workout.completedAt,
            weight: maxWeight,
            volume,
          });
        }
      }

      return trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },
  };
}

export type ProgressEngine = ReturnType<typeof createProgressEngine>;
