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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          abdominal_fold: number | null
          age: number | null
          assessment_text: string | null
          assessment_type: string | null
          back_photo: string
          bmi: number | null
          body_fat_percentage: number | null
          chest_fold: number | null
          created_at: string
          fat_mass: number | null
          front_photo: string
          hip_circumference: number | null
          id: string
          lean_mass: number | null
          measurement_method: string | null
          midaxillary_fold: number | null
          neck_circumference: number | null
          patient_birth_date: string | null
          patient_gender: string | null
          patient_goal: string | null
          patient_height: number | null
          patient_hip_circumference: number | null
          patient_name: string | null
          patient_neck_circumference: number | null
          patient_physical_activities: Json | null
          patient_waist_circumference: number | null
          patient_weight: number | null
          prompt_text: string | null
          reevaluation_applied: boolean | null
          reevaluation_info: string | null
          side_photo: string
          status: string | null
          subscapular_fold: number | null
          suprailiac_fold: number | null
          thigh_fold: number | null
          tier: string
          triceps_fold: number | null
          updated_at: string
          user_id: number
          waist_circumference: number | null
        }
        Insert: {
          abdominal_fold?: number | null
          age?: number | null
          assessment_text?: string | null
          assessment_type?: string | null
          back_photo: string
          bmi?: number | null
          body_fat_percentage?: number | null
          chest_fold?: number | null
          created_at?: string
          fat_mass?: number | null
          front_photo: string
          hip_circumference?: number | null
          id?: string
          lean_mass?: number | null
          measurement_method?: string | null
          midaxillary_fold?: number | null
          neck_circumference?: number | null
          patient_birth_date?: string | null
          patient_gender?: string | null
          patient_goal?: string | null
          patient_height?: number | null
          patient_hip_circumference?: number | null
          patient_name?: string | null
          patient_neck_circumference?: number | null
          patient_physical_activities?: Json | null
          patient_waist_circumference?: number | null
          patient_weight?: number | null
          prompt_text?: string | null
          reevaluation_applied?: boolean | null
          reevaluation_info?: string | null
          side_photo: string
          status?: string | null
          subscapular_fold?: number | null
          suprailiac_fold?: number | null
          thigh_fold?: number | null
          tier?: string
          triceps_fold?: number | null
          updated_at?: string
          user_id: number
          waist_circumference?: number | null
        }
        Update: {
          abdominal_fold?: number | null
          age?: number | null
          assessment_text?: string | null
          assessment_type?: string | null
          back_photo?: string
          bmi?: number | null
          body_fat_percentage?: number | null
          chest_fold?: number | null
          created_at?: string
          fat_mass?: number | null
          front_photo?: string
          hip_circumference?: number | null
          id?: string
          lean_mass?: number | null
          measurement_method?: string | null
          midaxillary_fold?: number | null
          neck_circumference?: number | null
          patient_birth_date?: string | null
          patient_gender?: string | null
          patient_goal?: string | null
          patient_height?: number | null
          patient_hip_circumference?: number | null
          patient_name?: string | null
          patient_neck_circumference?: number | null
          patient_physical_activities?: Json | null
          patient_waist_circumference?: number | null
          patient_weight?: number | null
          prompt_text?: string | null
          reevaluation_applied?: boolean | null
          reevaluation_info?: string | null
          side_photo?: string
          status?: string | null
          subscapular_fold?: number | null
          suprailiac_fold?: number | null
          thigh_fold?: number | null
          tier?: string
          triceps_fold?: number | null
          updated_at?: string
          user_id?: number
          waist_circumference?: number | null
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
      big_five_assessments: {
        Row: {
          assessment_type: string
          classification: string | null
          created_at: string
          full_report: string | null
          id: string
          is_premium: boolean
          patient_age: number | null
          patient_birth_date: string | null
          patient_gender: string | null
          patient_name: string | null
          recommendations: string | null
          responses: Json
          scores: Json | null
          status: string
          updated_at: string
          user_id: number
        }
        Insert: {
          assessment_type?: string
          classification?: string | null
          created_at?: string
          full_report?: string | null
          id?: string
          is_premium?: boolean
          patient_age?: number | null
          patient_birth_date?: string | null
          patient_gender?: string | null
          patient_name?: string | null
          recommendations?: string | null
          responses?: Json
          scores?: Json | null
          status?: string
          updated_at?: string
          user_id: number
        }
        Update: {
          assessment_type?: string
          classification?: string | null
          created_at?: string
          full_report?: string | null
          id?: string
          is_premium?: boolean
          patient_age?: number | null
          patient_birth_date?: string | null
          patient_gender?: string | null
          patient_name?: string | null
          recommendations?: string | null
          responses?: Json
          scores?: Json | null
          status?: string
          updated_at?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
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
          assessment_type: string | null
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
          assessment_type?: string | null
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
          assessment_type?: string | null
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
      pollock_assessments: {
        Row: {
          abdominal_fold: number | null
          age: number | null
          assessment_type: string
          back_photo: string
          bmi: number | null
          body_fat_percentage: number | null
          chest_fold: number | null
          created_at: string
          fat_mass: number | null
          front_photo: string
          gender: string | null
          height: number | null
          id: string
          lean_mass: number | null
          midaxillary_fold: number | null
          patient_birth_date: string | null
          patient_gender: string | null
          patient_height: number | null
          patient_name: string | null
          patient_weight: number | null
          side_photo: string
          subscapular_fold: number | null
          suprailiac_fold: number | null
          thigh_fold: number | null
          triceps_fold: number | null
          updated_at: string
          user_id: number
          weight: number | null
        }
        Insert: {
          abdominal_fold?: number | null
          age?: number | null
          assessment_type?: string
          back_photo: string
          bmi?: number | null
          body_fat_percentage?: number | null
          chest_fold?: number | null
          created_at?: string
          fat_mass?: number | null
          front_photo: string
          gender?: string | null
          height?: number | null
          id?: string
          lean_mass?: number | null
          midaxillary_fold?: number | null
          patient_birth_date?: string | null
          patient_gender?: string | null
          patient_height?: number | null
          patient_name?: string | null
          patient_weight?: number | null
          side_photo: string
          subscapular_fold?: number | null
          suprailiac_fold?: number | null
          thigh_fold?: number | null
          triceps_fold?: number | null
          updated_at?: string
          user_id: number
          weight?: number | null
        }
        Update: {
          abdominal_fold?: number | null
          age?: number | null
          assessment_type?: string
          back_photo?: string
          bmi?: number | null
          body_fat_percentage?: number | null
          chest_fold?: number | null
          created_at?: string
          fat_mass?: number | null
          front_photo?: string
          gender?: string | null
          height?: number | null
          id?: string
          lean_mass?: number | null
          midaxillary_fold?: number | null
          patient_birth_date?: string | null
          patient_gender?: string | null
          patient_height?: number | null
          patient_name?: string | null
          patient_weight?: number | null
          side_photo?: string
          subscapular_fold?: number | null
          suprailiac_fold?: number | null
          thigh_fold?: number | null
          triceps_fold?: number | null
          updated_at?: string
          user_id?: number
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pollock_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tdah_assessments: {
        Row: {
          assessment_method: string | null
          assessment_type: string
          classification: string | null
          created_at: string
          full_report: string | null
          id: string
          is_premium: boolean
          patient_age: number | null
          patient_birth_date: string | null
          patient_gender: string | null
          patient_name: string | null
          recommendations: string | null
          responses: Json
          score: number | null
          status: string
          updated_at: string
          user_id: number
        }
        Insert: {
          assessment_method?: string | null
          assessment_type?: string
          classification?: string | null
          created_at?: string
          full_report?: string | null
          id?: string
          is_premium?: boolean
          patient_age?: number | null
          patient_birth_date?: string | null
          patient_gender?: string | null
          patient_name?: string | null
          recommendations?: string | null
          responses?: Json
          score?: number | null
          status?: string
          updated_at?: string
          user_id: number
        }
        Update: {
          assessment_method?: string | null
          assessment_type?: string
          classification?: string | null
          created_at?: string
          full_report?: string | null
          id?: string
          is_premium?: boolean
          patient_age?: number | null
          patient_birth_date?: string | null
          patient_gender?: string | null
          patient_name?: string | null
          recommendations?: string | null
          responses?: Json
          score?: number | null
          status?: string
          updated_at?: string
          user_id?: number
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
          profession: Database["public"]["Enums"]["profession_type"] | null
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
          profession?: Database["public"]["Enums"]["profession_type"] | null
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
          profession?: Database["public"]["Enums"]["profession_type"] | null
          role?: Database["public"]["Enums"]["user_role"]
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
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "patient"
        | "nutritionist"
        | "trainer"
        | "professional"
      profession_type:
        | "NUTRICIONISTA"
        | "MEDICO"
        | "EDUCADOR_FISICO"
        | "FISIOTERAPEUTA"
        | "ENFERMEIRO"
        | "PSICOLOGO"
        | "FARMACEUTICO"
        | "BIOMEDICO"
        | "DENTISTA"
        | "TERAPEUTA_OCUPACIONAL"
      user_role:
        | "PATIENT"
        | "ADMIN"
        | "NUTRITIONIST"
        | "TRAINER"
        | "PROFESSIONAL"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "patient",
        "nutritionist",
        "trainer",
        "professional",
      ],
      profession_type: [
        "NUTRICIONISTA",
        "MEDICO",
        "EDUCADOR_FISICO",
        "FISIOTERAPEUTA",
        "ENFERMEIRO",
        "PSICOLOGO",
        "FARMACEUTICO",
        "BIOMEDICO",
        "DENTISTA",
        "TERAPEUTA_OCUPACIONAL",
      ],
      user_role: [
        "PATIENT",
        "ADMIN",
        "NUTRITIONIST",
        "TRAINER",
        "PROFESSIONAL",
      ],
    },
  },
} as const
