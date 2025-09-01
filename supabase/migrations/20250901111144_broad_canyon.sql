/*
  # Create metrics function

  1. Functions
    - `get_tenant_metrics` - Calcule les métriques d'un tenant pour une date donnée

  2. Security
    - Function accessible aux utilisateurs authentifiés
*/

-- Create function to get tenant metrics
CREATE OR REPLACE FUNCTION get_tenant_metrics(
  p_tenant_id uuid,
  p_date date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  total_conversations integer;
  total_messages integer;
  ai_handled_count integer;
  response_time_avg numeric;
BEGIN
  -- Vérifier que l'utilisateur a accès à ce tenant
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND tenant_id = p_tenant_id
  ) THEN
    RAISE EXCEPTION 'Access denied to tenant metrics';
  END IF;

  -- Calculer les métriques
  SELECT 
    COUNT(*) INTO total_conversations
  FROM conversations 
  WHERE tenant_id = p_tenant_id 
    AND DATE(created_at) = p_date;

  SELECT 
    COUNT(*) INTO total_messages
  FROM messages 
  WHERE tenant_id = p_tenant_id 
    AND DATE(created_at) = p_date;

  SELECT 
    COUNT(*) INTO ai_handled_count
  FROM conversations 
  WHERE tenant_id = p_tenant_id 
    AND ai_handled = true
    AND DATE(created_at) = p_date;

  -- Construire le résultat
  result := jsonb_build_object(
    'date', p_date,
    'total_conversations', COALESCE(total_conversations, 0),
    'total_messages', COALESCE(total_messages, 0),
    'ai_handled_conversations', COALESCE(ai_handled_count, 0),
    'ai_handling_rate', 
      CASE 
        WHEN total_conversations > 0 
        THEN ROUND((ai_handled_count::numeric / total_conversations::numeric) * 100, 2)
        ELSE 0 
      END
  );

  RETURN result;
END;
$$;