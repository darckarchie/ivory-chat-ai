/*
  # Schema WhatsApp Sessions & Events - Multi-tenant

  1. New Tables
    - `tenants` - Organisations/entreprises
    - `users` - Utilisateurs avec auth Supabase
    - `whatsapp_sessions` - Sessions WhatsApp par tenant
    - `events` - Log de tous les événements système
    - `conversations` - Conversations WhatsApp
    - `messages` - Messages individuels

  2. Security
    - Enable RLS on all tables
    - Policies par tenant_id pour isolation complète
    - Index optimisés pour performance

  3. Features
    - Multi-tenant avec isolation stricte
    - Traçabilité complète des événements
    - Sessions WhatsApp persistantes
    - Métriques temps réel
*/

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des tenants (organisations/entreprises)
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  business_sector text NOT NULL CHECK (business_sector IN ('restaurant', 'commerce', 'services', 'hospitality')),
  phone text UNIQUE NOT NULL, -- Format E.164 +225XXXXXXXXXX
  country_code text NOT NULL DEFAULT '+225',
  currency text NOT NULL DEFAULT 'FCFA',
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des utilisateurs (liée à Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL, -- Format E.164
  role text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'agent')),
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des sessions WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wa_device_id text, -- ID du device WhatsApp
  phone_number text, -- Numéro WhatsApp connecté
  status text NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'connecting', 'qr_pending', 'connected', 'disconnected', 'error')),
  session_path text, -- Chemin vers les fichiers de session Baileys
  qr_code text, -- QR code actuel (temporaire)
  last_error text,
  message_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now(),
  
  -- Une seule session active par tenant
  UNIQUE(tenant_id)
);

-- Table des événements (traçabilité complète)
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  conversation_id uuid, -- Référence optionnelle à une conversation
  type text NOT NULL CHECK (type IN (
    'qr_generated', 'qr_scanned', 'session_created', 'connection_open', 'connection_closed',
    'message_received', 'message_sent', 'intent_detected', 'proposal_shown',
    'order_created', 'payment_link_sent', 'payment_confirmed', 'handoff_human',
    'user_login', 'user_logout', 'settings_changed'
  )),
  payload jsonb DEFAULT '{}', -- Données spécifiques à l'événement
  created_at timestamptz DEFAULT now()
);

-- Table des conversations WhatsApp
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_phone text NOT NULL, -- Format E.164
  customer_name text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  last_message_at timestamptz DEFAULT now(),
  message_count integer DEFAULT 0,
  ai_handled boolean DEFAULT false,
  human_handoff_at timestamptz,
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Index composite pour performance
  UNIQUE(tenant_id, customer_phone)
);

-- Table des messages WhatsApp
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  wa_msg_id text, -- ID unique WhatsApp (pour idempotence)
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_phone text NOT NULL,
  to_phone text NOT NULL,
  body text NOT NULL,
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'audio', 'video')),
  ai_generated boolean DEFAULT false,
  ai_confidence real,
  intent_detected text CHECK (intent_detected IN ('HIGH', 'MEDIUM', 'LOW')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  
  -- Contrainte d'unicité pour éviter les doublons
  UNIQUE(tenant_id, wa_msg_id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_events_tenant_type_created ON events(tenant_id, type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_status ON conversations(tenant_id, status, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_tenant_created ON messages(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_tenant ON whatsapp_sessions(tenant_id);

-- Enable RLS sur toutes les tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies RLS pour isolation par tenant

-- Tenants : accès seulement à son propre tenant
CREATE POLICY "Users can access own tenant"
  ON tenants
  FOR ALL
  TO authenticated
  USING (
    id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Users : accès seulement aux users de son tenant
CREATE POLICY "Users can access same tenant users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- WhatsApp Sessions : accès seulement à son tenant
CREATE POLICY "Users can access own tenant sessions"
  ON whatsapp_sessions
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Events : accès seulement à son tenant
CREATE POLICY "Users can access own tenant events"
  ON events
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Conversations : accès seulement à son tenant
CREATE POLICY "Users can access own tenant conversations"
  ON conversations
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Messages : accès seulement à son tenant
CREATE POLICY "Users can access own tenant messages"
  ON messages
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Fonctions utilitaires

-- Fonction pour normaliser les numéros ivoiriens
CREATE OR REPLACE FUNCTION normalize_ci_phone(input_phone text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  -- Nettoyer le numéro (enlever espaces, tirets, etc.)
  input_phone := regexp_replace(input_phone, '[^0-9]', '', 'g');
  
  -- Vérifier que c'est exactement 10 chiffres
  IF length(input_phone) != 10 THEN
    RAISE EXCEPTION 'Numéro invalide: 10 chiffres attendus, reçu %', length(input_phone);
  END IF;
  
  -- Vérifier que ça commence par 0 (format local ivoirien)
  IF left(input_phone, 1) != '0' THEN
    RAISE EXCEPTION 'Numéro invalide: doit commencer par 0';
  END IF;
  
  -- Convertir en format E.164 : +225 + (numéro sans le 0 initial)
  RETURN '+225' || substring(input_phone, 2);
END;
$$;

-- Fonction pour logger un événement
CREATE OR REPLACE FUNCTION log_event(
  p_tenant_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_conversation_id uuid DEFAULT NULL,
  p_type text,
  p_payload jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO events (tenant_id, user_id, conversation_id, type, payload)
  VALUES (p_tenant_id, p_user_id, p_conversation_id, p_type, p_payload)
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Fonction pour obtenir les métriques d'un tenant
CREATE OR REPLACE FUNCTION get_tenant_metrics(p_tenant_id uuid, p_date date DEFAULT CURRENT_DATE)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH daily_stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE type = 'message_received' AND created_at::date = p_date) as messages_today,
      COUNT(*) FILTER (WHERE type = 'message_received' AND created_at::date = p_date - 1) as messages_yesterday,
      COUNT(*) FILTER (WHERE type = 'order_created' AND created_at::date = p_date) as orders_today,
      COUNT(*) FILTER (WHERE type = 'order_created' AND created_at::date = p_date - 1) as orders_yesterday,
      COUNT(*) FILTER (WHERE type = 'payment_confirmed' AND created_at::date = p_date) as payments_today,
      COUNT(*) FILTER (WHERE type = 'intent_detected' AND payload->>'intent' = 'HIGH' AND created_at::date = p_date) as high_intent_today
    FROM events 
    WHERE tenant_id = p_tenant_id
      AND created_at >= p_date - interval '1 day'
  ),
  conversation_stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE last_message_at::date = p_date) as conversations_today,
      COUNT(*) FILTER (WHERE status = 'active') as active_conversations,
      AVG(message_count) as avg_conversation_length
    FROM conversations 
    WHERE tenant_id = p_tenant_id
  )
  SELECT jsonb_build_object(
    'messages_today', COALESCE(ds.messages_today, 0),
    'messages_yesterday', COALESCE(ds.messages_yesterday, 0),
    'orders_today', COALESCE(ds.orders_today, 0),
    'orders_yesterday', COALESCE(ds.orders_yesterday, 0),
    'payments_today', COALESCE(ds.payments_today, 0),
    'high_intent_today', COALESCE(ds.high_intent_today, 0),
    'conversations_today', COALESCE(cs.conversations_today, 0),
    'active_conversations', COALESCE(cs.active_conversations, 0),
    'avg_conversation_length', COALESCE(cs.avg_conversation_length, 0),
    'calculated_at', now()
  ) INTO result
  FROM daily_stats ds, conversation_stats cs;
  
  RETURN result;
END;
$$;