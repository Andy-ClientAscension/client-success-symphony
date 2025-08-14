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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      backend_offers: {
        Row: {
          client_id: string
          created_at: string
          id: string
          offer_amount: number
          offer_type: string
          response_at: string | null
          response_notes: string | null
          sent_at: string | null
          status: string
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          offer_amount: number
          offer_type: string
          response_at?: string | null
          response_notes?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          offer_amount?: number
          offer_type?: string
          response_at?: string | null
          response_notes?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          assigned_ssc: string | null
          backend_students: number | null
          calls_booked: number | null
          case_study_completed: boolean | null
          case_study_conducted: boolean | null
          case_study_notes: string | null
          case_study_scheduled_date: string | null
          contract_value: number
          created_at: string
          created_by: string | null
          csm: string | null
          deals_closed: number | null
          email: string | null
          end_date: string
          growth: number | null
          health_score: number | null
          id: string
          last_communication: string | null
          last_payment_amount: number | null
          last_payment_date: string | null
          logo: string | null
          mrr: number | null
          name: string
          notes: string | null
          nps_score: number | null
          phone: string | null
          progress: number | null
          referral_count: number | null
          referral_names: string[] | null
          service: string | null
          start_date: string
          status: string
          team: string | null
          trustpilot_date: string | null
          trustpilot_link: string | null
          trustpilot_rating: number | null
          updated_at: string
        }
        Insert: {
          assigned_ssc?: string | null
          backend_students?: number | null
          calls_booked?: number | null
          case_study_completed?: boolean | null
          case_study_conducted?: boolean | null
          case_study_notes?: string | null
          case_study_scheduled_date?: string | null
          contract_value?: number
          created_at?: string
          created_by?: string | null
          csm?: string | null
          deals_closed?: number | null
          email?: string | null
          end_date: string
          growth?: number | null
          health_score?: number | null
          id?: string
          last_communication?: string | null
          last_payment_amount?: number | null
          last_payment_date?: string | null
          logo?: string | null
          mrr?: number | null
          name: string
          notes?: string | null
          nps_score?: number | null
          phone?: string | null
          progress?: number | null
          referral_count?: number | null
          referral_names?: string[] | null
          service?: string | null
          start_date: string
          status: string
          team?: string | null
          trustpilot_date?: string | null
          trustpilot_link?: string | null
          trustpilot_rating?: number | null
          updated_at?: string
        }
        Update: {
          assigned_ssc?: string | null
          backend_students?: number | null
          calls_booked?: number | null
          case_study_completed?: boolean | null
          case_study_conducted?: boolean | null
          case_study_notes?: string | null
          case_study_scheduled_date?: string | null
          contract_value?: number
          created_at?: string
          created_by?: string | null
          csm?: string | null
          deals_closed?: number | null
          email?: string | null
          end_date?: string
          growth?: number | null
          health_score?: number | null
          id?: string
          last_communication?: string | null
          last_payment_amount?: number | null
          last_payment_date?: string | null
          logo?: string | null
          mrr?: number | null
          name?: string
          notes?: string | null
          nps_score?: number | null
          phone?: string | null
          progress?: number | null
          referral_count?: number | null
          referral_names?: string[] | null
          service?: string | null
          start_date?: string
          status?: string
          team?: string | null
          trustpilot_date?: string | null
          trustpilot_link?: string | null
          trustpilot_rating?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      communications: {
        Row: {
          client_id: string
          content: string
          created_at: string
          date: string
          id: string
          sent_by: string
          subject: string
          type: string
        }
        Insert: {
          client_id: string
          content: string
          created_at?: string
          date?: string
          id?: string
          sent_by: string
          subject: string
          type: string
        }
        Update: {
          client_id?: string
          content?: string
          created_at?: string
          date?: string
          id?: string
          sent_by?: string
          subject?: string
          type?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          related_id: string | null
          related_table: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          related_id?: string | null
          related_table?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          related_id?: string | null
          related_table?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      renewal_forecasts: {
        Row: {
          client_id: string
          created_at: string
          current_contract_value: number
          forecast_date: string
          forecast_notes: string | null
          id: string
          likelihood_status: string
          potential_upsell_value: number | null
          renewal_date: string
        }
        Insert: {
          client_id: string
          created_at?: string
          current_contract_value: number
          forecast_date?: string
          forecast_notes?: string | null
          id?: string
          likelihood_status: string
          potential_upsell_value?: number | null
          renewal_date: string
        }
        Update: {
          client_id?: string
          created_at?: string
          current_contract_value?: number
          forecast_date?: string
          forecast_notes?: string | null
          id?: string
          likelihood_status?: string
          potential_upsell_value?: number | null
          renewal_date?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_by: string
          assigned_to: string
          completion_date: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_by: string
          assigned_to: string
          completion_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string
          assigned_to?: string
          completion_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_sales_access: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "user"],
    },
  },
} as const
