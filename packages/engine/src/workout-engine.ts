// ============================================================
// WorkoutEngine — PR Detection, Set Validation, Workout Completion
// Pure TypeScript. No framework imports. No direct DB calls.
// ============================================================

import type {
  FinishWorkoutInput,
  FinishWorkoutResult,
  NewPR,
  SetInput,
  EngineRepos,
  ProgressEvent,
} from './types';

export function createWorkoutEngine(repos: Pick<
  EngineRepos,
  'workout' | 'workoutSet' | 'personalRecord' | 'progressEvent' | 'activityEvent' | 'gymMember' | 'exercise'
>) {
  return {
    /**
     * Validates that sets have reasonable values.
     */
    validateSets(sets: SetInput[]): { valid: boolean; errors: string[] } {
      const errors: string[] = [];
      if (sets.length === 0) {
        errors.push('Workout must have at least one set');
      }
      for (const set of sets) {
        if (set.weight < 0) errors.push(`Invalid weight: ${set.weight}`);
        if (set.reps < 1) errors.push(`Invalid reps: ${set.reps}`);
        if (set.rpe !== undefined && (set.rpe < 1 || set.rpe > 10)) {
          errors.push(`Invalid RPE: ${set.rpe}`);
        }
      }
      return { valid: errors.length === 0, errors };
    },

    /**
     * Detects new personal records by comparing sets against existing PRs.
     */
    async detectPRs(
      userId: string,
      sets: SetInput[]
    ): Promise<NewPR[]> {
      const newPRs: NewPR[] = [];

      // Group sets by exercise, find max weight per exercise
      const maxByExercise = new Map<string, number>();
      for (const set of sets) {
        const current = maxByExercise.get(set.exerciseId) ?? 0;
        if (set.weight > current) {
          maxByExercise.set(set.exerciseId, set.weight);
        }
      }

      // Compare against existing PRs
      for (const [exerciseId, newWeight] of maxByExercise) {
        const existingPR = await repos.personalRecord.getByUserAndExercise(userId, exerciseId);
        const oldWeight = existingPR?.weight ?? 0;

        if (newWeight > oldWeight) {
          // Fetch exercise name for the celebration message
          const exercise = await repos.exercise.getById(exerciseId);
          const improvement = oldWeight > 0 ? (newWeight - oldWeight) / oldWeight : 1;

          newPRs.push({
            exerciseId,
            exerciseName: exercise?.name ?? 'Unknown',
            oldWeight,
            newWeight,
            improvement,
          });
        }
      }

      return newPRs;
    },

    /**
     * Finishes a workout: saves it, detects PRs, creates progress & activity events.
     */
    async finishWorkout(
      userId: string,
      input: FinishWorkoutInput
    ): Promise<FinishWorkoutResult> {
      // 1. Validate
      const validation = this.validateSets(input.sets);
      if (!validation.valid) {
        throw new Error(`Invalid workout: ${validation.errors.join(', ')}`);
      }

      // 2. Save the workout record
      const workout = await repos.workout.create(userId, input);

      // 3. Save all sets
      await repos.workoutSet.createMany(workout.id, input.sets);

      // 4. Detect new PRs
      const newPRs = await this.detectPRs(userId, input.sets);

      // 5. Process each new PR
      const progressEvents: ProgressEvent[] = [];
      const membership = await repos.gymMember.getUserGym(userId);

      for (const pr of newPRs) {
        // Upsert the personal record
        await repos.personalRecord.upsert(userId, pr.exerciseId, pr.newWeight);

        // Create a progress event (for leaderboard scoring)
        const progressEvent = await repos.progressEvent.create(userId, {
          gymId: membership?.gymId ?? null,
          exerciseId: pr.exerciseId,
          prBefore: pr.oldWeight,
          prAfter: pr.newWeight,
          progressScore: pr.improvement,
        });
        progressEvents.push(progressEvent);

        // Create an activity event (for gym feed)
        if (membership) {
          await repos.activityEvent.create({
            gymId: membership.gymId,
            userId,
            eventType: 'PR_BROKEN',
            eventPayload: {
              exercise: pr.exerciseName,
              oldPR: pr.oldWeight,
              newPR: pr.newWeight,
              unit: 'kg',
              improvement: Math.round(pr.improvement * 100),
            },
          });
        }
      }

      // 6. Post a workout-completed activity event (side-effect, wrapped to avoid hard failure)
      if (membership) {
        try {
          await repos.activityEvent.create({
            gymId: membership.gymId,
            userId,
            eventType: 'WORKOUT_COMPLETED',
            eventPayload: {
              title: input.title ?? 'Workout',
              sets: input.sets.length,
              durationSeconds: input.durationSeconds || 0,
              prsHit: newPRs.length,
            },
          });
        } catch (e) {
          // Silent catch for side effects in pure engine
        }
      }

      return { workout, newPRs, progressEvents };
    },
  };
}

export type WorkoutEngine = ReturnType<typeof createWorkoutEngine>;
