/*
  # Create tenants table

  1. New Tables
    - `tenants`
      - `id` (uuid, primary key)
      - `name` (text, nom de l'entreprise)
      - `business_sector` (enum, secteur d'activité)
      - `phone` (text, numéro au format E.164)
      - `country_code` (text, code pays par défaut CI)
      - `currency` (text, devise par défaut XOF)
      - `settings` (jsonb, paramètres personnalisés)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `tenants` table
    - Add policy for authenticated users to read their own tenant data
*/

-- Create enum for business sectors
CREATE TYPE business_sector_enum AS ENUM ('restaurant', 'commerce', 'services', 'hospitality');

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  business_sector business_sector_enum NOT NULL,
  phone text UNIQUE NOT NULL,
  country_code text DEFAULT 'CI' NOT NULL,
  currency text DEFAULT 'XOF' NOT NULL,
  settings jsonb DEFAULT '{}' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own tenant data"
  ON tenants
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own tenant data"
  ON tenants
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();