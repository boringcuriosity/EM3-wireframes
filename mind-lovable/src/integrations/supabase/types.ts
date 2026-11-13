export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      box_breathing_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          cycles_completed: number | null
          duration_seconds: number | null
          id: string
          mobile: string
          started_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          cycles_completed?: number | null
          duration_seconds?: number | null
          id?: string
          mobile: string
          started_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          cycles_completed?: number | null
          duration_seconds?: number | null
          id?: string
          mobile?: string
          started_at?: string | null
        }
        Relationships: []
      }
      breathing_exercise_sessions: {
        Row: {
          completed_cycles: number
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          exercise_name: string
          exercise_type: string
          id: string
          mobile: string
          session_id: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          completed_cycles?: number
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          exercise_name: string
          exercise_type: string
          id?: string
          mobile: string
          session_id: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          completed_cycles?: number
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          exercise_name?: string
          exercise_type?: string
          id?: string
          mobile?: string
          session_id?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      cbt_tool_usage: {
        Row: {
          created_at: string
          id: string
          mobile: string
          opened_at: string
          tool_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          mobile: string
          opened_at?: string
          tool_name: string
        }
        Update: {
          created_at?: string
          id?: string
          mobile?: string
          opened_at?: string
          tool_name?: string
        }
        Relationships: []
      }
      circle_of_control_responses: {
        Row: {
          attempt_number: number | null
          correct_zone: string
          created_at: string
          id: string
          item_text: string
          mobile: string
          placed_zone: string
          session_id: string | null
          was_correct: boolean
        }
        Insert: {
          attempt_number?: number | null
          correct_zone: string
          created_at?: string
          id?: string
          item_text: string
          mobile: string
          placed_zone: string
          session_id?: string | null
          was_correct: boolean
        }
        Update: {
          attempt_number?: number | null
          correct_zone?: string
          created_at?: string
          id?: string
          item_text?: string
          mobile?: string
          placed_zone?: string
          session_id?: string | null
          was_correct?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "circle_of_control_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "circle_of_control_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_of_control_sessions: {
        Row: {
          completed_at: string | null
          correct_first_try: number | null
          created_at: string
          id: string
          mobile: string
          started_at: string | null
          total_attempts: number | null
          total_items: number | null
        }
        Insert: {
          completed_at?: string | null
          correct_first_try?: number | null
          created_at?: string
          id?: string
          mobile: string
          started_at?: string | null
          total_attempts?: number | null
          total_items?: number | null
        }
        Update: {
          completed_at?: string | null
          correct_first_try?: number | null
          created_at?: string
          id?: string
          mobile?: string
          started_at?: string | null
          total_attempts?: number | null
          total_items?: number | null
        }
        Relationships: []
      }
      coach_notes: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          created_at: string
          id: string
          mobile: string
          note_text: string
          updated_at: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string
          id?: string
          mobile: string
          note_text?: string
          updated_at?: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string
          id?: string
          mobile?: string
          note_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_entries: {
        Row: {
          created_at: string
          entry_date: string
          focus_area_id: string | null
          focus_area_title: string | null
          gratitude: Json | null
          id: string
          materials_used: Json | null
          mobile: string
          motivation: Json | null
          smart_goal: Json | null
          updated_at: string
          worry_tree: Json | null
        }
        Insert: {
          created_at?: string
          entry_date: string
          focus_area_id?: string | null
          focus_area_title?: string | null
          gratitude?: Json | null
          id?: string
          materials_used?: Json | null
          mobile: string
          motivation?: Json | null
          smart_goal?: Json | null
          updated_at?: string
          worry_tree?: Json | null
        }
        Update: {
          created_at?: string
          entry_date?: string
          focus_area_id?: string | null
          focus_area_title?: string | null
          gratitude?: Json | null
          id?: string
          materials_used?: Json | null
          mobile?: string
          motivation?: Json | null
          smart_goal?: Json | null
          updated_at?: string
          worry_tree?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_entries_focus_area_id_fkey"
            columns: ["focus_area_id"]
            isOneToOne: false
            referencedRelation: "focus_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      five_finger_breathing_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          mobile: string
          started_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          mobile: string
          started_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          mobile?: string
          started_at?: string | null
        }
        Relationships: []
      }
      focus_areas: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id: string
          is_active?: boolean
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title?: string
        }
        Relationships: []
      }
      grounding_sessions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          mobile: string
          viewed_at: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          mobile: string
          viewed_at?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          mobile?: string
          viewed_at?: string | null
        }
        Relationships: []
      }
      journal_records: {
        Row: {
          answer_text: string
          created_at: string
          entry_date: string
          id: string
          mobile: string
          question_id: string
          question_text_snapshot: string
          section: string
          updated_at: string
        }
        Insert: {
          answer_text?: string
          created_at?: string
          entry_date: string
          id?: string
          mobile: string
          question_id: string
          question_text_snapshot: string
          section: string
          updated_at?: string
        }
        Update: {
          answer_text?: string
          created_at?: string
          entry_date?: string
          id?: string
          mobile?: string
          question_id?: string
          question_text_snapshot?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          content: string | null
          created_at: string
          focus_area_id: string
          id: string
          is_active: boolean
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          focus_area_id: string
          id: string
          is_active?: boolean
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string
          focus_area_id?: string
          id?: string
          is_active?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_focus_area_id_fkey"
            columns: ["focus_area_id"]
            isOneToOne: false
            referencedRelation: "focus_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      note_attachments: {
        Row: {
          created_at: string
          file_type: string
          file_url: string
          id: string
          note_id: string
        }
        Insert: {
          created_at?: string
          file_type?: string
          file_url: string
          id?: string
          note_id: string
        }
        Update: {
          created_at?: string
          file_type?: string
          file_url?: string
          id?: string
          note_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_attachments_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "coach_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      template_assignments: {
        Row: {
          assigned_at: string
          assigned_date: string
          fill_count: number
          habit_duration_weeks: number
          habit_names: string[]
          id: string
          is_active: boolean
          mobile: string
          template_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_date?: string
          fill_count?: number
          habit_duration_weeks?: number
          habit_names?: string[]
          id?: string
          is_active?: boolean
          mobile: string
          template_id: string
        }
        Update: {
          assigned_at?: string
          assigned_date?: string
          fill_count?: number
          habit_duration_weeks?: number
          habit_names?: string[]
          id?: string
          is_active?: boolean
          mobile?: string
          template_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          mobile: string
        }
        Insert: {
          created_at?: string
          mobile: string
        }
        Update: {
          created_at?: string
          mobile?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
