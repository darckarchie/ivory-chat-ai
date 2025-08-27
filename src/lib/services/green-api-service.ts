import QRCode from 'qrcode';

// Service pour l'intégration Green API WhatsApp
class GreenAPIService {
  private instance: string;
  private token: string;
  private baseUrl: string;

  constructor() {
    this.instance = import.meta.env.VITE_GREEN_API_INSTANCE || '';
    this.token = import.meta.env.VITE_GREEN_API_TOKEN || '';
    this.baseUrl = import.meta.env.VITE_GREEN_API_BASE_URL || 'https://api.green-api.com';
  }

  private getApiUrl(method: string): string {
    return `${this.baseUrl}/waInstance${this.instance}/${method}/${this.token}`;
  }

  // Obtenir le QR code pour la connexion
  async getQRCode(): Promise<{ qr: string; status: string }> {
    try {
      const response = await fetch(this.getApiUrl('qr'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Green API HTTP Error:', response.status, errorText);
        throw new Error(`Erreur API Green (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      // Vérifier si la réponse contient une erreur
      if (data.error || data.message?.includes('error') || data.message?.includes('Error')) {
        console.error('Green API Error Response:', data);
        throw new Error(`Erreur Green API: ${data.error || data.message}`);
      }
      
      // Récupérer le contenu du QR code
      const qrContent = data.message || data.qr || data.qrCode;
      
      if (!qrContent) {
        console.error('No QR content in response:', data);
        throw new Error('Aucun QR code reçu de Green API');
      }
      
      // Vérifier si c'est déjà une image base64
      if (qrContent.startsWith('data:image/')) {
        return {
          qr: qrContent,
          status: 'qr_generated'
        };
      }
      
      // Vérifier si c'est une image base64 sans préfixe
      if (qrContent.startsWith('iVBORw0KGgoAAA')) {
        return {
          qr: `data:image/png;base64,${qrContent}`,
          status: 'qr_generated'
        };
      }
      
      // Valider la longueur du contenu avant génération QR
      if (qrContent.length > 2000) {
        console.error('QR content too long:', qrContent.length, 'characters');
        console.error('Content preview:', qrContent.substring(0, 200) + '...');
        throw new Error('Contenu QR trop volumineux pour être encodé');
      }
      
      // Convertir le contenu en QR code image
      const qrDataUri = await QRCode.toDataURL(qrContent, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return {
        qr: qrDataUri,
        status: 'qr_generated'
      };
    } catch (error) {
      console.error('Erreur récupération QR Code:', error);
      
      // Si c'est une erreur de QR code trop volumineux, on la propage
      if (error instanceof Error && error.message.includes('too big')) {
        throw new Error('Données trop volumineuses pour le QR code');
      }
      
      // Pour les autres erreurs, on donne plus de détails
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Impossible de générer le QR code: ${errorMessage}`);
    }
  }

  // Vérifier le statut de la connexion
  async getConnectionStatus(): Promise<{ status: string; phoneNumber?: string }> {
    try {
      const response = await fetch(this.getApiUrl('getStateInstance'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.stateInstance === 'authorized') {
        // Récupérer les infos du compte
        const accountInfo = await this.getAccountInfo();
        return {
          status: 'connected',
          phoneNumber: accountInfo.wid
        };
      } else if (data.stateInstance === 'notAuthorized') {
        return { status: 'disconnected' };
      } else {
        return { status: 'connecting' };
      }
    } catch (error) {
      console.error('Erreur vérification statut:', error);
      return { status: 'error' };
    }
  }

  // Obtenir les informations du compte
  async getAccountInfo(): Promise<{ wid: string; name: string }> {
    try {
      const response = await fetch(this.getApiUrl('getSettings'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        wid: data.wid || 'Inconnu',
        name: data.name || 'WhatsApp Business'
      };
    } catch (error) {
      console.error('Erreur récupération infos compte:', error);
      return { wid: 'Inconnu', name: 'WhatsApp Business' };
    }
  }

  // Envoyer un message
  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      // Nettoyer le numéro de téléphone
      const cleanTo = to.replace(/[^\d]/g, '');
      const chatId = `${cleanTo}@c.us`;

      const response = await fetch(this.getApiUrl('sendMessage'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chatId,
          message: message
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.idMessage ? true : false;
    } catch (error) {
      console.error('Erreur envoi message:', error);
      throw new Error('Impossible d\'envoyer le message');
    }
  }

  // Récupérer les messages entrants
  async getIncomingMessages(): Promise<any[]> {
    try {
      const response = await fetch(this.getApiUrl('receiveNotification'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      // Filtrer les messages texte entrants
      if (data.body && data.body.typeWebhook === 'incomingMessageReceived') {
        return [{
          id: data.body.idMessage,
          from: data.body.senderData.sender,
          pushName: data.body.senderData.senderName,
          text: data.body.messageData.textMessageData?.textMessage || '',
          timestamp: data.body.timestamp,
          type: data.body.messageData.typeMessage
        }];
      }

      return [];
    } catch (error) {
      console.error('Erreur récupération messages:', error);
      return [];
    }
  }

  // Supprimer la notification (marquer comme lue)
  async deleteNotification(receiptId: string): Promise<boolean> {
    try {
      const response = await fetch(this.getApiUrl('deleteNotification'), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiptId: receiptId
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur suppression notification:', error);
      return false;
    }
  }

  // Déconnecter WhatsApp
  async logout(): Promise<boolean> {
    try {
      const response = await fetch(this.getApiUrl('logout'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      return false;
    }
  }

  // Générer une réponse IA basée sur le message
  async generateAIResponse(message: string, kbItems: any[] = []): Promise<{
    message: string;
    confidence: number;
    shouldReply: boolean;
  }> {
    const lowerMessage = message.toLowerCase();
    
    // Salutations
    if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('bsr')) {
      return {
        message: 'Bonjour ! 👋 Bienvenue chez nous. Comment puis-je vous aider aujourd\'hui ?',
        confidence: 0.95,
        shouldReply: true
      };
    }
    
    // Prix et menu
    if (lowerMessage.includes('prix') || lowerMessage.includes('menu') || lowerMessage.includes('carte')) {
      if (kbItems.length > 0) {
        let response = '📋 NOTRE MENU :\n\n';
        kbItems.slice(0, 5).forEach((item, idx) => {
          response += `${idx + 1}. ${item.name} - ${item.price.toLocaleString()} FCFA\n`;
        });
        response += '\nPour commander, envoyez le numéro du plat ! 😊';
        
        return {
          message: response,
          confidence: 0.90,
          shouldReply: true
        };
      }
    }
    
    // Horaires
    if (lowerMessage.includes('ouvert') || lowerMessage.includes('horaire') || lowerMessage.includes('fermé')) {
      return {
        message: '🕐 HORAIRES D\'OUVERTURE :\n\n📍 Lundi - Samedi : 8h - 22h\n📍 Dimanche : 10h - 20h\n\nNous sommes actuellement ouverts ! 😊',
        confidence: 0.95,
        shouldReply: true
      };
    }
    
    // Livraison
    if (lowerMessage.includes('livr') || lowerMessage.includes('command')) {
      return {
        message: '🚗 LIVRAISON DISPONIBLE !\n\n✅ Zone : 5km autour du restaurant\n⏱️ Délai : 30-45 minutes\n💵 Frais : 1000 FCFA\n\nQue souhaitez-vous commander ?',
        confidence: 0.90,
        shouldReply: true
      };
    }
    
    // Disponibilité
    if (lowerMessage.includes('dispo') || lowerMessage.includes('stock') || lowerMessage.includes('reste')) {
      return {
        message: '✅ Oui, nous avons tout en stock aujourd\'hui ! Que souhaitez-vous commander ?',
        confidence: 0.85,
        shouldReply: true
      };
    }
    
    // Réponse par défaut
    return {
      message: 'Merci pour votre message ! 😊 Un de nos agents va vous répondre rapidement. En attendant, vous pouvez consulter notre menu ou nos horaires.',
      confidence: 0.60,
      shouldReply: true
    };
  }
}

export const greenAPIService = new GreenAPIService();