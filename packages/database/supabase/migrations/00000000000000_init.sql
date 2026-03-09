-- ==========================================
-- HeliX Core Database Schema
-- ==========================================

-- Enable requisite extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  gender TEXT,
  age INTEGER,
  height FLOAT,
  weight FLOAT,
  experience_level TEXT,
  goals TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Exercises
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  category TEXT,
  is_custom BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Workouts
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  duration_seconds INTEGER,
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Workout Sets
CREATE TABLE public.workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id),
  set_number INTEGER NOT NULL,
  weight FLOAT NOT NULL,
  reps INTEGER NOT NULL,
  rpe INTEGER,
  completed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Personal Records
CREATE TABLE public.personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id),
  weight FLOAT NOT NULL,
  reps INTEGER,
  record_type TEXT DEFAULT 'weight',
  achieved_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, exercise_id, record_type)
);

-- 6. Gyms
CREATE TABLE public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  rules TEXT[],
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Gym Members
CREATE TABLE public.gym_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gym_id, user_id)
);

-- 8. Progress Events (improvement-based scoring)
CREATE TABLE public.progress_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES public.gyms(id),
  exercise_id UUID NOT NULL REFERENCES public.exercises(id),
  pr_before FLOAT NOT NULL,
  pr_after FLOAT NOT NULL,
  progress_score FLOAT NOT NULL,  -- (new - old) / old
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Activity Events (event-sourced feed)
CREATE TABLE public.activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,       -- 'PR_BROKEN', 'WORKOUT_COMPLETED', etc.
  event_payload JSONB NOT NULL,   -- Raw immutable fact
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- Leaderboard Logic
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_gym_leaderboard(p_gym_id UUID, p_since TIMESTAMPTZ)
RETURNS TABLE(user_id UUID, display_name TEXT, avatar_url TEXT, total_score FLOAT)
LANGUAGE sql STABLE AS $$
  SELECT u.id, u.display_name, u.avatar_url, SUM(pe.progress_score) as total_score
  FROM progress_events pe
  JOIN users u ON u.id = pe.user_id
  WHERE pe.gym_id = p_gym_id AND pe.created_at >= p_since
  GROUP BY u.id, u.display_name, u.avatar_url
  ORDER BY total_score DESC
  LIMIT 50;
$$;

-- ==========================================
-- Row Level Security (RLS)
-- ==========================================

-- Users: own data only
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_data" ON public.users FOR ALL USING (auth.uid() = id);

-- Exercises: read all, write own custom
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all_exercises" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "insert_custom_exercises" ON public.exercises FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_custom = true);

-- Workouts: own data only
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_workouts" ON public.workouts FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Workout Sets: own data only (via workout)
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_sets" ON public.workout_sets FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.workouts WHERE id = workout_id
    )
  );

-- Personal Records: own data only
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_prs" ON public.personal_records FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Gyms: read all
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all_gyms" ON public.gyms FOR SELECT USING (true);

-- Gym Members: read all, write own membership
ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_all_memberships" ON public.gym_members FOR SELECT USING (true);
CREATE POLICY "users_join_gyms" ON public.gym_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_leave_gyms" ON public.gym_members FOR DELETE
  USING (auth.uid() = user_id);

-- Progress Events: read gym peers, write own
ALTER TABLE public.progress_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gym_members_view_progress" ON public.progress_events FOR SELECT
  USING (gym_id IN (SELECT gym_id FROM public.gym_members WHERE user_id = auth.uid()));
CREATE POLICY "users_insert_progress" ON public.progress_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Activity Events: read gym peers, write own
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gym_members_view_feed" ON public.activity_events FOR SELECT
  USING (gym_id IN (SELECT gym_id FROM public.gym_members WHERE user_id = auth.uid()));
CREATE POLICY "users_insert_activity" ON public.activity_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- Triggers: Auto-create User Profile on Signup
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, display_name, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- Seed Default Exercises
-- ==========================================

INSERT INTO public.exercises (name, muscle_group, category, is_custom) VALUES
  ('Barbell Bench Press', 'Chest', 'Barbell', false),
  ('Incline Dumbbell Press', 'Chest', 'Dumbbell', false),
  ('Cable Crossover', 'Chest', 'Cable', false),
  ('Barbell Squat', 'Legs', 'Barbell', false),
  ('Leg Press', 'Legs', 'Machine', false),
  ('Romanian Deadlift', 'Legs', 'Barbell', false),
  ('Deadlift', 'Back', 'Barbell', false),
  ('Pull-up', 'Back', 'Bodyweight', false),
  ('Barbell Row', 'Back', 'Barbell', false),
  ('Overhead Press', 'Shoulders', 'Barbell', false),
  ('Lateral Raise', 'Shoulders', 'Dumbbell', false),
  ('Barbell Curl', 'Arms', 'Barbell', false),
  ('Tricep Extension', 'Arms', 'Cable', false)
ON CONFLICT DO NOTHING;

-- ==========================================
-- Seed Mock Gyms
-- ==========================================

INSERT INTO public.gyms (name, location, description, rules, cover_image_url) VALUES
  ('Iron Valley Barbell', 'Downtown, City Center', 'A serious gym for powerlifters, bodybuilders, and strength athletes. No AC, just chalk and iron.', ARRAY['Re-rack your weights', 'Chalk is encouraged', 'No tripod filming during peak hours'], 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=1000'),
  ('Apex Fitness HQ', 'Westside Plaza', 'Modern, clean, and fully equipped facility for functional training and general fitness.', ARRAY['Wipe down equipment after use', 'No dropping weights', 'Keep gym bags in lockers'], 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000')
ON CONFLICT DO NOTHING;
