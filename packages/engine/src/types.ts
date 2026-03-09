// ============================================================
// HeliX Core Decision Engine — Type Definitions
// Pure TypeScript. No framework imports. No DB imports.
// ============================================================

// ---- User Domain ----

export interface UserProfile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  gender: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  experienceLevel: string | null;
  goals: string[];
  createdAt: string;
}

export interface CreateProfileInput {
  displayName: string;
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  experienceLevel?: string;
  goals?: string[];
}

export interface UpdateProfileInput {
  displayName?: string;
  avatarUrl?: string;
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  experienceLevel?: string;
  goals?: string[];
}

// ---- Exercise Domain ----

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  category: string | null;
  isCustom: boolean;
  createdBy: string | null;
  createdAt: string;
}

// ---- Workout Domain ----

export interface Workout {
  id: string;
  userId: string;
  title: string | null;
  durationSeconds: number | null;
  notes: string | null;
  startedAt: string | null;
  completedAt: string;
}

export interface WorkoutSet {
  id: string;
  workoutId: string;
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number | null;
  completed: boolean;
  createdAt: string;
}

export interface SetInput {
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
}

export interface FinishWorkoutInput {
  title?: string;
  durationSeconds?: number;
  notes?: string;
  startedAt?: string;
  sets: SetInput[];
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  weight: number;
  reps: number | null;
  recordType: string;
  achievedAt: string;
}

export interface NewPR {
  exerciseId: string;
  exerciseName: string;
  oldWeight: number;
  newWeight: number;
  improvement: number; // percentage
}

export interface FinishWorkoutResult {
  workout: Workout;
  newPRs: NewPR[];
  progressEvents: ProgressEvent[];
}

// ---- Gym Domain ----

export interface Gym {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  rules: string[];
  coverImageUrl: string | null;
  memberCount?: number;
  createdAt: string;
}

export interface GymMembership {
  id: string;
  gymId: string;
  userId: string;
  joinedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  totalScore: number;
  rank: number;
}

// ---- Progress Domain ----

export interface ProgressEvent {
  id: string;
  userId: string;
  gymId: string | null;
  exerciseId: string;
  prBefore: number;
  prAfter: number;
  progressScore: number;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  gymId: string;
  userId: string;
  eventType: 'PR_BROKEN' | 'WORKOUT_COMPLETED' | 'WEEKLY_MILESTONE' | 'MEMBER_JOINED';
  eventPayload: Record<string, unknown>;
  createdAt: string;
}

export interface ProgressSummary {
  totalWorkouts: number;
  totalSets: number;
  totalVolume: number;
  prCount: number;
  averageProgressScore: number;
}

export interface TrendDataPoint {
  date: string;
  weight: number;
  volume: number;
}

// ---- Repository Interfaces (Dependency Injection) ----

export interface UserRepo {
  create(userId: string, input: CreateProfileInput): Promise<UserProfile>;
  getById(userId: string): Promise<UserProfile | null>;
  update(userId: string, input: UpdateProfileInput): Promise<UserProfile>;
}

export interface ExerciseRepo {
  list(muscleGroup?: string): Promise<Exercise[]>;
  getById(id: string): Promise<Exercise | null>;
  createCustom(userId: string, name: string, muscleGroup: string): Promise<Exercise>;
}

export interface WorkoutRepo {
  create(userId: string, input: FinishWorkoutInput): Promise<Workout>;
  getById(id: string): Promise<Workout | null>;
  listByUser(userId: string, limit?: number): Promise<Workout[]>;
  getHistory(userId: string, days: number): Promise<Workout[]>;
}

export interface WorkoutSetRepo {
  createMany(workoutId: string, sets: SetInput[]): Promise<WorkoutSet[]>;
  listByWorkout(workoutId: string): Promise<WorkoutSet[]>;
}

export interface PersonalRecordRepo {
  getByUserAndExercise(userId: string, exerciseId: string): Promise<PersonalRecord | null>;
  upsert(userId: string, exerciseId: string, weight: number, reps?: number): Promise<PersonalRecord>;
  listByUser(userId: string): Promise<PersonalRecord[]>;
}

export interface GymRepo {
  search(query: string): Promise<Gym[]>;
  getById(id: string): Promise<Gym | null>;
}

export interface GymMemberRepo {
  join(userId: string, gymId: string): Promise<GymMembership>;
  leave(userId: string, gymId: string): Promise<void>;
  isMember(userId: string, gymId: string): Promise<boolean>;
  listByGym(gymId: string): Promise<GymMembership[]>;
  getUserGym(userId: string): Promise<GymMembership | null>;
}

export interface ProgressEventRepo {
  create(userId: string, event: Omit<ProgressEvent, 'id' | 'userId' | 'createdAt'>): Promise<ProgressEvent>;
  getLeaderboard(gymId: string, since: string): Promise<LeaderboardEntry[]>;
}

export interface ActivityEventRepo {
  create(event: Omit<ActivityEvent, 'id' | 'createdAt'>): Promise<ActivityEvent>;
  listByGym(gymId: string, limit?: number, cursor?: string): Promise<ActivityEvent[]>;
}

// ---- Engine Interfaces ----

export interface EngineRepos {
  user: UserRepo;
  exercise: ExerciseRepo;
  workout: WorkoutRepo;
  workoutSet: WorkoutSetRepo;
  personalRecord: PersonalRecordRepo;
  gym: GymRepo;
  gymMember: GymMemberRepo;
  progressEvent: ProgressEventRepo;
  activityEvent: ActivityEventRepo;
}
