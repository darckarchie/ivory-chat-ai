// Types de base pour tout le projet Whalix
export type SectorId = 'restaurant' | 'commerce' | 'services' | 'hospitality';

export interface Business {
  id: string;
  name: string;
  sector: SectorId;
  whatsapp: string;
  country: string;
  currency: string;
  settings: BusinessSettings;
  created_at: Date;
  updated_at: Date;
}

export interface BusinessSettings {
  ai_preset: 'poli' | 'energique' | 'pro';
  language: 'fr' | 'en' | 'multi';
  tutoiement: boolean;
  auto_reply: boolean;
  opening_hours?: {
    [key: string]: { open: string; close: string };
  };
}

export interface KBItem {
  id: string;
  business_id: string;
  type: 'product' | 'menu' | 'service' | 'offer';
  name: string;
  price: number;
  currency: string;
  image_url?: string;
  sku?: string;
  tags: string[];
  availability: boolean;
  stock?: number;
  description?: string;
  popular_queries?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface LiveReply {
  id: string;
  at: string;
  customer: string;
  customer_phone: string;
  last_message: string;
  reply_preview?: string;
  status: 'waiting' | 'ai_replied' | 'human_replied';
  confidence?: number;
}

export interface DashboardMetrics {
  orders_today: number;
  reservations_today: number;
  quotes_today: number;
  messages_waiting: number;
  avg_response_min: number;
  revenue_today: number;
  total_customers_today?: number;
  new_customers_today?: number;
  repeat_rate?: number;
  satisfaction_score?: number;
  vs_yesterday?: {
    orders: number;
    revenue: number;
    messages: number;
  };
}

export interface WhatsAppMessage {
  id: string;
  whatsapp_message_id: string;
  customer_phone: string;
  customer_name?: string;
  message: string;
  business_id: string;
  status: 'waiting' | 'ai_replied' | 'human_replied';
  confidence?: number;
  created_at: Date;
  updated_at: Date;
}

export interface AIResponse {
  message: string;
  confidence: number;
  shouldReply: boolean;
  buttons?: { label: string; action: string }[];
}