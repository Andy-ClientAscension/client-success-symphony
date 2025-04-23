export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
