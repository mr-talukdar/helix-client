// ============================================================
// Repository Implementations — Supabase SDK
// Maps engine repo interfaces to actual Supabase queries
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import type {
  UserRepo, ExerciseRepo, WorkoutRepo, WorkoutSetRepo,
  PersonalRecordRepo, GymRepo, GymMemberRepo,
  ProgressEventRepo, ActivityEventRepo,
  UserProfile, Exercise, Workout, WorkoutSet, PersonalRecord,
  Gym, GymMembership, ProgressEvent, ActivityEvent,
  LeaderboardEntry, FinishWorkoutInput, SetInput,
  CreateProfileInput, UpdateProfileInput,
} from '@helix/engine';

type Supabase = any;

// ---- Helpers ----

function mapUser(row: Database['public']['Tables']['users']['Row']): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    gender: row.gender,
    age: row.age,
    height: row.height,
    weight: row.weight,
    experienceLevel: row.experience_level,
    goals: row.goals ?? [],
    createdAt: row.created_at,
  };
}

function mapExercise(row: Database['public']['Tables']['exercises']['Row']): Exercise {
  return {
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group,
    category: row.category,
    isCustom: row.is_custom,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function mapWorkout(row: Database['public']['Tables']['workouts']['Row']): Workout {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    durationSeconds: row.duration_seconds,
    notes: row.notes,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

function mapWorkoutSet(row: Database['public']['Tables']['workout_sets']['Row']): WorkoutSet {
  return {
    id: row.id,
    workoutId: row.workout_id,
    exerciseId: row.exercise_id,
    setNumber: row.set_number,
    weight: row.weight,
    reps: row.reps,
    rpe: row.rpe,
    completed: row.completed,
    createdAt: row.created_at,
  };
}

function mapPR(row: Database['public']['Tables']['personal_records']['Row']): PersonalRecord {
  return {
    id: row.id,
    userId: row.user_id,
    exerciseId: row.exercise_id,
    weight: row.weight,
    reps: row.reps,
    recordType: row.record_type,
    achievedAt: row.achieved_at,
  };
}

function mapGym(row: Database['public']['Tables']['gyms']['Row']): Gym {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    description: row.description,
    rules: row.rules ?? [],
    coverImageUrl: row.cover_image_url,
    createdAt: row.created_at,
  };
}

function mapMembership(row: Database['public']['Tables']['gym_members']['Row']): GymMembership {
  return {
    id: row.id,
    gymId: row.gym_id,
    userId: row.user_id,
    joinedAt: row.joined_at,
  };
}

function mapProgressEvent(row: Database['public']['Tables']['progress_events']['Row']): ProgressEvent {
  return {
    id: row.id,
    userId: row.user_id,
    gymId: row.gym_id,
    exerciseId: row.exercise_id,
    prBefore: row.pr_before,
    prAfter: row.pr_after,
    progressScore: row.progress_score,
    createdAt: row.created_at,
  };
}

function mapActivity(row: Database['public']['Tables']['activity_events']['Row']): ActivityEvent {
  return {
    id: row.id,
    gymId: row.gym_id,
    userId: row.user_id,
    eventType: row.event_type as ActivityEvent['eventType'],
    eventPayload: row.event_payload,
    createdAt: row.created_at,
  };
}

// ---- Repository Implementations ----

export function createUserRepo(db: Supabase): UserRepo {
  return {
    async create(userId: string, input: CreateProfileInput) {
      const { data, error } = await db.from('users').insert({
        id: userId,
        display_name: input.displayName,
        gender: input.gender,
        age: input.age,
        height: input.height,
        weight: input.weight,
        experience_level: input.experienceLevel,
        goals: input.goals,
      }).select().single();
      if (error) throw error;
      return mapUser(data);
    },
    async getById(userId: string) {
      const { data, error } = await db.from('users').select().eq('id', userId).single();
      if (error && error.code === 'PGRST116') return null;
      if (error) throw error;
      return mapUser(data);
    },
    async update(userId: string, input: UpdateProfileInput) {
      const { data, error } = await db.from('users').update({
        display_name: input.displayName,
        avatar_url: input.avatarUrl,
        gender: input.gender,
        age: input.age,
        height: input.height,
        weight: input.weight,
        experience_level: input.experienceLevel,
        goals: input.goals,
      }).eq('id', userId).select().single();
      if (error) throw error;
      return mapUser(data);
    },
  };
}

export function createExerciseRepo(db: Supabase): ExerciseRepo {
  return {
    async list(muscleGroup?: string) {
      let query = db.from('exercises').select();
      if (muscleGroup) query = query.eq('muscle_group', muscleGroup);
      const { data, error } = await query.order('name');
      if (error) throw error;
      return data.map(mapExercise);
    },
    async getById(id: string) {
      const { data, error } = await db.from('exercises').select().eq('id', id).single();
      if (error && error.code === 'PGRST116') return null;
      if (error) throw error;
      return mapExercise(data);
    },
    async createCustom(userId: string, name: string, muscleGroup: string) {
      const { data, error } = await db.from('exercises').insert({
        name,
        muscle_group: muscleGroup,
        is_custom: true,
        created_by: userId,
      }).select().single();
      if (error) throw error;
      return mapExercise(data);
    },
  };
}

export function createWorkoutRepo(db: Supabase): WorkoutRepo {
  return {
    async create(userId: string, input: FinishWorkoutInput) {
      const { data, error } = await db.from('workouts').insert({
        user_id: userId,
        title: input.title,
        duration_seconds: input.durationSeconds,
        notes: input.notes,
        started_at: input.startedAt,
      }).select().single();
      if (error) throw error;
      return mapWorkout(data);
    },
    async getById(id: string) {
      const { data, error } = await db.from('workouts').select().eq('id', id).single();
      if (error && error.code === 'PGRST116') return null;
      if (error) throw error;
      return mapWorkout(data);
    },
    async listByUser(userId: string, limit = 20) {
      const { data, error } = await db.from('workouts').select()
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data.map(mapWorkout);
    },
    async getHistory(userId: string, days: number) {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const { data, error } = await db.from('workouts').select()
        .eq('user_id', userId)
        .gte('completed_at', since.toISOString())
        .order('completed_at', { ascending: true });
      if (error) throw error;
      return data.map(mapWorkout);
    },
  };
}

export function createWorkoutSetRepo(db: Supabase): WorkoutSetRepo {
  return {
    async createMany(workoutId: string, sets: SetInput[]) {
      const rows = sets.map((s) => ({
        workout_id: workoutId,
        exercise_id: s.exerciseId,
        set_number: s.setNumber,
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe,
      }));
      const { data, error } = await db.from('workout_sets').insert(rows).select();
      if (error) throw error;
      return data.map(mapWorkoutSet);
    },
    async listByWorkout(workoutId: string) {
      const { data, error } = await db.from('workout_sets').select()
        .eq('workout_id', workoutId)
        .order('set_number');
      if (error) throw error;
      return data.map(mapWorkoutSet);
    },
  };
}

export function createPersonalRecordRepo(db: Supabase): PersonalRecordRepo {
  return {
    async getByUserAndExercise(userId: string, exerciseId: string) {
      const { data, error } = await db.from('personal_records').select()
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .eq('record_type', 'weight')
        .single();
      if (error && error.code === 'PGRST116') return null;
      if (error) throw error;
      return mapPR(data);
    },
    async upsert(userId: string, exerciseId: string, weight: number, reps?: number) {
      const { data, error } = await db.from('personal_records').upsert({
        user_id: userId,
        exercise_id: exerciseId,
        weight,
        reps,
        record_type: 'weight',
        achieved_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,exercise_id,record_type',
      }).select().single();
      if (error) throw error;
      return mapPR(data);
    },
    async listByUser(userId: string) {
      const { data, error } = await db.from('personal_records').select()
        .eq('user_id', userId)
        .order('achieved_at', { ascending: false });
      if (error) throw error;
      return data.map(mapPR);
    },
  };
}

export function createGymRepo(db: Supabase): GymRepo {
  return {
    async search(query: string) {
      const { data, error } = await db.from('gyms').select()
        .ilike('name', `%${query}%`)
        .limit(20);
      if (error) throw error;
      return data.map(mapGym);
    },
    async getById(id: string) {
      const { data, error } = await db.from('gyms').select().eq('id', id).single();
      if (error && error.code === 'PGRST116') return null;
      if (error) throw error;
      return mapGym(data);
    },
  };
}

export function createGymMemberRepo(db: Supabase): GymMemberRepo {
  return {
    async join(userId: string, gymId: string) {
      const { data, error } = await db.from('gym_members').insert({
        user_id: userId,
        gym_id: gymId,
      }).select().single();
      if (error) throw error;
      return mapMembership(data);
    },
    async leave(userId: string, gymId: string) {
      const { error } = await db.from('gym_members').delete()
        .eq('user_id', userId)
        .eq('gym_id', gymId);
      if (error) throw error;
    },
    async isMember(userId: string, gymId: string) {
      const { data, error } = await db.from('gym_members').select('id')
        .eq('user_id', userId)
        .eq('gym_id', gymId)
        .single();
      if (error && error.code === 'PGRST116') return false;
      if (error) throw error;
      return !!data;
    },
    async listByGym(gymId: string) {
      const { data, error } = await db.from('gym_members').select()
        .eq('gym_id', gymId);
      if (error) throw error;
      return data.map(mapMembership);
    },
    async getUserGym(userId: string) {
      const { data, error } = await db.from('gym_members').select()
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? mapMembership(data) : null;
    },
  };
}

export function createProgressEventRepo(db: Supabase): ProgressEventRepo {
  return {
    async create(userId: string, event: Omit<ProgressEvent, 'id' | 'createdAt' | 'userId'>) {
      const { data, error } = await db.from('progress_events').insert({
        user_id: userId,
        gym_id: event.gymId,
        exercise_id: event.exerciseId,
        pr_before: event.prBefore,
        pr_after: event.prAfter,
        progress_score: event.progressScore,
      }).select().single();
      if (error) throw error;
      return mapProgressEvent(data);
    },
    async getLeaderboard(gymId: string, since: string) {
      const { data, error } = await db.rpc('get_gym_leaderboard', {
        p_gym_id: gymId,
        p_since: since,
      });
      if (error) throw error;
      return (data ?? []).map((row: any, index: number) => ({
        userId: row.user_id,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        totalScore: row.total_score,
        rank: index + 1,
      }));
    },
  };
}

export function createActivityEventRepo(db: Supabase): ActivityEventRepo {
  return {
    async create(event: Omit<ActivityEvent, 'id' | 'createdAt'>) {
      const { data, error } = await db.from('activity_events').insert({
        gym_id: event.gymId,
        user_id: event.userId,
        event_type: event.eventType,
        event_payload: event.eventPayload,
      }).select().single();
      if (error) throw error;
      return mapActivity(data);
    },
    async listByGym(gymId: string, limit = 20, cursor?: string) {
      let query = db.from('activity_events').select()
        .eq('gym_id', gymId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (cursor) {
        query = query.lt('created_at', cursor);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data.map(mapActivity);
    },
  };
}
