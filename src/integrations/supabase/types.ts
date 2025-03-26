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
      bill_payments: {
        Row: {
          amount: number
          bill_id: string | null
          created_at: string | null
          id: string
          month: number
          payment_date: string
          status: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string | null
          year: number
        }
        Insert: {
          amount: number
          bill_id?: string | null
          created_at?: string | null
          id?: string
          month: number
          payment_date: string
          status: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          year: number
        }
        Update: {
          amount?: number
          bill_id?: string | null
          created_at?: string | null
          id?: string
          month?: number
          payment_date?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "bill_payments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          description: string
          due_day: number
          id: string
          institution_id: string | null
          is_active: boolean | null
          is_recurring: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          description: string
          due_day: number
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          is_recurring?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          description?: string
          due_day?: number
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          is_recurring?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bills_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          id: string
          month: number
          updated_at: string | null
          user_id: string | null
          year: number
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          id?: string
          month: number
          updated_at?: string | null
          user_id?: string | null
          year: number
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          id?: string
          month?: number
          updated_at?: string | null
          user_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      credit_cards: {
        Row: {
          closing_day: number
          created_at: string | null
          due_day: number
          id: string
          institution_id: string | null
          is_active: boolean | null
          limit_amount: number
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          closing_day: number
          created_at?: string | null
          due_day: number
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          limit_amount: number
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          closing_day?: number
          created_at?: string | null
          due_day?: number
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          limit_amount?: number
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_cards_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_contributions: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          description: string | null
          goal_id: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          date: string
          description?: string | null
          goal_id?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          description?: string | null
          goal_id?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          category_id: string | null
          created_at: string | null
          current_amount: number | null
          description: string | null
          id: string
          is_completed: boolean | null
          start_date: string
          target_amount: number
          target_date: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          start_date: string
          target_amount: number
          target_date: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          start_date?: string
          target_amount?: number
          target_date?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          created_at: string | null
          current_balance: number | null
          id: string
          is_active: boolean | null
          logo: string | null
          name: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_balance?: number | null
          id?: string
          is_active?: boolean | null
          logo?: string | null
          name: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_balance?: number | null
          id?: string
          is_active?: boolean | null
          logo?: string | null
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      split_bill_groups: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      split_bill_participants: {
        Row: {
          created_at: string | null
          email: string | null
          group_id: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          group_id?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          group_id?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "split_bill_participants_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "split_bill_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      split_bill_payments: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          id: string
          notes: string | null
          participant_id: string | null
          split_bill_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          participant_id?: string | null
          split_bill_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          participant_id?: string | null
          split_bill_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "split_bill_payments_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "split_bill_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "split_bill_payments_split_bill_id_fkey"
            columns: ["split_bill_id"]
            isOneToOne: false
            referencedRelation: "split_bills"
            referencedColumns: ["id"]
          },
        ]
      }
      split_bill_shares: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          is_included: boolean | null
          participant_id: string | null
          percentage: number | null
          split_bill_id: string | null
          updated_at: string | null
          user_id: string | null
          weight: number | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          is_included?: boolean | null
          participant_id?: string | null
          percentage?: number | null
          split_bill_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight?: number | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          is_included?: boolean | null
          participant_id?: string | null
          percentage?: number | null
          split_bill_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "split_bill_shares_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "split_bill_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "split_bill_shares_split_bill_id_fkey"
            columns: ["split_bill_id"]
            isOneToOne: false
            referencedRelation: "split_bills"
            referencedColumns: ["id"]
          },
        ]
      }
      split_bills: {
        Row: {
          category_id: string | null
          created_at: string | null
          date: string
          division_method: string
          group_id: string | null
          id: string
          name: string
          receipt_image_url: string | null
          status: string
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          date: string
          division_method?: string
          group_id?: string | null
          id?: string
          name: string
          receipt_image_url?: string | null
          status?: string
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          date?: string
          division_method?: string
          group_id?: string | null
          id?: string
          name?: string
          receipt_image_url?: string | null
          status?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "split_bills_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "split_bills_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "split_bill_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          card_id: string | null
          category_id: string | null
          created_at: string | null
          date: string
          description: string
          id: string
          institution_id: string | null
          notes: string | null
          settlement_date: string | null
          status: string
          subcategory_id: string | null
          transaction_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          card_id?: string | null
          category_id?: string | null
          created_at?: string | null
          date: string
          description: string
          id?: string
          institution_id?: string | null
          notes?: string | null
          settlement_date?: string | null
          status: string
          subcategory_id?: string | null
          transaction_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          card_id?: string | null
          category_id?: string | null
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          institution_id?: string | null
          notes?: string | null
          settlement_date?: string | null
          status?: string
          subcategory_id?: string | null
          transaction_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
