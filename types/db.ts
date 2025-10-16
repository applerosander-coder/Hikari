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
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          billing_address: Json | null
          payment_method: Json | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          billing_address?: Json | null
          payment_method?: Json | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          billing_address?: Json | null
          payment_method?: Json | null
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          read: boolean
          data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          read?: boolean
          data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          read?: boolean
          data?: Json | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          subject: string | null
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          from_user_id: string
          to_user_id: string
          subject?: string | null
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string
          to_user_id?: string
          subject?: string | null
          message?: string
          read?: boolean
          created_at?: string
        }
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
  }
}
