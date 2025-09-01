// Service API simple pour QR code WhatsApp
// Utilise directement l'API http://72.60.80.2:3000

const API_URL = 'http://72.60.80.2:3000';

export class SimpleAPIService {
  
  // Vérifier si l'API est disponible
  async checkHealth() {
    try {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API disponible:', data);
        return { available: true, data };
      } else {
        console.warn('⚠️ API non disponible:', response.status);
        return { available: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.warn('⚠️ API non accessible:', error);
      return { available: false, error: 'Connexion impossible' };
    }
  }

  // Créer une session et obtenir le QR code
  async createSession(sessionId: string) {
    try {
      console.log(`🔗 Création session: ${sessionId}`);
      
      const response = await fetch(`${API_URL}/api/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      console.log('📱 Réponse API:', data);

      return {
        success: true,
        status: data.status,
        qrCode: data.qrCode,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Erreur création session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  // Vérifier le statut d'une session
  async getSessionStatus(sessionId: string) {
    try {
      const response = await fetch(`${API_URL}/api/session/${sessionId}/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📊 Status ${sessionId}:`, data);

      return {
        success: true,
        status: data.status,
        phoneNumber: data.phoneNumber,
        qrCode: data.qrCode,
        messageCount: data.messageCount
      };
    } catch (error) {
      console.error('❌ Erreur status session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  // Déconnecter une session
  async disconnectSession(sessionId: string) {
    try {
      const response = await fetch(`${API_URL}/api/session/${sessionId}/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      console.log(`🔴 Déconnexion ${sessionId}:`, data);

      return {
        success: true,
        status: 'disconnected'
      };
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  // Envoyer un message de test
  async sendTestMessage(sessionId: string, to: string, message: string) {
    try {
      const response = await fetch(`${API_URL}/api/session/${sessionId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message })
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      console.log('📤 Message envoyé:', data);

      return {
        success: true,
        messageId: data.messageId
      };
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  // Récupérer les conversations
  async getConversations() {
    try {
      const response = await fetch(`${API_URL}/api/conversations`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      console.log('💬 Conversations:', data);

      return {
        success: true,
        conversations: data.conversations || []
      };
    } catch (error) {
      console.error('❌ Erreur conversations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        conversations: []
      };
    }
  }

  // Polling automatique du statut
  startStatusPolling(sessionId: string, callback: (status: any) => void, interval = 3000) {
    const poll = async () => {
      const result = await this.getSessionStatus(sessionId);
      if (result.success) {
        callback(result);
      }
    };

    poll(); // Appel initial
    const intervalId = setInterval(poll, interval);
    
    return () => clearInterval(intervalId);
  }
}

// Instance singleton
export const simpleAPI = new SimpleAPIService();