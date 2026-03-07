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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      affiliate_click_events: {
        Row: {
          clicked_at: string
          id: string
          product_id: string
          referrer: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          clicked_at?: string
          id?: string
          product_id: string
          referrer?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_at?: string
          id?: string
          product_id?: string
          referrer?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_click_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_click_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          author_id?: string | null
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          product_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type?: string
          id?: string
          product_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          product_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          added_at: string
          color: string | null
          id: string
          product_id: string
          quantity: number
          size: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          added_at?: string
          color?: string | null
          id?: string
          product_id: string
          quantity?: number
          size?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          added_at?: string
          color?: string | null
          id?: string
          product_id?: string
          quantity?: number
          size?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          gender: string[] | null
          icon_url: string | null
          id: string
          image_url: string | null
          name: string
          parent_id: string | null
          piece_type: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          gender?: string[] | null
          icon_url?: string | null
          id?: string
          image_url?: string | null
          name: string
          parent_id?: string | null
          piece_type?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          gender?: string[] | null
          icon_url?: string | null
          id?: string
          image_url?: string | null
          name?: string
          parent_id?: string | null
          piece_type?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      category_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          gender_id: number
          id: number
          image_url: string
          piece_type_group: string | null
          sort_order: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          gender_id: number
          id?: number
          image_url: string
          piece_type_group?: string | null
          sort_order?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          gender_id?: number
          id?: number
          image_url?: string
          piece_type_group?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "category_images_gender_id_fkey"
            columns: ["gender_id"]
            isOneToOne: false
            referencedRelation: "genders"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_products: {
        Row: {
          collection_id: string
          product_id: string
        }
        Insert: {
          collection_id: string
          product_id: string
        }
        Update: {
          collection_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          colors: string[] | null
          cover_image: string | null
          created_at: string
          description: string | null
          display_order: number
          gender: string | null
          generated_by_ai: boolean
          id: string
          is_draft: boolean
          is_featured: boolean
          likes_count: number
          name: string
          slug: string
          styles: string[] | null
          tag: string | null
          user_id: string | null
        }
        Insert: {
          colors?: string[] | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          gender?: string | null
          generated_by_ai?: boolean
          id?: string
          is_draft?: boolean
          is_featured?: boolean
          likes_count?: number
          name: string
          slug: string
          styles?: string[] | null
          tag?: string | null
          user_id?: string | null
        }
        Update: {
          colors?: string[] | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          gender?: string | null
          generated_by_ai?: boolean
          id?: string
          is_draft?: boolean
          is_featured?: boolean
          likes_count?: number
          name?: string
          slug?: string
          styles?: string[] | null
          tag?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          affiliate_link: string | null
          code: string
          created_at: string | null
          discount_percent: number
          end_date: string
          id: number
          image_url: string | null
          is_active: boolean | null
          start_date: string
          store_name: string
        }
        Insert: {
          affiliate_link?: string | null
          code: string
          created_at?: string | null
          discount_percent: number
          end_date: string
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          start_date: string
          store_name: string
        }
        Update: {
          affiliate_link?: string | null
          code?: string
          created_at?: string | null
          discount_percent?: number
          end_date?: string
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          start_date?: string
          store_name?: string
        }
        Relationships: []
      }
      genders: {
        Row: {
          id: number
          name: string
          slug: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          is_active: boolean
          section_identifier: string
          sort_order: number
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          section_identifier: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          section_identifier?: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      homepage_slides: {
        Row: {
          button_link: string
          button_text: string
          created_at: string | null
          description: string
          id: string
          image_url: string
          is_active: boolean | null
          sort_order: number | null
          subtitle: string
          title: string
        }
        Insert: {
          button_link: string
          button_text: string
          created_at?: string | null
          description: string
          id?: string
          image_url: string
          is_active?: boolean | null
          sort_order?: number | null
          subtitle: string
          title: string
        }
        Update: {
          button_link?: string
          button_text?: string
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          sort_order?: number | null
          subtitle?: string
          title?: string
        }
        Relationships: []
      }
      lookbook_comments: {
        Row: {
          collection_id: string
          comment: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          collection_id: string
          comment: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          collection_id?: string
          comment?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lookbook_comments_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookbook_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lookbook_products: {
        Row: {
          category: string | null
          lookbook_id: string
          product_id: string
          sort_order: number | null
        }
        Insert: {
          category?: string | null
          lookbook_id: string
          product_id: string
          sort_order?: number | null
        }
        Update: {
          category?: string | null
          lookbook_id?: string
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lookbook_products_lookbook_id_fkey"
            columns: ["lookbook_id"]
            isOneToOne: false
            referencedRelation: "lookbooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookbook_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      lookbooks: {
        Row: {
          colors: string[] | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          id: string
          is_copy: boolean | null
          mood: string | null
          occasion: string | null
          original_lookbook_id: string | null
          season: string | null
          slug: string | null
          tags: string[] | null
          title: string
          user_id: string | null
        }
        Insert: {
          colors?: string[] | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_copy?: boolean | null
          mood?: string | null
          occasion?: string | null
          original_lookbook_id?: string | null
          season?: string | null
          slug?: string | null
          tags?: string[] | null
          title: string
          user_id?: string | null
        }
        Update: {
          colors?: string[] | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_copy?: boolean | null
          mood?: string | null
          occasion?: string | null
          original_lookbook_id?: string | null
          season?: string | null
          slug?: string | null
          tags?: string[] | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lookbooks_original_lookbook_id_fkey"
            columns: ["original_lookbook_id"]
            isOneToOne: false
            referencedRelation: "lookbooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookbooks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          code: string | null
          created_at: string
          current_uses: number
          description: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          min_purchase: number | null
          type: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          current_uses?: number
          description: string
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_purchase?: number | null
          type?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          current_uses?: number
          description?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_purchase?: number | null
          type?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          product_id: string
          sort_order: number
          type: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          type: string
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          helpful_count: number | null
          id: string
          is_verified: boolean | null
          product_id: string
          rating: number
          review_images: string[] | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_verified?: boolean | null
          product_id: string
          rating: number
          review_images?: string[] | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_verified?: boolean | null
          product_id?: string
          rating?: number
          review_images?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_views: {
        Row: {
          id: string
          product_id: string
          session_id: string | null
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          product_id: string
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          affiliate_link: string | null
          affiliate_link_clicks: number | null
          affiliate_program: string | null
          avg_rating: number | null
          brand: string | null
          category_id: string | null
          colors: string[] | null
          commission: number | null
          created_at: string
          deal_tag: string | null
          description: string | null
          discount_percent: number | null
          discounted_price: number | null
          gender: string | null
          id: string
          is_best_seller_pinned: boolean | null
          is_bestseller: boolean
          is_deal: boolean
          is_featured: boolean
          is_hidden: boolean
          is_new_arrival: boolean
          is_trending: boolean
          material: string | null
          merchant_id: string | null
          name: string
          piece_type: string | null
          price: number
          quantity: number
          review_count: number | null
          season: string | null
          size: string[] | null
          slug: string
          stock_status: string
          styles: string[] | null
          tags: string[] | null
          updated_at: string
          views_count: number
        }
        Insert: {
          affiliate_link?: string | null
          affiliate_link_clicks?: number | null
          affiliate_program?: string | null
          avg_rating?: number | null
          brand?: string | null
          category_id?: string | null
          colors?: string[] | null
          commission?: number | null
          created_at?: string
          deal_tag?: string | null
          description?: string | null
          discount_percent?: number | null
          discounted_price?: number | null
          gender?: string | null
          id?: string
          is_best_seller_pinned?: boolean | null
          is_bestseller?: boolean
          is_deal?: boolean
          is_featured?: boolean
          is_hidden?: boolean
          is_new_arrival?: boolean
          is_trending?: boolean
          material?: string | null
          merchant_id?: string | null
          name: string
          piece_type?: string | null
          price: number
          quantity?: number
          review_count?: number | null
          season?: string | null
          size?: string[] | null
          slug: string
          stock_status?: string
          styles?: string[] | null
          tags?: string[] | null
          updated_at?: string
          views_count?: number
        }
        Update: {
          affiliate_link?: string | null
          affiliate_link_clicks?: number | null
          affiliate_program?: string | null
          avg_rating?: number | null
          brand?: string | null
          category_id?: string | null
          colors?: string[] | null
          commission?: number | null
          created_at?: string
          deal_tag?: string | null
          description?: string | null
          discount_percent?: number | null
          discounted_price?: number | null
          gender?: string | null
          id?: string
          is_best_seller_pinned?: boolean | null
          is_bestseller?: boolean
          is_deal?: boolean
          is_featured?: boolean
          is_hidden?: boolean
          is_new_arrival?: boolean
          is_trending?: boolean
          material?: string | null
          merchant_id?: string | null
          name?: string
          piece_type?: string | null
          price?: number
          quantity?: number
          review_count?: number | null
          season?: string | null
          size?: string[] | null
          slug?: string
          stock_status?: string
          styles?: string[] | null
          tags?: string[] | null
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          gender_preference: string | null
          id: string
          is_admin: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          gender_preference?: string | null
          id: string
          is_admin?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          gender_preference?: string | null
          id?: string
          is_admin?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      review_helpful_votes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpful_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "product_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_helpful_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_coupons: {
        Row: {
          coupon_id: number
          saved_at: string | null
          user_id: string
        }
        Insert: {
          coupon_id: number
          saved_at?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: number
          saved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_coupons_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_coupons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_deals: {
        Row: {
          product_id: string
          saved_at: string | null
          user_id: string
        }
        Insert: {
          product_id: string
          saved_at?: string | null
          user_id: string
        }
        Update: {
          product_id?: string
          saved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_deals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_deals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_style_worlds: {
        Row: {
          created_at: string
          filters: Json
          id: string
          image_url: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          image_url?: string | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          image_url?: string | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_style_worlds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      style_hub_filters: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          label: string
          sort_order: number | null
          value: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          sort_order?: number | null
          value: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_img: string | null
          author_name: string
          author_role: string | null
          created_at: string
          id: string
          is_visible: boolean
          review: string
          sort_order: number
        }
        Insert: {
          author_img?: string | null
          author_name: string
          author_role?: string | null
          created_at?: string
          id?: string
          is_visible?: boolean
          review: string
          sort_order?: number
        }
        Update: {
          author_img?: string | null
          author_name?: string
          author_role?: string | null
          created_at?: string
          id?: string
          is_visible?: boolean
          review?: string
          sort_order?: number
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          country: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          label: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          user_id: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          country?: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          user_id: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          country?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_coupons: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          discount_type: string | null
          discount_value: number
          expiry_date: string | null
          id: string
          is_active: boolean | null
          min_order_value: number | null
          title: string | null
          usage_limit: number | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          discount_type?: string | null
          discount_value: number
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          min_order_value?: number | null
          title?: string | null
          usage_limit?: number | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          discount_type?: string | null
          discount_value?: number
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          min_order_value?: number | null
          title?: string | null
          usage_limit?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_coupons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_saved_offers: {
        Row: {
          id: string
          offer_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          offer_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          offer_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_saved_offers_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_offers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist: {
        Row: {
          collection_id: string | null
          color: string | null
          created_at: string
          id: string
          item_id: string
          item_type: string
          product_id: string | null
          style: string | null
          user_id: string
        }
        Insert: {
          collection_id?: string | null
          color?: string | null
          created_at?: string
          id?: string
          item_id: string
          item_type?: string
          product_id?: string | null
          style?: string | null
          user_id: string
        }
        Update: {
          collection_id?: string | null
          color?: string | null
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          product_id?: string | null
          style?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_user_id_fkey"
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
      get_best_sellers: {
        Args: { p_limit?: number }
        Returns: {
          product_id: string
          score: number
        }[]
      }
      get_complete_the_look: {
        Args: {
          p_gender: string
          p_limit?: number
          p_piece_type: string
          p_product_id: string
        }
        Returns: {
          avg_rating: number
          discounted_price: number
          gender: string
          id: string
          name: string
          piece_type: string
          price: number
          slug: string
        }[]
      }
      get_new_arrivals_for_nav: {
        Args: { p_limit?: number }
        Returns: {
          avg_rating: number
          discounted_price: number
          id: string
          name: string
          price: number
          slug: string
        }[]
      }
      get_trending_products: {
        Args: { p_limit?: number }
        Returns: {
          product_id: string
          score: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
