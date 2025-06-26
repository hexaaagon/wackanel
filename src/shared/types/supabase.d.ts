export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      account: {
        Row: {
          access_token: string | null;
          access_token_expires_at: string | null;
          account_id: string;
          created_at: string;
          id: string;
          id_token: string | null;
          password: string | null;
          provider_id: string;
          refresh_token: string | null;
          refresh_token_expires_at: string | null;
          scope: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          access_token?: string | null;
          access_token_expires_at?: string | null;
          account_id: string;
          created_at: string;
          id: string;
          id_token?: string | null;
          password?: string | null;
          provider_id: string;
          refresh_token?: string | null;
          refresh_token_expires_at?: string | null;
          scope?: string | null;
          updated_at: string;
          user_id: string;
        };
        Update: {
          access_token?: string | null;
          access_token_expires_at?: string | null;
          account_id?: string;
          created_at?: string;
          id?: string;
          id_token?: string | null;
          password?: string | null;
          provider_id?: string;
          refresh_token?: string | null;
          refresh_token_expires_at?: string | null;
          scope?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "account_user_id_user_id_fk";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      apikey: {
        Row: {
          created_at: string;
          enabled: boolean | null;
          expires_at: string | null;
          id: string;
          key: string;
          last_refill_at: string | null;
          last_request: string | null;
          metadata: string | null;
          name: string | null;
          permissions: string | null;
          prefix: string | null;
          rate_limit_enabled: boolean | null;
          rate_limit_max: number | null;
          rate_limit_time_window: number | null;
          refill_amount: number | null;
          refill_interval: number | null;
          remaining: number | null;
          request_count: number | null;
          start: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at: string;
          enabled?: boolean | null;
          expires_at?: string | null;
          id: string;
          key: string;
          last_refill_at?: string | null;
          last_request?: string | null;
          metadata?: string | null;
          name?: string | null;
          permissions?: string | null;
          prefix?: string | null;
          rate_limit_enabled?: boolean | null;
          rate_limit_max?: number | null;
          rate_limit_time_window?: number | null;
          refill_amount?: number | null;
          refill_interval?: number | null;
          remaining?: number | null;
          request_count?: number | null;
          start?: string | null;
          updated_at: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          enabled?: boolean | null;
          expires_at?: string | null;
          id?: string;
          key?: string;
          last_refill_at?: string | null;
          last_request?: string | null;
          metadata?: string | null;
          name?: string | null;
          permissions?: string | null;
          prefix?: string | null;
          rate_limit_enabled?: boolean | null;
          rate_limit_max?: number | null;
          rate_limit_time_window?: number | null;
          refill_amount?: number | null;
          refill_interval?: number | null;
          remaining?: number | null;
          request_count?: number | null;
          start?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "apikey_user_id_user_id_fk";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      session: {
        Row: {
          created_at: string;
          expires_at: string;
          id: string;
          ip_address: string | null;
          token: string;
          updated_at: string;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          created_at: string;
          expires_at: string;
          id: string;
          ip_address?: string | null;
          token: string;
          updated_at: string;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          ip_address?: string | null;
          token?: string;
          updated_at?: string;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_user_id_user_id_fk";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      user: {
        Row: {
          created_at: string;
          email: string;
          email_verified: boolean;
          id: string;
          image: string | null;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at: string;
          email: string;
          email_verified: boolean;
          id: string;
          image?: string | null;
          name: string;
          updated_at: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          email_verified?: boolean;
          id?: string;
          image?: string | null;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_wakatime_heartbeats: {
        Row: {
          category: string | null;
          created_at: string;
          editor: string | null;
          heartbeat_count: number;
          id: string;
          language: string | null;
          project: string | null;
          time_slot: number;
          total_seconds: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category?: string | null;
          created_at: string;
          editor?: string | null;
          heartbeat_count?: number;
          id: string;
          language?: string | null;
          project?: string | null;
          time_slot: number;
          total_seconds?: number;
          updated_at: string;
          user_id: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          editor?: string | null;
          heartbeat_count?: number;
          id?: string;
          language?: string | null;
          project?: string | null;
          time_slot?: number;
          total_seconds?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_wakatime_heartbeats_user_id_user_id_fk";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      user_wakatime_instances: {
        Row: {
          api_url: string;
          id: string;
          type: string;
          user_id: string;
        };
        Insert: {
          api_url: string;
          id: string;
          type: string;
          user_id: string;
        };
        Update: {
          api_url?: string;
          id?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_wakatime_instances_user_id_user_id_fk";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      user_wakatime_pending_heartbeats: {
        Row: {
          branch: string | null;
          category: string | null;
          cursorpos: string | null;
          dependencies: string | null;
          entity: string;
          id: string;
          instances: string[];
          is_write: boolean | null;
          language: string | null;
          line_additions: number | null;
          line_deletions: number | null;
          lineno: number | null;
          lines: string | null;
          project: string | null;
          project_root_count: number | null;
          time: number;
          type: string;
          user_id: string;
        };
        Insert: {
          branch?: string | null;
          category?: string | null;
          cursorpos?: string | null;
          dependencies?: string | null;
          entity: string;
          id: string;
          instances?: string[];
          is_write?: boolean | null;
          language?: string | null;
          line_additions?: number | null;
          line_deletions?: number | null;
          lineno?: number | null;
          lines?: string | null;
          project?: string | null;
          project_root_count?: number | null;
          time: number;
          type: string;
          user_id: string;
        };
        Update: {
          branch?: string | null;
          category?: string | null;
          cursorpos?: string | null;
          dependencies?: string | null;
          entity?: string;
          id?: string;
          instances?: string[];
          is_write?: boolean | null;
          language?: string | null;
          line_additions?: number | null;
          line_deletions?: number | null;
          lineno?: number | null;
          lines?: string | null;
          project?: string | null;
          project_root_count?: number | null;
          time?: number;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_wakatime_pending_heartbeats_user_id_user_id_fk";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      user_wakatime_profiles: {
        Row: {
          bio: string | null;
          categories_used_public: boolean | null;
          city_country_code: string | null;
          city_name: string | null;
          city_state: string | null;
          city_title: string | null;
          created_at: string;
          display_name: string | null;
          editors_used_public: boolean | null;
          full_name: string | null;
          github_username: string | null;
          has_premium_features: boolean | null;
          human_readable_website: string | null;
          id: string;
          is_email_confirmed: boolean | null;
          is_email_public: boolean | null;
          is_hireable: boolean | null;
          languages_used_public: boolean | null;
          last_branch: string | null;
          last_heartbeat_at: string | null;
          last_plugin: string | null;
          last_plugin_name: string | null;
          last_project: string | null;
          linkedin_username: string | null;
          logged_time_public: boolean | null;
          os_used_public: boolean | null;
          photo: string | null;
          photo_public: boolean | null;
          plan: string | null;
          public_email: string | null;
          timezone: string | null;
          twitter_username: string | null;
          updated_at: string;
          username: string | null;
          wakatime_created_at: string | null;
          wakatime_id: string;
          wakatime_modified_at: string | null;
          website: string | null;
          wonderfuldev_username: string | null;
        };
        Insert: {
          bio?: string | null;
          categories_used_public?: boolean | null;
          city_country_code?: string | null;
          city_name?: string | null;
          city_state?: string | null;
          city_title?: string | null;
          created_at: string;
          display_name?: string | null;
          editors_used_public?: boolean | null;
          full_name?: string | null;
          github_username?: string | null;
          has_premium_features?: boolean | null;
          human_readable_website?: string | null;
          id: string;
          is_email_confirmed?: boolean | null;
          is_email_public?: boolean | null;
          is_hireable?: boolean | null;
          languages_used_public?: boolean | null;
          last_branch?: string | null;
          last_heartbeat_at?: string | null;
          last_plugin?: string | null;
          last_plugin_name?: string | null;
          last_project?: string | null;
          linkedin_username?: string | null;
          logged_time_public?: boolean | null;
          os_used_public?: boolean | null;
          photo?: string | null;
          photo_public?: boolean | null;
          plan?: string | null;
          public_email?: string | null;
          timezone?: string | null;
          twitter_username?: string | null;
          updated_at: string;
          username?: string | null;
          wakatime_created_at?: string | null;
          wakatime_id: string;
          wakatime_modified_at?: string | null;
          website?: string | null;
          wonderfuldev_username?: string | null;
        };
        Update: {
          bio?: string | null;
          categories_used_public?: boolean | null;
          city_country_code?: string | null;
          city_name?: string | null;
          city_state?: string | null;
          city_title?: string | null;
          created_at?: string;
          display_name?: string | null;
          editors_used_public?: boolean | null;
          full_name?: string | null;
          github_username?: string | null;
          has_premium_features?: boolean | null;
          human_readable_website?: string | null;
          id?: string;
          is_email_confirmed?: boolean | null;
          is_email_public?: boolean | null;
          is_hireable?: boolean | null;
          languages_used_public?: boolean | null;
          last_branch?: string | null;
          last_heartbeat_at?: string | null;
          last_plugin?: string | null;
          last_plugin_name?: string | null;
          last_project?: string | null;
          linkedin_username?: string | null;
          logged_time_public?: boolean | null;
          os_used_public?: boolean | null;
          photo?: string | null;
          photo_public?: boolean | null;
          plan?: string | null;
          public_email?: string | null;
          timezone?: string | null;
          twitter_username?: string | null;
          updated_at?: string;
          username?: string | null;
          wakatime_created_at?: string | null;
          wakatime_id?: string;
          wakatime_modified_at?: string | null;
          website?: string | null;
          wonderfuldev_username?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_wakatime_profiles_id_user_id_fk";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      user_wakatime_stats: {
        Row: {
          best_hour: number | null;
          best_hour_text: string | null;
          best_hour_total_seconds: number | null;
          categories: string | null;
          created_at: string;
          editors: string | null;
          human_readable_total: string;
          human_readable_total_including_other_language: string;
          id: string;
          languages: string | null;
          projects: string | null;
          total_seconds: number;
          total_seconds_including_other_language: number;
        };
        Insert: {
          best_hour?: number | null;
          best_hour_text?: string | null;
          best_hour_total_seconds?: number | null;
          categories?: string | null;
          created_at: string;
          editors?: string | null;
          human_readable_total: string;
          human_readable_total_including_other_language: string;
          id: string;
          languages?: string | null;
          projects?: string | null;
          total_seconds: number;
          total_seconds_including_other_language: number;
        };
        Update: {
          best_hour?: number | null;
          best_hour_text?: string | null;
          best_hour_total_seconds?: number | null;
          categories?: string | null;
          created_at?: string;
          editors?: string | null;
          human_readable_total?: string;
          human_readable_total_including_other_language?: string;
          id?: string;
          languages?: string | null;
          projects?: string | null;
          total_seconds?: number;
          total_seconds_including_other_language?: number;
        };
        Relationships: [
          {
            foreignKeyName: "user_wakatime_stats_id_user_id_fk";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      verification: {
        Row: {
          created_at: string | null;
          expires_at: string;
          id: string;
          identifier: string;
          updated_at: string | null;
          value: string;
        };
        Insert: {
          created_at?: string | null;
          expires_at: string;
          id: string;
          identifier: string;
          updated_at?: string | null;
          value: string;
        };
        Update: {
          created_at?: string | null;
          expires_at?: string;
          id?: string;
          identifier?: string;
          updated_at?: string | null;
          value?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      has_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      set_user_id: {
        Args: { user_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
