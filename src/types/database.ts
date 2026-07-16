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
          full_name: string
          avatar_url: string | null
          role: 'client' | 'seller' | 'admin'
          phone: string | null
          address: string | null
          bio: string | null
          location: string | null
          created_at: string
          updated_at: string
          product_count: number
          rating: number
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          role?: 'client' | 'seller' | 'admin'
          phone?: string | null
          address?: string | null
          bio?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
          product_count?: number
          rating?: number
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          role?: 'client' | 'seller' | 'admin'
          phone?: string | null
          address?: string | null
          bio?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
          product_count?: number
          rating?: number
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          image: string
          description: string | null
        }
        Insert: {
          id: string
          name: string
          image: string
          description?: string | null
        }
        Update: {
          id?: string
          name?: string
          image?: string
          description?: string | null
        }
      }
      products: {
        Row: {
          id: string
          seller_id: string
          category_id: string
          name: string
          description: string
          price: number
          image: string
          stock: number
          unit: string
          is_bio: boolean
          available: boolean
          low_stock_threshold: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          category_id: string
          name: string
          description: string
          price: number
          image: string
          stock?: number
          unit: string
          is_bio?: boolean
          available?: boolean
          low_stock_threshold?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          category_id?: string
          name?: string
          description?: string
          price?: number
          image?: string
          stock?: number
          unit?: string
          is_bio?: boolean
          available?: boolean
          low_stock_threshold?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          buyer_id: string | null
          seller_id: string | null
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total: number
          shipping_address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          buyer_id?: string | null
          seller_id?: string | null
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total: number
          shipping_address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string | null
          seller_id?: string | null
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total?: number
          shipping_address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          price_at_time: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          price_at_time: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          price_at_time?: number
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          buyer_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          buyer_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          buyer_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'new_order' | 'order_status' | 'low_stock' | 'new_review' | 'system'
          title: string
          message: string
          link: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'new_order' | 'order_status' | 'low_stock' | 'new_review' | 'system'
          title: string
          message: string
          link?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'new_order' | 'order_status' | 'low_stock' | 'new_review' | 'system'
          title?: string
          message?: string
          link?: string | null
          read?: boolean
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      seller_requests: {
        Row: {
          id: string
          user_id: string
          status: 'pending' | 'approved' | 'rejected'
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'pending' | 'approved' | 'rejected'
          message?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          message?: string
          created_at?: string
        }
      }
    }
    Views: {
      [key: string]: any
    }
    Functions: {
      [key: string]: any
    }
    Enums: {
      [key: string]: any
    }
    CompositeTypes: {
      [key: string]: any
    }
  }
}
