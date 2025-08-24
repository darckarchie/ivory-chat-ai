import { io, Socket } from 'socket.io-client';

export interface WhatsAppSession {
  restaurantId: string;
  status: 'idle' | 'connecting' | 'qr_pending' | 'connected' | 'disconnected' | 'error';
  qrCode?: string;
  lastConnected?: Date;
  phoneNumber?: string;
  error?: string;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  pushName?: string;
  text: string;
  timestamp: number;
  restaurantId: string;
}

class WhatsAppService {
  private socket: Socket | null = null;
  private sessions = new Map<string, WhatsAppSession>();
  private listeners = new Map<string, (session: WhatsAppSession) => void>();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    // En mode démo, simuler les événements
    if (typeof window !== 'undefined') {
      // Simuler la connexion socket pour le mode démo
      this.socket = {
        emit: (event: string, data: any) => {
          console.log('Socket emit:', event, data);
        },
        on: (event: string, callback: Function) => {
          console.log('Socket on:', event);
        },
        disconnect: () => {
          console.log('Socket disconnect');
        }
      } as any;
    }
  }

  async connectWhatsApp(restaurantId: string, webhookUrl?: string): Promise<WhatsAppSession> {
    const session: WhatsAppSession = {
      restaurantId,
      status: 'connecting'
    };

    this.sessions.set(restaurantId, session);
    this.notifyListeners(restaurantId, session);

    try {
      // En mode démo, simuler la génération du QR code
      if (restaurantId === 'demo') {
        return this.simulateDemoConnection(restaurantId);
      }

      // Vraie implémentation avec l'API backend
      const response = await fetch(`/api/whatsapp/connect/${restaurantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl })
      });

      const data = await response.json();

      if (data.status === 'qr_generated') {
        session.status = 'qr_pending';
        session.qrCode = data.qr;
      } else if (data.status === 'already_connected') {
        session.status = 'connected';
        session.lastConnected = new Date();
      }

      this.sessions.set(restaurantId, session);
      this.notifyListeners(restaurantId, session);

      return session;
    } catch (error) {
      session.status = 'error';
      session.error = 'Erreur de connexion au service WhatsApp';
      this.sessions.set(restaurantId, session);
      this.notifyListeners(restaurantId, session);
      throw error;
    }
  }

  private async simulateDemoConnection(restaurantId: string): Promise<WhatsAppSession> {
    const session = this.sessions.get(restaurantId)!;

    // Simuler la génération du QR code
    setTimeout(() => {
      session.status = 'qr_pending';
      session.qrCode = this.generateDemoQR();
      this.sessions.set(restaurantId, session);
      this.notifyListeners(restaurantId, session);

      // Simuler la connexion après 10 secondes
      setTimeout(() => {
        session.status = 'connected';
        session.lastConnected = new Date();
        session.phoneNumber = '+225 07 00 00 00 01';
        session.qrCode = undefined;
        this.sessions.set(restaurantId, session);
        this.notifyListeners(restaurantId, session);

        // Simuler des messages entrants
        this.startDemoMessageSimulation(restaurantId);
      }, 10000);
    }, 2000);

    return session;
  }

  private generateDemoQR(): string {
    // Générer un QR code de démo
    const demoData = `whalix-demo-${Date.now()}`;
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12">
          QR Code Démo
        </text>
        <text x="100" y="120" text-anchor="middle" font-family="Arial" font-size="10">
          Scannez pour connecter
        </text>
      </svg>
    `)}`;
  }

  private startDemoMessageSimulation(restaurantId: string) {
    const demoMessages = [
      { from: 'Kouamé', text: 'Bonjour, vous êtes ouverts ?' },
      { from: 'Aminata', text: 'Prix du menu du jour ?' },
      { from: 'Yao', text: 'Vous livrez à Cocody ?' },
      { from: 'Fatou', text: 'Je peux commander ?' }
    ];

    let messageIndex = 0;
    const interval = setInterval(() => {
      if (messageIndex >= demoMessages.length) {
        clearInterval(interval);
        return;
      }

      const msg = demoMessages[messageIndex];
      const message: WhatsAppMessage = {
        id: `demo_msg_${Date.now()}`,
        from: `+22507000000${messageIndex + 1}`,
        pushName: msg.from,
        text: msg.text,
        timestamp: Date.now(),
        restaurantId
      };

      // Simuler la réception du message
      this.handleIncomingMessage(message);
      messageIndex++;
    }, 15000); // Un message toutes les 15 secondes
  }

  private async handleIncomingMessage(message: WhatsAppMessage) {
    // Ajouter le message au feed local
    const existingMessages = JSON.parse(localStorage.getItem('whalix_live_messages') || '[]');
    const newLiveMessage = {
      id: message.id,
      at: new Date(message.timestamp).toISOString(),
      customer: message.pushName || 'Client',
      customer_phone: message.from,
      last_message: message.text,
      status: 'waiting' as const,
      confidence: 0
    };

    const updatedMessages = [newLiveMessage, ...existingMessages].slice(0, 20);
    localStorage.setItem('whalix_live_messages', JSON.stringify(updatedMessages));

    // Générer une réponse IA (simulation)
    setTimeout(async () => {
      const aiResponse = await this.generateAIResponse(message.text, message.restaurantId);
      
      if (aiResponse.shouldReply) {
        // Marquer comme répondu par l'IA
        const messages = JSON.parse(localStorage.getItem('whalix_live_messages') || '[]');
        const updated = messages.map((msg: any) => 
          msg.id === message.id 
            ? { ...msg, status: 'ai_replied', reply_preview: aiResponse.message, confidence: aiResponse.confidence }
            : msg
        );
        localStorage.setItem('whalix_live_messages', JSON.stringify(updated));
      }
    }, 3000); // Réponse après 3 secondes
  }

  private async generateAIResponse(text: string, restaurantId: string) {
    // Logique IA simplifiée pour la démo
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('bonjour') || lowerText.includes('salut')) {
      return {
        message: 'Bonjour ! Bienvenue chez nous. Comment puis-je vous aider ?',
        confidence: 0.95,
        shouldReply: true
      };
    }
    
    if (lowerText.includes('prix') || lowerText.includes('menu')) {
      return {
        message: 'Voici notre menu du jour :\n• Attiéké poisson - 2500 FCFA\n• Alloco poulet - 2000 FCFA\n• Garba - 1000 FCFA',
        confidence: 0.90,
        shouldReply: true
      };
    }
    
    if (lowerText.includes('ouvert') || lowerText.includes('horaire')) {
      return {
        message: 'Nous sommes ouverts de 8h à 22h, du lundi au samedi. Dimanche : 10h-20h',
        confidence: 0.95,
        shouldReply: true
      };
    }
    
    if (lowerText.includes('livr')) {
      return {
        message: 'Oui, nous livrons dans un rayon de 5km. Frais de livraison : 1000 FCFA. Délai : 30-45 min.',
        confidence: 0.90,
        shouldReply: true
      };
    }
    
    return {
      message: 'Merci pour votre message. Un de nos agents va vous répondre rapidement.',
      confidence: 0.60,
      shouldReply: true
    };
  }

  async disconnectWhatsApp(restaurantId: string): Promise<void> {
    try {
      if (restaurantId === 'demo') {
        const session = this.sessions.get(restaurantId);
        if (session) {
          session.status = 'disconnected';
          session.qrCode = undefined;
          this.sessions.set(restaurantId, session);
          this.notifyListeners(restaurantId, session);
        }
        return;
      }

      await fetch(`/api/whatsapp/disconnect/${restaurantId}`, {
        method: 'POST'
      });

      const session = this.sessions.get(restaurantId);
      if (session) {
        session.status = 'disconnected';
        session.qrCode = undefined;
        this.sessions.set(restaurantId, session);
        this.notifyListeners(restaurantId, session);
      }
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      throw error;
    }
  }

  getSession(restaurantId: string): WhatsAppSession | null {
    return this.sessions.get(restaurantId) || null;
  }

  onSessionUpdate(restaurantId: string, callback: (session: WhatsAppSession) => void) {
    this.listeners.set(restaurantId, callback);
    
    // Retourner une fonction de cleanup
    return () => {
      this.listeners.delete(restaurantId);
    };
  }

  private notifyListeners(restaurantId: string, session: WhatsAppSession) {
    const listener = this.listeners.get(restaurantId);
    if (listener) {
      listener(session);
    }
  }
}

export const whatsappService = new WhatsAppService();