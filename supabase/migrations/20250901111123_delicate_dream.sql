/*
  # Create conversations table

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key vers tenants)
      - `customer_phone` (text, numéro du client)
      - `customer_name` (text, nom du client)
      - `status` (enum, statut de la conversation)
      - `last_message_at` (timestamp)
      - `message_count` (integer, nombre de messages)
      - `ai_handled` (boolean, géré par IA)
      - `human_handoff_at` (timestamp, transfert humain)
      - `tags` (text array, tags de classification)
      - `metadata` (jsonb, métadonnées)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `conversations` table
    - Add policies for conversation access
*/

-- Create enum for conversation status
CREATE TYPE conversation_status_enum AS ENUM ('active', 'closed', 'archived');

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_phone text NOT NULL,
  customer_name text,
  status conversation_status_enum DEFAULT 'active' NOT NULL,
  last_message_at timestamptz DEFAULT now() NOT NULL,
  message_count integer DEFAULT 0 NOT NULL,
  ai_handled boolean DEFAULT false NOT NULL,
  human_handoff_at timestamptz,
  tags text[] DEFAULT '{}' NOT NULL,
  metadata jsonb DEFAULT '{}' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(tenant_id, customer_phone)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS conversations_tenant_id_idx ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS conversations_customer_phone_idx ON conversations(customer_phone);
CREATE INDEX IF NOT EXISTS conversations_status_idx ON conversations(status);
CREATE INDEX IF NOT EXISTS conversations_last_message_at_idx ON conversations(last_message_at);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access their tenant's conversations"
  ON conversations
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();