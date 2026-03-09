-- ==========================================
-- HeliX Demo Data Seed Script
-- ==========================================

-- 1. Get a list of exercise IDs (using the ones we seeded in init.sql)
-- We'll use these in workouts and events.

DO $$
DECLARE
    v_user_id UUID;
    v_bench_id UUID;
    v_squat_id UUID;
    v_deadlift_id UUID;
    v_gym_id UUID;
BEGIN
    -- Get the ID of the first user (assume you have signed up or signed in once)
    SELECT id INTO v_user_id FROM public.users LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No users found. Please sign in to the app with Google at least once before running this seed script.';
        RETURN;
    END IF;

    -- Get Exercise IDs
    SELECT id INTO v_bench_id FROM public.exercises WHERE name = 'Barbell Bench Press';
    SELECT id INTO v_squat_id FROM public.exercises WHERE name = 'Barbell Squat';
    SELECT id INTO v_deadlift_id FROM public.exercises WHERE name = 'Deadlift';

    -- Get a Gym ID
    SELECT id INTO v_gym_id FROM public.gyms WHERE name = 'Iron Valley Barbell';

    -- 2. Mock Workouts (Last 7 days)
    INSERT INTO public.workouts (user_id, title, duration_seconds, notes, completed_at)
    VALUES 
        (v_user_id, 'Morning Push', 3600, 'Feeling strong today.', now() - interval '6 days'),
        (v_user_id, 'Leg Day', 4500, 'Heavy squats.', now() - interval '4 days'),
        (v_user_id, 'Back & Deadlifts', 5000, 'PR attempt.', now() - interval '2 days');

    -- 3. Mock Sets for the PR attempt (Back & Deadlifts)
    -- We need a specific workout ID for this
    DECLARE
        v_last_workout_id UUID;
    BEGIN
        SELECT id INTO v_last_workout_id FROM public.workouts WHERE user_id = v_user_id ORDER BY completed_at DESC LIMIT 1;

        INSERT INTO public.workout_sets (workout_id, exercise_id, set_number, weight, reps, rpe)
        VALUES 
            (v_last_workout_id, v_deadlift_id, 1, 100, 5, 7),
            (v_last_workout_id, v_deadlift_id, 2, 120, 3, 8),
            (v_last_workout_id, v_deadlift_id, 3, 140, 1, 10);
    END;

    -- 4. Mock Personal Records
    INSERT INTO public.personal_records (user_id, exercise_id, weight, reps, achieved_at)
    VALUES 
        (v_user_id, v_bench_id, 100, 1, now() - interval '10 days'),
        (v_user_id, v_squat_id, 140, 1, now() - interval '8 days'),
        (v_user_id, v_deadlift_id, 160, 1, now() - interval '2 days')
    ON CONFLICT (user_id, exercise_id, record_type) DO UPDATE SET weight = EXCLUDED.weight;

    -- 5. Mock Progress Events (For the Leaderboard)
    INSERT INTO public.progress_events (user_id, gym_id, exercise_id, pr_before, pr_after, progress_score)
    VALUES 
        (v_user_id, v_gym_id, v_deadlift_id, 150, 160, 0.066),
        (v_user_id, v_gym_id, v_bench_id, 95, 100, 0.052);

    -- 6. Mock Activity Feed
    INSERT INTO public.activity_events (gym_id, user_id, event_type, event_payload)
    VALUES 
        (v_gym_id, v_user_id, 'PR_BROKEN', jsonb_build_object('exercise_name', 'Deadlift', 'weight', 160, 'reps', 1)),
        (v_gym_id, v_user_id, 'WORKOUT_COMPLETED', jsonb_build_object('workout_title', 'Back & Deadlifts', 'duration', '1h 23m'));

    -- 7. Join the gym if not already a member
    INSERT INTO public.gym_members (gym_id, user_id)
    VALUES (v_gym_id, v_user_id)
    ON CONFLICT DO NOTHING;

END $$;
