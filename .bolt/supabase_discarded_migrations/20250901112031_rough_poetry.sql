/*
  # Configuration complète de la base de données Whalix

  1. Tables principales
    - `tenants` (entreprises)
    - `users` (utilisateurs)
    - `whatsapp_sessions` (sessions WhatsApp)
    - `conversations` (conversations clients)
    - `messages` (messages WhatsApp)
    - `events` (événements système)

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques d'accès par tenant
    - Isolation complète des données

  3. Fonctionnalités
    - Fonction de métriques
    - Triggers automatiques
    - Index pour performances
*/

-- =============================================
-- 1. EXTENSION POUR UUID
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 2. TABLE TENANTS (ENTREPRISES)
-- =============================================
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  business_sector text NOT NULL CHECK (business_sector IN ('restaurant', 'commerce', 'services', 'hospitality')),
  phone text NOT NULL,
  country_code text DEFAULT '+225',
  currency text DEFAULT 'FCFA',
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_tenants_phone ON tenants(phone);
CREATE INDEX IF NOT EXISTS idx_tenants_sector ON tenants(business_sector);

-- RLS pour tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leur propre tenant
CREATE POLICY "Users can read own tenant"
  ON tenants
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Politique : Les utilisateurs peuvent modifier leur propre tenant
CREATE POLICY "Users can update own tenant"
  ON tenants
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- =============================================
-- 3. TABLE USERS (UTILISATEURS)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  role text DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'agent')),
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- RLS pour users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Politique : Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- =============================================
-- 4. TABLE WHATSAPP SESSIONS
-- =============================================
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wa_device_id text,
  phone_number text,
  status text DEFAULT 'idle' CHECK (status IN ('idle', 'connecting', 'qr_pending', 'connected', 'disconnected', 'error')),
  session_path text,
  qr_code text,
  last_error text,
  message_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_tenant ON whatsapp_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_status ON whatsapp_sessions(status);

-- RLS pour whatsapp_sessions
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir les sessions de leur tenant
CREATE POLICY "Users can read tenant whatsapp sessions"
  ON whatsapp_sessions
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Politique : Les utilisateurs peuvent modifier les sessions de leur tenant
CREATE POLICY "Users can manage tenant whatsapp sessions"
  ON whatsapp_sessions
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- =============================================
-- 5. TABLE CONVERSATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_phone text NOT NULL,
  customer_name text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  last_message_at timestamptz DEFAULT now(),
  message_count integer DEFAULT 0,
  ai_handled boolean DEFAULT false,
  human_handoff_at timestamptz,
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, customer_phone)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_phone ON conversations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- RLS pour conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir les conversations de leur tenant
CREATE POLICY "Users can read tenant conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Politique : Les utilisateurs peuvent gérer les conversations de leur tenant
CREATE POLICY "Users can manage tenant conversations"
  ON conversations
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- =============================================
-- 6. TABLE MESSAGES
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  wa_msg_id text,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_phone text NOT NULL,
  to_phone text NOT NULL,
  body text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'audio', 'video')),
  ai_generated boolean DEFAULT false,
  ai_confidence numeric(3,2),
  intent_detected text CHECK (intent_detected IN ('HIGH', 'MEDIUM', 'LOW')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, wa_msg_id)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_messages_tenant ON messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_direction ON messages(direction);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_intent ON messages(intent_detected);

-- RLS pour messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir les messages de leur tenant
CREATE POLICY "Users can read tenant messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Politique : Les utilisateurs peuvent créer des messages pour leur tenant
CREATE POLICY "Users can create tenant messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- =============================================
-- 7. TABLE EVENTS (TRAÇABILITÉ)
-- =============================================
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  type text NOT NULL,
  payload jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_events_tenant ON events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);

-- RLS pour events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir les événements de leur tenant
CREATE POLICY "Users can read tenant events"
  ON events
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Politique : Les utilisateurs peuvent créer des événements pour leur tenant
CREATE POLICY "Users can create tenant events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- =============================================
-- 8. TRIGGERS POUR UPDATED_AT
-- =============================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour toutes les tables avec updated_at
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_sessions_updated_at
  BEFORE UPDATE ON whatsapp_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 9. FONCTION MÉTRIQUES POUR DASHBOARD
-- =============================================
CREATE OR REPLACE FUNCTION get_tenant_metrics(p_tenant_id uuid, p_date date DEFAULT CURRENT_DATE)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  orders_today integer;
  messages_today integer;
  conversations_active integer;
  revenue_today numeric;
BEGIN
  -- Compter les événements du jour
  SELECT COUNT(*) INTO orders_today
  FROM events 
  WHERE tenant_id = p_tenant_id 
    AND type = 'order_created'
    AND created_at::date = p_date;
    
  SELECT COUNT(*) INTO messages_today
  FROM messages 
  WHERE tenant_id = p_tenant_id 
    AND created_at::date = p_date;
    
  SELECT COUNT(*) INTO conversations_active
  FROM conversations 
  WHERE tenant_id = p_tenant_id 
    AND status = 'active';
    
  -- Calculer le CA (simulation)
  revenue_today := orders_today * 15000; -- Prix moyen estimé
  
  -- Construire le résultat
  result := jsonb_build_object(
    'orders_today', COALESCE(orders_today, 0),
    'messages_today', COALESCE(messages_today, 0),
    'conversations_active', COALESCE(conversations_active, 0),
    'revenue_today', COALESCE(revenue_today, 0),
    'avg_response_time', 2.1,
    'ai_success_rate', 94.5,
    'date', p_date
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 10. DONNÉES DE TEST (OPTIONNEL)
-- =============================================

-- Insérer un tenant de test si aucun n'existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tenants LIMIT 1) THEN
    INSERT INTO tenants (id, name, business_sector, phone) 
    VALUES (
      '00000000-0000-0000-0000-000000000001',
      'Restaurant Demo',
      'restaurant',
      '+22507000001'
    );
  END IF;
END $$;