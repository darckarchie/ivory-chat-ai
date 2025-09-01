import { useState, useEffect, useCallback } from 'react';
import { DashboardMetrics, WhatsAppAPIResponse, transformAPIToMetrics, DEFAULT_DEMO_METRICS } from '@/lib/types/dashboard-metrics';

export function useDashboardMetrics(tenantId: string) {
  const [metrics, setMetrics] = useState<DashboardMetrics>(DEFAULT_DEMO_METRICS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // URL de l'API WhatsApp (à adapter selon votre configuration)
  const API_BASE_URL = import.meta.env.VITE_WHATSAPP_API_URL || 'http://localhost:3001';

  // Récupérer les métriques depuis l'API WhatsApp
  const fetchMetricsFromAPI = useCallback(async () => {
    try {
      setError(null);
      
      // 1. Vérifier le statut de connexion WhatsApp
      const statusResponse = await fetch(`${API_BASE_URL}/api/whatsapp/status/${tenantId}`);
      
      if (!statusResponse.ok) {
        throw new Error(`API non disponible (${statusResponse.status})`);
      }
      
      const statusData = await statusResponse.json();
      
      // 2. Récupérer les métriques détaillées
      const metricsResponse = await fetch(`${API_BASE_URL}/api/metrics/${tenantId}`);
      let metricsData = {};
      
      if (metricsResponse.ok) {
        metricsData = await metricsResponse.json();
      }
      
      // 3. Transformer en format dashboard
      const apiData: WhatsAppAPIResponse = {
        connected: statusData.status === 'connected',
        phoneNumber: statusData.phoneNumber,
        lastSeen: statusData.lastConnected,
        totalMessages: metricsData.totalMessages || 0,
        todayMessages: metricsData.todayMessages || 0,
        pendingMessages: metricsData.pendingMessages || 0,
        avgResponseTime: metricsData.avgResponseTime || 2.1,
        successRate: metricsData.successRate || 94.5,
        recentMessages: metricsData.recentMessages || []
      };
      
      const transformedMetrics = transformAPIToMetrics(apiData);
      
      // 4. Fusionner avec les métriques existantes
      setMetrics(prev => ({
        ...prev,
        ...transformedMetrics,
        meta: {
          lastUpdated: new Date(),
          dataSource: 'api',
          updateInterval: 30
        }
      }));
      
      setLastUpdate(new Date());
      
    } catch (err) {
      console.warn('⚠️ API WhatsApp non disponible, utilisation du mode démo');
      setError(err instanceof Error ? err.message : 'Erreur API');
      
      // Utiliser les métriques de démo avec quelques données simulées
      setMetrics(prev => ({
        ...DEFAULT_DEMO_METRICS,
        whatsapp: {
          ...DEFAULT_DEMO_METRICS.whatsapp,
          messagesToday: Math.floor(Math.random() * 50) + 10,
          messagesWaiting: Math.floor(Math.random() * 5),
        },
        business: {
          ...DEFAULT_DEMO_METRICS.business,
          ordersToday: Math.floor(Math.random() * 20) + 5,
          revenueToday: Math.floor(Math.random() * 200000) + 50000,
        },
        meta: {
          lastUpdated: new Date(),
          dataSource: 'demo',
          updateInterval: 30
        }
      }));
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, API_BASE_URL]);

  // Mettre à jour les métriques WhatsApp quand la connexion change
  const updateWhatsAppMetrics = useCallback((whatsappData: {
    connected: boolean;
    phoneNumber?: string;
    messageCount?: number;
    pendingCount?: number;
  }) => {
    setMetrics(prev => ({
      ...prev,
      whatsapp: {
        ...prev.whatsapp,
        isConnected: whatsappData.connected,
        phoneNumber: whatsappData.phoneNumber,
        lastConnected: whatsappData.connected ? new Date() : prev.whatsapp.lastConnected,
        sessionStatus: whatsappData.connected ? 'connected' : 'disconnected',
        messagesToday: whatsappData.messageCount || prev.whatsapp.messagesToday,
        messagesWaiting: whatsappData.pendingCount || prev.whatsapp.messagesWaiting,
      },
      meta: {
        ...prev.meta,
        lastUpdated: new Date()
      }
    }));
  }, []);

  // Ajouter un nouveau message aux métriques
  const addMessage = useCallback((message: {
    intent: 'HIGH' | 'MEDIUM' | 'LOW';
    isAIReplied: boolean;
    responseTime?: number;
  }) => {
    setMetrics(prev => {
      const newMetrics = { ...prev };
      
      // Incrémenter les compteurs
      newMetrics.whatsapp.messagesToday += 1;
      newMetrics.whatsapp.messagesTotal += 1;
      
      // Gérer les intentions
      if (message.intent === 'HIGH') {
        newMetrics.whatsapp.highIntentCount += 1;
      } else if (message.intent === 'MEDIUM') {
        newMetrics.whatsapp.mediumIntentCount += 1;
      } else {
        newMetrics.whatsapp.lowIntentCount += 1;
      }
      
      // Gérer les réponses
      if (message.isAIReplied) {
        newMetrics.whatsapp.messagesReplied += 1;
        if (message.responseTime) {
          // Mettre à jour le temps de réponse moyen
          newMetrics.whatsapp.aiResponseTime = 
            (newMetrics.whatsapp.aiResponseTime + message.responseTime) / 2;
        }
      } else {
        newMetrics.whatsapp.messagesWaiting += 1;
      }
      
      // Mettre à jour les métriques temps réel
      newMetrics.realtime.activeConversations = newMetrics.whatsapp.messagesWaiting;
      newMetrics.realtime.messagesPerHour = Math.floor(newMetrics.whatsapp.messagesToday / 12);
      
      newMetrics.meta.lastUpdated = new Date();
      
      return newMetrics;
    });
  }, []);

  // Marquer un message comme répondu
  const markMessageReplied = useCallback((messageId: string, isAI: boolean = true) => {
    setMetrics(prev => ({
      ...prev,
      whatsapp: {
        ...prev.whatsapp,
        messagesWaiting: Math.max(0, prev.whatsapp.messagesWaiting - 1),
        messagesReplied: prev.whatsapp.messagesReplied + 1,
      },
      realtime: {
        ...prev.realtime,
        activeConversations: Math.max(0, prev.realtime.activeConversations - 1),
      },
      meta: {
        ...prev.meta,
        lastUpdated: new Date()
      }
    }));
  }, []);

  // Ajouter une commande
  const addOrder = useCallback((orderData: {
    amount: number;
    isNewCustomer: boolean;
  }) => {
    setMetrics(prev => ({
      ...prev,
      business: {
        ...prev.business,
        ordersToday: prev.business.ordersToday + 1,
        revenueToday: prev.business.revenueToday + orderData.amount,
        newCustomersToday: orderData.isNewCustomer 
          ? prev.business.newCustomersToday + 1 
          : prev.business.newCustomersToday,
        avgOrderValue: (prev.business.revenueToday + orderData.amount) / (prev.business.ordersToday + 1),
      },
      trends: {
        ...prev.trends,
        ordersVsYesterday: ((prev.business.ordersToday + 1) - prev.business.ordersYesterday) / Math.max(prev.business.ordersYesterday, 1) * 100,
        revenueVsYesterday: ((prev.business.revenueToday + orderData.amount) - prev.business.revenueYesterday) / Math.max(prev.business.revenueYesterday, 1) * 100,
      },
      meta: {
        ...prev.meta,
        lastUpdated: new Date()
      }
    }));
  }, []);

  // Charger les métriques initiales
  useEffect(() => {
    fetchMetricsFromAPI();
    
    // Polling toutes les 30 secondes
    const interval = setInterval(fetchMetricsFromAPI, 30000);
    
    return () => clearInterval(interval);
  }, [fetchMetricsFromAPI]);

  // Simuler des données en mode démo
  useEffect(() => {
    if (metrics.meta.dataSource === 'demo') {
      const interval = setInterval(() => {
        // Simuler de nouveaux messages occasionnellement
        if (Math.random() > 0.8) {
          const intents: Array<'HIGH' | 'MEDIUM' | 'LOW'> = ['HIGH', 'MEDIUM', 'LOW'];
          const randomIntent = intents[Math.floor(Math.random() * intents.length)];
          
          addMessage({
            intent: randomIntent,
            isAIReplied: Math.random() > 0.2, // 80% de chance d'être répondu par l'IA
            responseTime: Math.random() * 3 + 1 // 1-4 secondes
          });
        }
      }, 15000); // Toutes les 15 secondes
      
      return () => clearInterval(interval);
    }
  }, [metrics.meta.dataSource, addMessage]);

  return {
    metrics,
    isLoading,
    error,
    lastUpdate,
    
    // Actions pour mettre à jour les métriques
    updateWhatsAppMetrics,
    addMessage,
    markMessageReplied,
    addOrder,
    
    // Refresh manuel
    refresh: fetchMetricsFromAPI,
    
    // Helpers
    isConnected: metrics.whatsapp.isConnected,
    hasWaitingMessages: metrics.whatsapp.messagesWaiting > 0,
    getWaitingCount: () => metrics.whatsapp.messagesWaiting,
  };
}