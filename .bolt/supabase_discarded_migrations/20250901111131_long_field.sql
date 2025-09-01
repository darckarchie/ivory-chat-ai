/*
  # Create messages table

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key vers tenants)
      - `conversation_id` (uuid, foreign key vers conversations)
      - `wa_msg_id` (text, ID du message WhatsApp)
      - `direction` (enum, direction du message)
      - `from_phone` (text, numéro expéditeur)
      - `to_phone` (text, numéro destinataire)
      - `body` (text, contenu du message)
      - `message_type` (enum, type de message)
      - `ai_generated` (boolean, généré par IA)
      - `ai_confidence` (numeric, confiance IA)
      - `intent_detected` (enum, intention détectée)
      - `metadata` (jsonb, métadonnées)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `messages` table
    - Add policies for message access
*/

-- Create enums
CREATE TYPE message_direction_enum AS ENUM ('inbound', 'outbound');
CREATE TYPE message_type_enum AS ENUM ('text', 'image', 'document', 'audio', 'video');
CREATE TYPE intent_level_enum AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  wa_msg_id text,
  direction message_direction_enum NOT NULL,
  from_phone text NOT NULL,
  to_phone text NOT NULL,
  body text NOT NULL,
  message_type message_type_enum DEFAULT 'text' NOT NULL,
  ai_generated boolean DEFAULT false NOT NULL,
  ai_confidence numeric(3,2),
  intent_detected intent_level_enum,
  metadata jsonb DEFAULT '{}' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(tenant_id, wa_msg_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS messages_tenant_id_idx ON messages(tenant_id);
CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_wa_msg_id_idx ON messages(wa_msg_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);
CREATE INDEX IF NOT EXISTS messages_direction_idx ON messages(direction);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access their tenant's messages"
  ON messages
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );