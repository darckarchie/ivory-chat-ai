import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types générés automatiquement par Supabase
export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          business_sector: 'restaurant' | 'commerce' | 'services' | 'hospitality';
          phone: string;
          country_code: string;
          currency: string;
          settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          business_sector: 'restaurant' | 'commerce' | 'services' | 'hospitality';
          phone: string;
          country_code?: string;
          currency?: string;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          business_sector?: 'restaurant' | 'commerce' | 'services' | 'hospitality';
          phone?: string;
          country_code?: string;
          currency?: string;
          settings?: any;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          tenant_id: string;
          first_name: string;
          last_name: string;
          phone: string;
          role: 'owner' | 'admin' | 'agent';
          settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          first_name: string;
          last_name: string;
          phone: string;
          role?: 'owner' | 'admin' | 'agent';
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          role?: 'owner' | 'admin' | 'agent';
          settings?: any;
          updated_at?: string;
        };
      };
      whatsapp_sessions: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          wa_device_id: string | null;
          phone_number: string | null;
          status: 'idle' | 'connecting' | 'qr_pending' | 'connected' | 'disconnected' | 'error';
          session_path: string | null;
          qr_code: string | null;
          last_error: string | null;
          message_count: number;
          created_at: string;
          updated_at: string;
          last_seen_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          wa_device_id?: string | null;
          phone_number?: string | null;
          status?: 'idle' | 'connecting' | 'qr_pending' | 'connected' | 'disconnected' | 'error';
          session_path?: string | null;
          qr_code?: string | null;
          last_error?: string | null;
          message_count?: number;
          created_at?: string;
          updated_at?: string;
          last_seen_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          wa_device_id?: string | null;
          phone_number?: string | null;
          status?: 'idle' | 'connecting' | 'qr_pending' | 'connected' | 'disconnected' | 'error';
          session_path?: string | null;
          qr_code?: string | null;
          last_error?: string | null;
          message_count?: number;
          updated_at?: string;
          last_seen_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string | null;
          conversation_id: string | null;
          type: string;
          payload: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id?: string | null;
          conversation_id?: string | null;
          type: string;
          payload?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string | null;
          conversation_id?: string | null;
          type?: string;
          payload?: any;
        };
      };
      conversations: {
        Row: {
          id: string;
          tenant_id: string;
          customer_phone: string;
          customer_name: string | null;
          status: 'active' | 'closed' | 'archived';
          last_message_at: string;
          message_count: number;
          ai_handled: boolean;
          human_handoff_at: string | null;
          tags: string[];
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          customer_phone: string;
          customer_name?: string | null;
          status?: 'active' | 'closed' | 'archived';
          last_message_at?: string;
          message_count?: number;
          ai_handled?: boolean;
          human_handoff_at?: string | null;
          tags?: string[];
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          customer_phone?: string;
          customer_name?: string | null;
          status?: 'active' | 'closed' | 'archived';
          last_message_at?: string;
          message_count?: number;
          ai_handled?: boolean;
          human_handoff_at?: string | null;
          tags?: string[];
          metadata?: any;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          tenant_id: string;
          conversation_id: string;
          wa_msg_id: string | null;
          direction: 'inbound' | 'outbound';
          from_phone: string;
          to_phone: string;
          body: string;
          message_type: 'text' | 'image' | 'document' | 'audio' | 'video';
          ai_generated: boolean;
          ai_confidence: number | null;
          intent_detected: 'HIGH' | 'MEDIUM' | 'LOW' | null;
          metadata: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          conversation_id: string;
          wa_msg_id?: string | null;
          direction: 'inbound' | 'outbound';
          from_phone: string;
          to_phone: string;
          body: string;
          message_type?: 'text' | 'image' | 'document' | 'audio' | 'video';
          ai_generated?: boolean;
          ai_confidence?: number | null;
          intent_detected?: 'HIGH' | 'MEDIUM' | 'LOW' | null;
          metadata?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          conversation_id?: string;
          wa_msg_id?: string | null;
          direction?: 'inbound' | 'outbound';
          from_phone?: string;
          to_phone?: string;
          body?: string;
          message_type?: 'text' | 'image' | 'document' | 'audio' | 'video';
          ai_generated?: boolean;
          ai_confidence?: number | null;
          intent_detected?: 'HIGH' | 'MEDIUM' | 'LOW' | null;
          metadata?: any;
        };
      };
    };
  };
}