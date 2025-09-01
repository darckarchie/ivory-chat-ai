// Types pour les métriques du dashboard Whalix
export interface DashboardMetrics {
  // === MÉTRIQUES WHATSAPP ===
  whatsapp: {
    // Statut de connexion
    isConnected: boolean;
    phoneNumber?: string;
    lastConnected?: Date;
    sessionStatus: 'idle' | 'connecting' | 'qr_pending' | 'connected' | 'disconnected' | 'error';
    
    // Messages
    messagesTotal: number;        // Total messages traités
    messagesToday: number;        // Messages aujourd'hui
    messagesWaiting: number;      // Messages en attente de réponse
    messagesReplied: number;      // Messages déjà répondus
    
    // Performance IA
    aiResponseTime: number;       // Temps de réponse moyen (secondes)
    aiSuccessRate: number;        // Taux de succès IA (%)
    aiConfidenceAvg: number;      // Confiance moyenne (0-1)
    
    // Intentions détectées
    highIntentCount: number;      // Messages haute intention d'achat
    mediumIntentCount: number;    // Messages intention moyenne
    lowIntentCount: number;       // Messages faible intention
  };
  
  // === MÉTRIQUES BUSINESS ===
  business: {
    // Ventes
    ordersToday: number;          // Commandes aujourd'hui
    ordersYesterday: number;      // Commandes hier
    revenueToday: number;         // CA aujourd'hui (FCFA)
    revenueYesterday: number;     // CA hier (FCFA)
    avgOrderValue: number;        // Panier moyen (FCFA)
    
    // Conversions
    conversionRate: number;       // Taux de conversion (%)
    leadsGenerated: number;       // Prospects générés
    quotesRequested: number;      // Devis demandés
    
    // Clients
    newCustomersToday: number;    // Nouveaux clients aujourd'hui
    totalCustomers: number;       // Total clients
    repeatCustomerRate: number;   // Taux de fidélité (%)
    customerSatisfaction: number; // Satisfaction (1-5)
  };
  
  // === MÉTRIQUES TEMPS RÉEL ===
  realtime: {
    activeConversations: number;  // Conversations actives
    avgResponseTime: number;      // Temps de réponse moyen (minutes)
    messagesPerHour: number;      // Messages par heure
    peakHours: string[];          // Heures de pointe ['18:00', '19:00']
    currentLoad: number;          // Charge actuelle (%)
  };
  
  // === TENDANCES ===
  trends: {
    messagesVsYesterday: number;  // % vs hier
    ordersVsYesterday: number;    // % vs hier
    revenueVsYesterday: number;   // % vs hier
    customersVsYesterday: number; // % vs hier
  };
  
  // === MÉTADONNÉES ===
  meta: {
    lastUpdated: Date;
    dataSource: 'live' | 'demo' | 'api';
    updateInterval: number;       // Intervalle de mise à jour (secondes)
  };
}

// Interface pour les messages en temps réel
export interface LiveMessage {
  id: string;
  timestamp: string;
  customer: string;
  customerPhone: string;
  message: string;
  status: 'waiting' | 'ai_replied' | 'human_replied';
  intent: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence?: number;
  aiResponse?: string;
}

// Interface pour l'API WhatsApp
export interface WhatsAppAPIResponse {
  // Statut de connexion
  connected: boolean;
  phoneNumber?: string;
  lastSeen?: string;
  
  // Messages
  totalMessages: number;
  todayMessages: number;
  pendingMessages: number;
  
  // Performance
  avgResponseTime: number;
  successRate: number;
  
  // Messages récents
  recentMessages: Array<{
    id: string;
    from: string;
    message: string;
    timestamp: number;
    intent: 'HIGH' | 'MEDIUM' | 'LOW';
    replied: boolean;
  }>;
}

// Fonction pour transformer les données API en métriques dashboard
export function transformAPIToMetrics(apiData: WhatsAppAPIResponse): Partial<DashboardMetrics> {
  return {
    whatsapp: {
      isConnected: apiData.connected,
      phoneNumber: apiData.phoneNumber,
      lastConnected: apiData.lastSeen ? new Date(apiData.lastSeen) : undefined,
      sessionStatus: apiData.connected ? 'connected' : 'disconnected',
      messagesTotal: apiData.totalMessages,
      messagesToday: apiData.todayMessages,
      messagesWaiting: apiData.pendingMessages,
      messagesReplied: apiData.todayMessages - apiData.pendingMessages,
      aiResponseTime: apiData.avgResponseTime,
      aiSuccessRate: apiData.successRate,
      aiConfidenceAvg: 0.85,
      highIntentCount: apiData.recentMessages.filter(m => m.intent === 'HIGH').length,
      mediumIntentCount: apiData.recentMessages.filter(m => m.intent === 'MEDIUM').length,
      lowIntentCount: apiData.recentMessages.filter(m => m.intent === 'LOW').length,
    },
    
    realtime: {
      activeConversations: apiData.pendingMessages,
      avgResponseTime: apiData.avgResponseTime / 60, // Convertir en minutes
      messagesPerHour: Math.floor(apiData.todayMessages / 12),
      peakHours: ['18:00', '19:00', '20:00'],
      currentLoad: Math.min((apiData.pendingMessages / 10) * 100, 100)
    },
    
    meta: {
      lastUpdated: new Date(),
      dataSource: 'api',
      updateInterval: 30
    }
  };
}

// Métriques par défaut pour le mode démo
export const DEFAULT_DEMO_METRICS: DashboardMetrics = {
  whatsapp: {
    isConnected: false,
    sessionStatus: 'idle',
    messagesTotal: 0,
    messagesToday: 0,
    messagesWaiting: 0,
    messagesReplied: 0,
    aiResponseTime: 2.1,
    aiSuccessRate: 94.5,
    aiConfidenceAvg: 0.85,
    highIntentCount: 0,
    mediumIntentCount: 0,
    lowIntentCount: 0,
  },
  
  business: {
    ordersToday: 0,
    ordersYesterday: 0,
    revenueToday: 0,
    revenueYesterday: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    leadsGenerated: 0,
    quotesRequested: 0,
    newCustomersToday: 0,
    totalCustomers: 0,
    repeatCustomerRate: 0,
    customerSatisfaction: 4.5
  },
  
  realtime: {
    activeConversations: 0,
    avgResponseTime: 1.2,
    messagesPerHour: 0,
    peakHours: ['18:00', '19:00', '20:00'],
    currentLoad: 0
  },
  
  trends: {
    messagesVsYesterday: 0,
    ordersVsYesterday: 0,
    revenueVsYesterday: 0,
    customersVsYesterday: 0
  },
  
  meta: {
    lastUpdated: new Date(),
    dataSource: 'demo',
    updateInterval: 30
  }
};