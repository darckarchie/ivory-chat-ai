// src/lib/services/baileys-service.ts
import io, { Socket } from 'socket.io-client';

export interface WhatsAppStatus {
  connected: boolean;
  number: string | null;
  qrCode: string | null;
  loading: boolean;
  error: string | null;
}

export interface IncomingMessage {
  from: string;
  message: string;
  name: string;
  timestamp: string;
  intent?: 'HIGH' | 'MEDIUM' | 'LOW';
}

class BaileysService {
  private socket: Socket | null = null;
  private statusCallbacks: ((status: WhatsAppStatus) => void)[] = [];
  private messageCallbacks: ((message: IncomingMessage) => void)[] = [];
  
  // URL du serveur Baileys local
  private readonly BAILEYS_URL = process.env.NEXT_PUBLIC_BAILEYS_URL || 'http://localhost:3001';
  private readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Connexion WebSocket
  connect(tenantId: string) {
    if (this.socket?.connected) return;

    this.socket = io(this.BAILEYS_URL, {
      transports: ['websocket'],
      query: { tenantId }
    });

    // Événements WebSocket
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connecté');
      this.checkStatus();
    });

    this.socket.on(`qr_${tenantId}`, (data: { qr: string }) => {
      this.notifyStatus({
        connected: false,
        number: null,
        qrCode: data.qr,
        loading: false,
        error: null
      });
    });

    this.socket.on(`connected_${tenantId}`, (data: { number: string }) => {
      this.notifyStatus({
        connected: true,
        number: data.number,
        qrCode: null,
        loading: false,
        error: null
      });
    });

    this.socket.on('new_message', (message: IncomingMessage) => {
      // Analyser l'intention d'achat
      message.intent = this.analyzeIntent(message.message);
      this.notifyMessage(message);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket déconnecté');
      this.notifyStatus({
        connected: false,
        number: null,
        qrCode: null,
        loading: false,
        error: 'Connexion perdue'
      });
    });
  }

  // Déconnexion
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // API REST pour connexion WhatsApp
  async connectWhatsApp(tenantId: string): Promise<WhatsAppStatus> {
    try {
      const response = await fetch(`${this.API_URL}/api/whatsapp/connect/${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: `${this.API_URL}/webhook/whalix`
        })
      });

      const data = await response.json();
      
      if (data.status === 'qr_generated') {
        return {
          connected: false,
          number: null,
          qrCode: data.qr,
          loading: false,
          error: null
        };
      } else if (data.status === 'connected') {
        return {
          connected: true,
          number: data.number,
          qrCode: null,
          loading: false,
          error: null
        };
      }

      throw new Error(data.message || 'Erreur connexion');
    } catch (error) {
      return {
        connected: false,
        number: null,
        qrCode: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  // Vérifier le statut
  async checkStatus(): Promise<WhatsAppStatus> {
    try {
      const response = await fetch(`${this.API_URL}/status`);
      const data = await response.json();

      const status: WhatsAppStatus = {
        connected: data.connected,
        number: data.number,
        qrCode: null,
        loading: false,
        error: null
      };

      this.notifyStatus(status);
      return status;
    } catch (error) {
      const status: WhatsAppStatus = {
        connected: false,
        number: null,
        qrCode: null,
        loading: false,
        error: 'Serveur non disponible'
      };
      
      this.notifyStatus(status);
      return status;
    }
  }

  // Envoyer un message
  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message })
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur envoi message:', error);
      return false;
    }
  }

  // Analyser l'intention d'achat (côté client pour réactivité)
  private analyzeIntent(message: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    const msg = message.toLowerCase();
    
    const highIntent = ['acheter', 'commander', 'prendre', 'veux', 'prix', 'combien'];
    const mediumIntent = ['intéressé', 'peut-être', 'j\'aime', 'pourquoi'];
    
    if (highIntent.some(word => msg.includes(word))) return 'HIGH';
    if (mediumIntent.some(word => msg.includes(word))) return 'MEDIUM';
    return 'LOW';
  }

  // Gestion des callbacks
  onStatusChange(callback: (status: WhatsAppStatus) => void) {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  onMessage(callback: (message: IncomingMessage) => void) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyStatus(status: WhatsAppStatus) {
    this.statusCallbacks.forEach(cb => cb(status));
  }

  private notifyMessage(message: IncomingMessage) {
    this.messageCallbacks.forEach(cb => cb(message));
  }
}

// Singleton
const baileysService = new BaileysService();
export default baileysService;