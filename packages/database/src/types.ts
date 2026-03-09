// ============================================================
// Database Types — Maps Supabase table structure to TypeScript
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          gender: string | null;
          age: number | null;
          height: number | null;
          weight: number | null;
          experience_level: string | null;
          goals: string[] | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          gender?: string | null;
          age?: number | null;
          height?: number | null;
          weight?: number | null;
          experience_level?: string | null;
          goals?: string[] | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      exercises: {
        Row: {
          id: string;
          name: string;
          muscle_group: string;
          category: string | null;
          is_custom: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          muscle_group: string;
          category?: string | null;
          is_custom?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['exercises']['Insert']>;
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          duration_seconds: number | null;
          notes: string | null;
          started_at: string | null;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          duration_seconds?: number | null;
          notes?: string | null;
          started_at?: string | null;
          completed_at?: string;
        };
        Update: Partial<Database['public']['Tables']['workouts']['Insert']>;
      };
      workout_sets: {
        Row: {
          id: string;
          workout_id: string;
          exercise_id: string;
          set_number: number;
          weight: number;
          reps: number;
          rpe: number | null;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          workout_id: string;
          exercise_id: string;
          set_number: number;
          weight: number;
          reps: number;
          rpe?: number | null;
          completed?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['workout_sets']['Insert']>;
      };
      personal_records: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string;
          weight: number;
          reps: number | null;
          record_type: string;
          achieved_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise_id: string;
          weight: number;
          reps?: number | null;
          record_type?: string;
          achieved_at?: string;
        };
        Update: Partial<Database['public']['Tables']['personal_records']['Insert']>;
      };
      gyms: {
        Row: {
          id: string;
          name: string;
          location: string | null;
          description: string | null;
          rules: string[] | null;
          cover_image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location?: string | null;
          description?: string | null;
          rules?: string[] | null;
          cover_image_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['gyms']['Insert']>;
      };
      gym_members: {
        Row: {
          id: string;
          gym_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: Partial<Database['public']['Tables']['gym_members']['Insert']>;
      };
      progress_events: {
        Row: {
          id: string;
          user_id: string;
          gym_id: string | null;
          exercise_id: string;
          pr_before: number;
          pr_after: number;
          progress_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          gym_id?: string | null;
          exercise_id: string;
          pr_before: number;
          pr_after: number;
          progress_score: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['progress_events']['Insert']>;
      };
      activity_events: {
        Row: {
          id: string;
          gym_id: string;
          user_id: string;
          event_type: string;
          event_payload: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          user_id: string;
          event_type: string;
          event_payload: Record<string, unknown>;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['activity_events']['Insert']>;
      };
    };
    Functions: {
      get_gym_leaderboard: {
        Args: { p_gym_id: string; p_since: string };
        Returns: Array<{
          user_id: string;
          display_name: string | null;
          avatar_url: string | null;
          total_score: number;
        }>;
      };
    };
    Views: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
}
