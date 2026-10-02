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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          name: string
          position: number
          slug: string
          subcategories: string[]
        }
        Insert: {
          name: string
          position?: number
          slug: string
          subcategories?: string[]
        }
        Update: {
          name?: string
          position?: number
          slug?: string
          subcategories?: string[]
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_ksh: number
          created_at: string
          id: string
          method: string
          purpose: string | null
          reference: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_ksh: number
          created_at?: string
          id?: string
          method: string
          purpose?: string | null
          reference?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_ksh?: number
          created_at?: string
          id?: string
          method?: string
          purpose?: string | null
          reference?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      product_enquiries: {
        Row: {
          buyer_id: string | null
          channel: string
          created_at: string
          id: string
          product_id: string
          seller_id: string
        }
        Insert: {
          buyer_id?: string | null
          channel: string
          created_at?: string
          id?: string
          product_id: string
          seller_id: string
        }
        Update: {
          buyer_id?: string | null
          channel?: string
          created_at?: string
          id?: string
          product_id?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_enquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_slug: string
          condition: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          images: string[]
          is_vip: boolean
          location: string | null
          price_ksh: number
          rejection_reason: string | null
          seller_id: string
          status: Database["public"]["Enums"]["product_status"]
          subcategory: string | null
          title: string
          updated_at: string
          video_url: string | null
          views: number
          vip_expires_at: string | null
        }
        Insert: {
          category_slug: string
          condition?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          is_vip?: boolean
          location?: string | null
          price_ksh?: number
          rejection_reason?: string | null
          seller_id: string
          status?: Database["public"]["Enums"]["product_status"]
          subcategory?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
          views?: number
          vip_expires_at?: string | null
        }
        Update: {
          category_slug?: string
          condition?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          is_vip?: boolean
          location?: string | null
          price_ksh?: number
          rejection_reason?: string | null
          seller_id?: string
          status?: Database["public"]["Enums"]["product_status"]
          subcategory?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
          views?: number
          vip_expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_slug_fkey"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["slug"]
          },
        ]
      }
      profiles: {
        Row: {
          about: string | null
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          id_document_url: string | null
          id_verified: boolean
          location: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          about?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          id_document_url?: string | null
          id_verified?: boolean
          location?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          about?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          id_document_url?: string | null
          id_verified?: boolean
          location?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          id: string
          product_id: string
          reason: string
          reporter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          reason: string
          reporter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          reason?: string
          reporter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_packages: {
        Row: {
          cadence: string
          description: string | null
          id: string
          listing_limit: number
          name: string
          popular: boolean
          price_ksh: number
        }
        Insert: {
          cadence: string
          description?: string | null
          id: string
          listing_limit: number
          name: string
          popular?: boolean
          price_ksh: number
        }
        Update: {
          cadence?: string
          description?: string | null
          id?: string
          listing_limit?: number
          name?: string
          popular?: boolean
          price_ksh?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          package_id: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          package_id: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          package_id?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "subscription_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          ai_suggested_reply: string | null
          ai_summary: string | null
          ai_topic: string | null
          ai_urgency: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          topic: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ai_suggested_reply?: string | null
          ai_summary?: string | null
          ai_topic?: string | null
          ai_urgency?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          topic?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ai_suggested_reply?: string | null
          ai_summary?: string | null
          ai_topic?: string | null
          ai_urgency?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          topic?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      support_replies: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          is_admin: boolean
          message_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          is_admin?: boolean
          message_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_admin?: boolean
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_replies_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "support_messages"
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
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_user: { Args: { target_user_id: string }; Returns: boolean }
      admin_exists: { Args: never; Returns: boolean }
      admin_set_user_role: {
        Args: { target_role: string; target_user_id: string }
        Returns: boolean
      }
      admin_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          role: string
        }[]
      }
      become_seller: { Args: never; Returns: boolean }
      bootstrap_first_admin: {
        Args: { target_full_name?: string }
        Returns: boolean
      }
      get_my_role: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          _action: string
          _details: Json
          _table: string
          _target: string
        }
        Returns: undefined
      }
      record_product_view: { Args: { _product_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "seller" | "buyer"
      product_status: "pending" | "active" | "hidden" | "rejected"
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
    Enums: {
      app_role: ["admin", "seller", "buyer"],
      product_status: ["pending", "active", "hidden", "rejected"],
    },
  },
} as const
