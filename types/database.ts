// Database types for Supabase
// Generated based on the schema defined in the plan

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
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      families: {
        Row: {
          id: string
          name: string
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name?: string
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          created_by?: string | null
        }
        Relationships: []
      }
      family_members: {
        Row: {
          id: string
          family_id: string
          user_id: string
          role: 'owner' | 'parent'
          joined_at: string
        }
        Insert: {
          id?: string
          family_id: string
          user_id: string
          role?: 'owner' | 'parent'
          joined_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          user_id?: string
          role?: 'owner' | 'parent'
          joined_at?: string
        }
        Relationships: []
      }
      children: {
        Row: {
          id: string
          family_id: string
          name: string
          birth_date: string | null
          school_name: string | null
          activities: string[]
          color: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          birth_date?: string | null
          school_name?: string | null
          activities?: string[]
          color?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          birth_date?: string | null
          school_name?: string | null
          activities?: string[]
          color?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          id: string
          family_id: string
          inviter_id: string
          email: string
          token: string
          status: 'pending' | 'accepted' | 'expired'
          expires_at: string
        }
        Insert: {
          id?: string
          family_id: string
          inviter_id: string
          email: string
          token: string
          status?: 'pending' | 'accepted' | 'expired'
          expires_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          inviter_id?: string
          email?: string
          token?: string
          status?: 'pending' | 'accepted' | 'expired'
          expires_at?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          id: string
          family_id: string
          user_id: string
          service_type: 'gmail' | 'gcal' | 'whatsapp'
          phone_number: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          family_id: string
          user_id: string
          service_type: 'gmail' | 'gcal' | 'whatsapp'
          phone_number?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          family_id?: string
          user_id?: string
          service_type?: 'gmail' | 'gcal' | 'whatsapp'
          phone_number?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Family = Database['public']['Tables']['families']['Row']
export type FamilyMember = Database['public']['Tables']['family_members']['Row']
export type ChildDB = Database['public']['Tables']['children']['Row']
export type Invitation = Database['public']['Tables']['invitations']['Row']
export type Integration = Database['public']['Tables']['integrations']['Row']
