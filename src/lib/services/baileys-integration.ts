// Service d'intégration avec le serveur Baileys local
import { io, Socket } from 'socket.io-client';

export interface BaileysSession {
  restaurantId: string;
  status: 'idle' | 'connecting' | 'qr_pending' | 'connected' | 'disconnected' | 'error';
  qrCode?: string;
  lastConnected?: Date;
  phoneNumber?: string;
  error?: string;
  messageCount?: number;
}

export interface BaileysMessage {
  id: string;
  from: string;
  pushName?: string;
  text: string;
  timestamp: number;
  restaurantId: string;
  type: 'text' | 'image' | 'document';
}

class BaileysIntegrationService {
  private socket: Socket | null = null;
  private backendUrl = 'https://whalix-server-railway-production.up.railway.app';
  private sessions = new Map<string, BaileysSession>();
  private messageListeners = new Map<string, (message: BaileysMessage) => void>();
  private aiReplyListeners = new Map<string, (reply: any) => void>();
  private sessionListeners = new Map<string, (session: BaileysSession) => void>();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    return; // TEMPORAIRE: pas de WebSocket pour l'instant - serveur Railway n'a pas Socket.io
    
    /* WEBSOCKET CODE COMMENTÉ TEMPORAIREMENT
    try {
      this.socket = io(this.backendUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        forceNew: true,
        autoConnect: false
      });

      this.socket.on('connect', () => {
        console.log('✅ Connecté au serveur Baileys');
      });

      this.socket.on('disconnect', () => {
        console.log('🔴 Déconnecté du serveur Baileys');
      });

      this.socket.on('connect_error', (error) => {
        console.warn('⚠️ Serveur Baileys non disponible. Démarrez-le avec: npm run whatsapp:start', error.message);
        // Ne pas lancer d'erreur, juste avertir
      });

      // Tenter la connexion seulement si nécessaire
      this.attemptConnection();

    } catch (error) {
      console.warn('⚠️ Impossible d\'initialiser la connexion Baileys');
    }
    */
  }

  private async attemptConnection() {
    return; // TEMPORAIRE: pas de WebSocket
    
    /* WEBSOCKET CODE COMMENTÉ
    try {
      // Vérifier d'abord si le serveur est disponible
      const isAvailable = await this.checkServerHealth();
      if (isAvailable && this.socket) {
        this.socket.connect();
      }
    } catch (error) {
      console.warn('⚠️ Connexion WebSocket différée - serveur non disponible');
    }
    */
  }

  // Connecter WhatsApp pour un restaurant
  async connectWhatsApp(restaurantId: string, webhookUrl?: string): Promise<BaileysSession> {
    try {
      console.log(`🔗 Connexion WhatsApp pour ${restaurantId}`);
      
      // Vérifier si le serveur Baileys est disponible
      const isServerAvailable = await this.checkServerHealth();
      if (!isServerAvailable) {
        // Retourner une session en mode démo si serveur indisponible
        const demoSession: BaileysSession = {
          restaurantId,
          status: 'error',
          error: 'Serveur WhatsApp indisponible. Démarrez le serveur avec: npm run whatsapp:start'
        };
        this.sessions.set(restaurantId, demoSession);
        return demoSession;
      }

      const response = await fetch(`${this.backendUrl}/api/whatsapp/connect/${restaurantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookUrl })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur de connexion');
      }

      const data = await response.json();
      
      const session: BaileysSession = {
        restaurantId,
        status: data.status === 'qr_generated' ? 'qr_pending' : 
                data.status === 'connected' ? 'connected' : 'connecting',
        qrCode: data.qr,
        phoneNumber: data.phoneNumber,
        error: data.error
      };

      this.sessions.set(restaurantId, session);
      this.subscribeToSessionEvents(restaurantId);
      
      return session;
    } catch (error) {
      console.error('❌ Erreur connexion WhatsApp:', error);
      const errorSession: BaileysSession = {
        restaurantId,
        status: 'error',
        error: error instanceof Error ? error.message : 'Erreur de connexion'
      };
      this.sessions.set(restaurantId, errorSession);
      throw error;
    }
  }

  // Déconnecter WhatsApp
  async disconnectWhatsApp(restaurantId: string): Promise<void> {
    try {
      const response = await fetch(`${this.backendUrl}/api/whatsapp/disconnect/${restaurantId}`, {
        method: 'POST'
      });

      if (response.ok) {
        const session = this.sessions.get(restaurantId);
        if (session) {
          session.status = 'disconnected';
          session.qrCode = undefined;
          this.sessions.set(restaurantId, session);
          this.notifySessionListeners(restaurantId, session);
        }
      }
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      throw error;
    }
  }

  // Vérifier le statut de connexion
  async getConnectionStatus(restaurantId: string): Promise<BaileysSession | null> {
    try {
      const response = await fetch(`${this.backendUrl}/api/whatsapp/status/${restaurantId}`);
      
      if (!response.ok) {
        const errorSession: BaileysSession = {
          restaurantId,
          status: 'error',
          error: `Serveur WhatsApp indisponible (${response.status}). Démarrez le serveur avec: npm run whatsapp:start`
        };
        this.sessions.set(restaurantId, errorSession);
        return errorSession;
      }

      const data = await response.json();
      
      const session: BaileysSession = {
        restaurantId,
        status: data.status,
        qrCode: data.qr,
        phoneNumber: data.phoneNumber,
        lastConnected: data.lastConnected ? new Date(data.lastConnected) : undefined,
        messageCount: data.messageCount
      };

      this.sessions.set(restaurantId, session);
      return session;
    } catch (error) {
      const errorSession: BaileysSession = {
        restaurantId,
        status: 'error',
        error: 'Serveur WhatsApp indisponible. Démarrez le serveur avec: npm run whatsapp:start'
      };
      this.sessions.set(restaurantId, errorSession);
      return errorSession;
    }
  }

  // Envoyer un message de test
  async sendTestMessage(restaurantId: string, to: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/api/whatsapp/send/${restaurantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, message })
      });

      const data = await response.json();
      return data.status === 'sent';
    } catch (error) {
      console.error('❌ Erreur envoi message test:', error);
      return false;
    }
  }

  // Vérifier la santé du serveur
  private async checkServerHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${this.backendUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('⚠️ Serveur Baileys non disponible');
      return false;
    }
  }

  // S'abonner aux événements de session
  private subscribeToSessionEvents(restaurantId: string) {
    return; // TEMPORAIRE: pas de WebSocket
    
    /* WEBSOCKET CODE COMMENTÉ
    if (!this.socket) return;

    // S'abonner aux événements de ce restaurant
    this.socket.emit('subscribe', restaurantId);

    // Écouter les mises à jour de session
    this.socket.on(`session-${restaurantId}`, (sessionData) => {
      console.log(`📡 Mise à jour session ${restaurantId}:`, sessionData);
      
      const session: BaileysSession = {
        restaurantId: sessionData.restaurantId,
        status: sessionData.status,
        qrCode: sessionData.qrCode,
        phoneNumber: sessionData.phoneNumber,
        lastConnected: sessionData.lastConnected ? new Date(sessionData.lastConnected) : undefined
      };

      this.sessions.set(restaurantId, session);
      this.notifySessionListeners(restaurantId, session);
    });

    // Écouter les nouveaux messages
    this.socket.on(`message-${restaurantId}`, (messageData) => {
      console.log(`📨 Nouveau message pour ${restaurantId}:`, messageData);
      
      const message: BaileysMessage = {
        id: messageData.id,
        from: messageData.from,
        pushName: messageData.pushName,
        text: messageData.text,
        timestamp: messageData.timestamp,
        restaurantId: messageData.restaurantId,
        type: messageData.type || 'text'
      };

      this.notifyMessageListeners(restaurantId, message);
    });

    // Écouter les réponses IA
    this.socket.on(`ai-reply-${restaurantId}`, (replyData) => {
      console.log(`🤖 Réponse IA pour ${restaurantId}:`, replyData);
      this.notifyAIReplyListeners(restaurantId, replyData);
    });
    */
  }

  // Gestionnaires d'événements
  onSessionUpdate(restaurantId: string, callback: (session: BaileysSession) => void) {
    this.sessionListeners.set(restaurantId, callback);
    
    // Retourner la session actuelle si elle existe
    const currentSession = this.sessions.get(restaurantId);
    if (currentSession) {
      callback(currentSession);
    }
    
    return () => {
      this.sessionListeners.delete(restaurantId);
    };
  }

  onMessageReceived(restaurantId: string, callback: (message: BaileysMessage) => void) {
    this.messageListeners.set(restaurantId, callback);
    
    return () => {
      this.messageListeners.delete(restaurantId);
    };
  }

  onAIReply(restaurantId: string, callback: (reply: any) => void) {
    this.aiReplyListeners.set(restaurantId, callback);
    
    return () => {
      this.aiReplyListeners.delete(restaurantId);
    };
  }

  // Notificateurs privés
  private notifySessionListeners(restaurantId: string, session: BaileysSession) {
    const listener = this.sessionListeners.get(restaurantId);
    if (listener) {
      listener(session);
    }
  }

  private notifyMessageListeners(restaurantId: string, message: BaileysMessage) {
    const listener = this.messageListeners.get(restaurantId);
    if (listener) {
      listener(message);
    }
  }

  private notifyAIReplyListeners(restaurantId: string, reply: any) {
    const listener = this.aiReplyListeners.get(restaurantId);
    if (listener) {
      listener(reply);
    }
  }

  // Obtenir la session actuelle
  getSession(restaurantId: string): BaileysSession | null {
    return this.sessions.get(restaurantId) || null;
  }

  // Vérifier si connecté
  isConnected(restaurantId: string): boolean {
    const session = this.sessions.get(restaurantId);
    return session?.status === 'connected';
  }

  // Nettoyer les ressources
  cleanup() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.sessions.clear();
    this.messageListeners.clear();
    this.aiReplyListeners.clear();
    this.sessionListeners.clear();
  }
}

export const baileysService = new BaileysIntegrationService();