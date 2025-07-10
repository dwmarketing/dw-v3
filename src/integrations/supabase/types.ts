export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      creative_performance: {
        Row: {
          clicks: number
          conversion_rate: number | null
          conversions: number
          cost: number
          created_at: string
          creative_id: string
          creative_name: string
          ctr: number | null
          date: string
          id: string
          impressions: number
          revenue: number
          roas: number | null
          updated_at: string
        }
        Insert: {
          clicks?: number
          conversion_rate?: number | null
          conversions?: number
          cost?: number
          created_at?: string
          creative_id: string
          creative_name: string
          ctr?: number | null
          date: string
          id?: string
          impressions?: number
          revenue?: number
          roas?: number | null
          updated_at?: string
        }
        Update: {
          clicks?: number
          conversion_rate?: number | null
          conversions?: number
          cost?: number
          created_at?: string
          creative_id?: string
          creative_name?: string
          ctr?: number | null
          date?: string
          id?: string
          impressions?: number
          revenue?: number
          roas?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_events: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_email: string
          customer_id: string
          customer_name: string | null
          event_date: string
          event_type: string
          frequency: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          plan: string
          subscription_id: string | null
          subscription_number: number | null
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          customer_email: string
          customer_id: string
          customer_name?: string | null
          event_date?: string
          event_type: string
          frequency?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          plan: string
          subscription_id?: string | null
          subscription_number?: number | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_email?: string
          customer_id?: string
          customer_name?: string | null
          event_date?: string
          event_type?: string
          frequency?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          plan?: string
          subscription_id?: string | null
          subscription_number?: number | null
        }
        Relationships: []
      }
      user_chart_permissions: {
        Row: {
          can_view: boolean
          chart_type: Database["public"]["Enums"]["chart_type"]
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_view?: boolean
          chart_type: Database["public"]["Enums"]["chart_type"]
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_view?: boolean
          chart_type?: Database["public"]["Enums"]["chart_type"]
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_chart_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_page_permissions: {
        Row: {
          can_access: boolean
          created_at: string
          id: string
          page: Database["public"]["Enums"]["page"]
          updated_at: string
          user_id: string
        }
        Insert: {
          can_access?: boolean
          created_at?: string
          id?: string
          page: Database["public"]["Enums"]["page"]
          updated_at?: string
          user_id: string
        }
        Update: {
          can_access?: boolean
          created_at?: string
          id?: string
          page?: Database["public"]["Enums"]["page"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_page_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      agent_conversation_status: "active" | "archived" | "closed"
      app_role: "user" | "admin" | "business_manager"
      chart_type:
        | "kpi_total_investido"
        | "kpi_receita"
        | "kpi_ticket_medio"
        | "kpi_total_pedidos"
        | "creative_performance_chart"
        | "creative_sales_chart"
        | "sales_summary_cards"
        | "sales_chart"
        | "country_sales_chart"
        | "state_sales_chart"
        | "affiliate_chart"
        | "subscription_renewals_chart"
        | "subscription_status_chart"
        | "new_subscribers_chart"
      message_role: "user" | "assistant" | "system"
      page:
        | "dashboard"
        | "settings"
        | "analytics"
        | "billing"
        | "creatives"
        | "sales"
        | "affiliates"
        | "revenue"
        | "users"
        | "business-managers"
        | "subscriptions"
      training_data_status: "pending" | "approved" | "rejected"
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
      agent_conversation_status: ["active", "archived", "closed"],
      app_role: ["user", "admin", "business_manager"],
      chart_type: [
        "kpi_total_investido",
        "kpi_receita",
        "kpi_ticket_medio",
        "kpi_total_pedidos",
        "creative_performance_chart",
        "creative_sales_chart",
        "sales_summary_cards",
        "sales_chart",
        "country_sales_chart",
        "state_sales_chart",
        "affiliate_chart",
        "subscription_renewals_chart",
        "subscription_status_chart",
        "new_subscribers_chart",
      ],
      message_role: ["user", "assistant", "system"],
      page: [
        "dashboard",
        "settings",
        "analytics",
        "billing",
        "creatives",
        "sales",
        "affiliates",
        "revenue",
        "users",
        "business-managers",
        "subscriptions",
      ],
      training_data_status: ["pending", "approved", "rejected"],
    },
  },
} as const
