import { useState, useEffect, useCallback } from 'react';
import { whatsappMetricsAdapter } from '@/lib/services/whatsapp-metrics-adapter';

export function useWhatsAppMetrics(sessionId = 'test1') {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiHealth, setApiHealth] = useState({ available: false });

  // Vérifier la santé de l'API au démarrage
  const checkAPI = useCallback(async () => {
    const health = await whatsappMetricsAdapter.checkAPIHealth();
    setApiHealth(health);
    
    if (!health.available) {
      setError(`API WhatsApp non disponible: ${health.error}`);
      setLoading(false);
    }
    
    return health.available;
  }, []);

  // Charger les métriques
  const loadMetrics = useCallback(async () => {
    try {
      setError(null);
      const data = await whatsappMetricsAdapter.getDashboardMetrics(sessionId);
      setMetrics(data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement métriques:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setLoading(false);
    }
  }, [sessionId]);

  // Démarrer le polling
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const startPolling = async () => {
      // Vérifier l'API d'abord
      const isAvailable = await checkAPI();
      
      if (isAvailable) {
        // Charger les métriques initiales
        await loadMetrics();
        
        // Démarrer le polling toutes les 5 secondes
        intervalId = whatsappMetricsAdapter.startPolling((data) => {
          setMetrics(data);
          setError(null);
        }, 5000);
      }
    };

    startPolling();

    return () => {
      if (intervalId) {
        whatsappMetricsAdapter.stopPolling(intervalId);
      }
    };
  }, [sessionId, checkAPI, loadMetrics]);

  // Refresh manuel
  const refresh = useCallback(async () => {
    setLoading(true);
    await loadMetrics();
  }, [loadMetrics]);

  return {
    metrics,
    loading,
    error,
    apiHealth,
    refresh,
    
    // Helpers pour l'interface
    isConnected: metrics?.whatsapp?.connected || false,
    hasWaitingMessages: (metrics?.messages?.pending || 0) > 0,
    getWaitingCount: () => metrics?.messages?.pending || 0,
    getUptime: () => whatsappMetricsAdapter.formatUptime(metrics?.server?.uptime || 0)
  };
}