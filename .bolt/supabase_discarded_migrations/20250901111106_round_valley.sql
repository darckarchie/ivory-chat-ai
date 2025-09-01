/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key, lié à auth.users)
      - `tenant_id` (uuid, foreign key vers tenants)
      - `first_name` (text, prénom)
      - `last_name` (text, nom)
      - `phone` (text, numéro au format E.164)
      - `role` (enum, rôle dans l'entreprise)
      - `settings` (jsonb, paramètres utilisateur)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policies for user data access
*/

-- Create enum for user roles
CREATE TYPE user_role_enum AS ENUM ('owner', 'admin', 'agent');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  role user_role_enum DEFAULT 'owner' NOT NULL,
  settings jsonb DEFAULT '{}' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS users_tenant_id_idx ON users(tenant_id);
CREATE INDEX IF NOT EXISTS users_phone_idx ON users(phone);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Tenant owners can read all users in their tenant"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();