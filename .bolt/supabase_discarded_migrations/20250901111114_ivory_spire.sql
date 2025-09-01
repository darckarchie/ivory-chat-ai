/*
  # Create WhatsApp sessions table

  1. New Tables
    - `whatsapp_sessions`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key vers tenants, unique)
      - `user_id` (uuid, foreign key vers users)
      - `wa_device_id` (text, ID du device WhatsApp)
      - `phone_number` (text, numéro WhatsApp connecté)
      - `status` (enum, statut de la session)
      - `session_path` (text, chemin de la session)
      - `qr_code` (text, QR code pour connexion)
      - `last_error` (text, dernière erreur)
      - `message_count` (integer, compteur de messages)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `last_seen_at` (timestamp)

  2. Security
    - Enable RLS on `whatsapp_sessions` table
    - Add policies for session access
*/

-- Create enum for session status
CREATE TYPE session_status_enum AS ENUM ('idle', 'connecting', 'qr_pending', 'connected', 'disconnected', 'error');

-- Create whatsapp_sessions table
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wa_device_id text,
  phone_number text,
  status session_status_enum DEFAULT 'idle' NOT NULL,
  session_path text,
  qr_code text,
  last_error text,
  message_count integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  last_seen_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS whatsapp_sessions_tenant_id_idx ON whatsapp_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS whatsapp_sessions_status_idx ON whatsapp_sessions(status);

-- Enable RLS
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access their tenant's WhatsApp session"
  ON whatsapp_sessions
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_whatsapp_sessions_updated_at
  BEFORE UPDATE ON whatsapp_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();