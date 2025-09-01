/*
  # Create events table

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key vers tenants)
      - `user_id` (uuid, foreign key vers users, optionnel)
      - `conversation_id` (uuid, foreign key vers conversations, optionnel)
      - `type` (text, type d'événement)
      - `payload` (jsonb, données de l'événement)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `events` table
    - Add policies for event access
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  type text NOT NULL,
  payload jsonb DEFAULT '{}' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS events_tenant_id_idx ON events(tenant_id);
CREATE INDEX IF NOT EXISTS events_type_idx ON events(type);
CREATE INDEX IF NOT EXISTS events_created_at_idx ON events(created_at);
CREATE INDEX IF NOT EXISTS events_user_id_idx ON events(user_id);
CREATE INDEX IF NOT EXISTS events_conversation_id_idx ON events(conversation_id);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access their tenant's events"
  ON events
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );