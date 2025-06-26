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
      assessments: {
        Row: {
          age: number | null
          assessment_text: string | null
          back_photo: string
          bmi: number | null
          body_fat_percentage: number | null
          created_at: string
          fat_mass: number | null
          front_photo: string
          id: string
          lean_mass: number | null
          side_photo: string
          status: string | null
          tier: string
          updated_at: string
          user_id: number
        }
        Insert: {
          age?: number | null
          assessment_text?: string | null
          back_photo: string
          bmi?: number | null
          body_fat_percentage?: number | null
          created_at?: string
          fat_mass?: number | null
          front_photo: string
          id?: string
          lean_mass?: number | null
          side_photo: string
          status?: string | null
          tier?: string
          updated_at?: string
          user_id: number
        }
        Update: {
          age?: number | null
          assessment_text?: string | null
          back_photo?: string
          bmi?: number | null
          body_fat_percentage?: number | null
          created_at?: string
          fat_mass?: number | null
          front_photo?: string
          id?: string
          lean_mass?: number | null
          side_photo?: string
          status?: string | null
          tier?: string
          updated_at?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cidades: {
        Row: {
          estado_id: string
          estado_sigla: string | null
          id: string
          nome: string
        }
        Insert: {
          estado_id: string
          estado_sigla?: string | null
          id?: string
          nome: string
        }
        Update: {
          estado_id?: string
          estado_sigla?: string | null
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "cidades_estado_id_fkey"
            columns: ["estado_id"]
            isOneToOne: false
            referencedRelation: "estados"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          assessment_id: string | null
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          source: string
          type: string
          user_id: number
        }
        Insert: {
          amount: number
          assessment_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          source?: string
          type: string
          user_id: number
        }
        Update: {
          amount?: number
          assessment_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          source?: string
          type?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      estados: {
        Row: {
          id: string
          nome: string
          sigla: string
        }
        Insert: {
          id?: string
          nome: string
          sigla: string
        }
        Update: {
          id?: string
          nome?: string
          sigla?: string
        }
        Relationships: []
      }
      hotmart_products: {
        Row: {
          assessment_access: boolean | null
          created_at: string
          credits_amount: number | null
          hotmart_product_id: string
          id: string
          offer_id: string | null
          price: number
          product_name: string
          type: string
          updated_at: string
        }
        Insert: {
          assessment_access?: boolean | null
          created_at?: string
          credits_amount?: number | null
          hotmart_product_id: string
          id?: string
          offer_id?: string | null
          price: number
          product_name: string
          type: string
          updated_at?: string
        }
        Update: {
          assessment_access?: boolean | null
          created_at?: string
          credits_amount?: number | null
          hotmart_product_id?: string
          id?: string
          offer_id?: string | null
          price?: number
          product_name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      hotmart_transactions: {
        Row: {
          created_at: string
          hotmart_product_id: string | null
          id: string
          processed_at: string | null
          status: string
          transaction_id: string
          user_id: number | null
          webhook_data: Json | null
        }
        Insert: {
          created_at?: string
          hotmart_product_id?: string | null
          id?: string
          processed_at?: string | null
          status: string
          transaction_id: string
          user_id?: number | null
          webhook_data?: Json | null
        }
        Update: {
          created_at?: string
          hotmart_product_id?: string | null
          id?: string
          processed_at?: string | null
          status?: string
          transaction_id?: string
          user_id?: number | null
          webhook_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "hotmart_transactions_hotmart_product_id_fkey"
            columns: ["hotmart_product_id"]
            isOneToOne: false
            referencedRelation: "hotmart_products"
            referencedColumns: ["hotmart_product_id"]
          },
          {
            foreignKeyName: "hotmart_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_profiles: {
        Row: {
          activity_frequency: string | null
          avoid_food: string | null
          chronic_disease: string | null
          city_id: string | null
          created_at: string
          estado_id: string | null
          fixed_meal_times: string | null
          food_allergy: string | null
          goal: string | null
          height: number | null
          hip_circumference: number | null
          id: number
          medical_restriction: string | null
          must_have_food: string | null
          neck_circumference: number | null
          physical_activities: Json | null
          physical_activity: string | null
          updated_at: string
          user_id: number
          waist_circumference: number | null
          weight: number | null
        }
        Insert: {
          activity_frequency?: string | null
          avoid_food?: string | null
          chronic_disease?: string | null
          city_id?: string | null
          created_at?: string
          estado_id?: string | null
          fixed_meal_times?: string | null
          food_allergy?: string | null
          goal?: string | null
          height?: number | null
          hip_circumference?: number | null
          id?: number
          medical_restriction?: string | null
          must_have_food?: string | null
          neck_circumference?: number | null
          physical_activities?: Json | null
          physical_activity?: string | null
          updated_at?: string
          user_id: number
          waist_circumference?: number | null
          weight?: number | null
        }
        Update: {
          activity_frequency?: string | null
          avoid_food?: string | null
          chronic_disease?: string | null
          city_id?: string | null
          created_at?: string
          estado_id?: string | null
          fixed_meal_times?: string | null
          food_allergy?: string | null
          goal?: string | null
          height?: number | null
          hip_circumference?: number | null
          id?: number
          medical_restriction?: string | null
          must_have_food?: string | null
          neck_circumference?: number | null
          physical_activities?: Json | null
          physical_activity?: string | null
          updated_at?: string
          user_id?: number
          waist_circumference?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_profiles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_profiles_estado_id_fkey"
            columns: ["estado_id"]
            isOneToOne: false
            referencedRelation: "estados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_preferences: {
        Row: {
          created_at: string
          id: string
          init_point: string
          payment_id: string
          preference_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          init_point: string
          payment_id: string
          preference_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          init_point?: string
          payment_id?: string
          preference_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_preferences_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          assessment_id: string | null
          created_at: string
          currency: string
          external_id: string | null
          external_reference: string | null
          id: string
          paid_at: string | null
          payment_method: string | null
          product_id: string
          status: string
          updated_at: string
          user_id: number
        }
        Insert: {
          amount: number
          assessment_id?: string | null
          created_at?: string
          currency?: string
          external_id?: string | null
          external_reference?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          product_id: string
          status?: string
          updated_at?: string
          user_id: number
        }
        Update: {
          amount?: number
          assessment_id?: string | null
          created_at?: string
          currency?: string
          external_id?: string | null
          external_reference?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          product_id?: string
          status?: string
          updated_at?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price: number
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: number
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: number
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string
          birth_date: string | null
          created_at: string
          email: string
          gender: string | null
          id: number
          name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          auth_user_id: string
          birth_date?: string | null
          created_at?: string
          email: string
          gender?: string | null
          id?: number
          name: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          auth_user_id?: string
          birth_date?: string | null
          created_at?: string
          email?: string
          gender?: string | null
          id?: number
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
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
      user_role: "PATIENT" | "ADMIN" | "NUTRITIONIST" | "TRAINER"
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
    Enums: {
      user_role: ["PATIENT", "ADMIN", "NUTRITIONIST", "TRAINER"],
    },
  },
} as const
