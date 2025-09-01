const API_URL = 'http://72.60.80.2:3000';

export class WhatsAppMetricsAdapter {
  
  async getDashboardMetrics(sessionId = 'test1') {
    try {
      // Récupérer toutes les données disponibles depuis les endpoints existants
      const [health, info, status, conversations] = await Promise.all([
        fetch(`${API_URL}/health`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_URL}/`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_URL}/api/session/${sessionId}/status`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_URL}/api/conversations`).then(r => r.ok ? r.json() : null).catch(() => null)
      ]);

      // Si l'API n'est pas disponible, utiliser des données de démo
      if (!health && !info && !status && !conversations) {
        console.warn('⚠️ API WhatsApp non disponible, utilisation du mode démo');
        return this.getDemoMetrics(sessionId);
      }

      // Calculer les métriques depuis les données disponibles
      const now = new Date();
      const todayStart = new Date(now.setHours(0,0,0,0));
      
      // Conversations d'aujourd'hui
      const todayConversations = conversations?.conversations?.filter(c => 
        new Date(c.startTime) >= todayStart
      ) || [];
      
      // Messages d'aujourd'hui
      const messagesToday = todayConversations.reduce((sum, c) => 
        sum + (c.messageCount || 0), 0
      );

      // Messages en attente
      const pendingMessages = conversations?.conversations?.filter(c => {
        const lastMsg = c.lastMessage;
        if (!lastMsg || lastMsg.type !== 'inbound') return false;
        
        const msgTime = new Date(lastMsg.timestamp);
        const timeDiff = now.getTime() - msgTime.getTime();
        return timeDiff < 3600000; // Messages de moins d'1h sans réponse
      }).length || 0;

      // Transformer en format métriques dashboard
      return {
        whatsapp: {
          isConnected: status?.status === 'connected' || false,
          status: status?.status || 'disconnected',
          phoneNumber: status?.phoneNumber || null,
          sessionId: status?.sessionId || sessionId,
          messageCount: status?.messageCount || 0,
          uptime: status?.uptime || 0,
          qrCode: status?.qrCode || null
        },
        
        messages: {
          today: messagesToday,
          total: info?.stats?.totalMessages || 0,
          pending: pendingMessages,
          waiting: pendingMessages, // Alias pour compatibilité
          replied: Math.max(0, messagesToday - pendingMessages)
        },
        
        conversations: {
          active: conversations?.conversations?.length || 0,
          total: info?.stats?.totalConversations || 0,
          new_today: todayConversations.length,
          list: conversations?.conversations || []
        },
        
        ai: {
          response_time: 2.1,     // Valeur fixe pour l'instant
          success_rate: 94.5,     // Valeur fixe pour l'instant
          auto_handled: Math.round(messagesToday * 0.8),
          human_handoff: Math.round(messagesToday * 0.2),
          confidence_avg: 0.85
        },
        
        customers: {
          total: info?.stats?.totalConversations || 0,
          new_today: todayConversations.length,
          returning: Math.max(0, (info?.stats?.totalConversations || 0) - todayConversations.length)
        },
        
        server: {
          uptime: health?.uptime || 0,
          status: health?.status || 'unknown',
          sessions: health?.sessions || 0,
          server_name: "Whalix VPS Simple"
        },
        
        // Métadonnées
        meta: {
          lastUpdated: new Date(),
          dataSource: 'api',
          apiUrl: API_URL,
          sessionId: sessionId
        }
      };
    } catch (error) {
      console.error('Erreur récupération métriques API:', error);
      
      // Utiliser les métriques de démo en cas d'erreur
      return this.getDemoMetrics(sessionId);
    }
  }

  // Métriques de démo quand l'API n'est pas disponible
  private getDemoMetrics(sessionId: string) {
    return {
      whatsapp: {
        isConnected: false,
        status: 'disconnected',
        phoneNumber: null,
        sessionId: sessionId,
        messageCount: 0,
        uptime: 0,
        qrCode: null
      },
      
      messages: {
        today: 0,
        total: 0,
        pending: 0,
        waiting: 0,
        replied: 0
      },
      
      conversations: {
        active: 0,
        total: 0,
        new_today: 0,
        list: []
      },
      
      ai: {
        response_time: 2.1,
        success_rate: 94.5,
        auto_handled: 0,
        human_handoff: 0,
        confidence_avg: 0.85
      },
      
      customers: {
        total: 0,
        new_today: 0,
        returning: 0
      },
      
      server: {
        uptime: 0,
        status: 'disconnected',
        sessions: 0,
        server_name: "API Non Disponible"
      },
      
      meta: {
        lastUpdated: new Date(),
        dataSource: 'demo',
        apiUrl: API_URL,
        sessionId: sessionId
      }
    };
  }
  // Polling pour mises à jour temps réel
  startPolling(callback: (metrics: any) => void, interval = 5000) {
    const poll = async () => {
      try {
        const metrics = await this.getDashboardMetrics();
        callback(metrics);
      } catch (error) {
        console.error('Erreur polling métriques:', error);
        // En cas d'erreur, utiliser les métriques de démo
        callback(this.getDemoMetrics('test1'));
      }
    };
    
    poll(); // Appel initial
    return setInterval(poll, interval);
  }

  // Arrêter le polling
  stopPolling(intervalId: NodeJS.Timeout) {
    clearInterval(intervalId);
  }

  // Récupérer les conversations pour la page Messages
  async getConversationsForMessagesPage() {
    try {
      const response = await fetch(`${API_URL}/api/conversations`);
      
      if (!response.ok) {
        console.warn('⚠️ API conversations non disponible');
        return [];
      }
      
      const data = await response.json();
      
      // Transformer au format attendu par la page Messages
      return data?.conversations?.map(conv => ({
        id: conv.phone,
        customer: conv.name || 'Client',
        customer_phone: conv.phone,
        last_message: conv.lastMessage?.text || '',
        at: conv.lastMessage?.timestamp || conv.startTime,
        status: conv.lastMessage?.type === 'inbound' ? 'waiting' : 'ai_replied',
        message_count: conv.messageCount || 0
      })) || [];
    } catch (error) {
      console.error('Erreur récupération conversations:', error);
      return [];
    }
  }

  // Vérifier la santé de l'API
  async checkAPIHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return {
        available: true,
        status: data.status,
        uptime: data.uptime,
        sessions: data.sessions
      };
    } catch (error) {
      console.warn('API WhatsApp non disponible:', error);
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  // Formater l'uptime en texte lisible
  formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  // Calculer les tendances (approximation)
  calculateTrends(current: any, previous: any = {}) {
    const calculateChange = (curr: number, prev: number) => {
      if (prev === 0) return 0;
      return ((curr - prev) / prev) * 100;
    };

    return {
      messagesVsYesterday: calculateChange(current.messages?.today || 0, previous.messages?.today || 0),
      conversationsVsYesterday: calculateChange(current.conversations?.new_today || 0, previous.conversations?.new_today || 0),
      customersVsYesterday: calculateChange(current.customers?.new_today || 0, previous.customers?.new_today || 0)
    };
  }
}

export const whatsappMetricsAdapter = new WhatsAppMetricsAdapter();