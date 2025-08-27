import { useState, useEffect, useCallback } from 'react';
import { greenAPIService } from '@/lib/services/green-api-service';

export interface GreenAPISession {
  status: 'idle' | 'connecting' | 'qr_pending' | 'connected' | 'disconnected' | 'error';
  qrCode?: string;
  phoneNumber?: string;
  lastConnected?: Date;
  error?: string;
}

export function useGreenAPI() {
  const [session, setSession] = useState<GreenAPISession>({ status: 'idle' });
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  // Vérifier le statut de connexion
  const checkStatus = useCallback(async () => {
    try {
      const status = await greenAPIService.getConnectionStatus();
      
      if (status.status === 'connected') {
        setSession({
          status: 'connected',
          phoneNumber: status.phoneNumber,
          lastConnected: new Date()
        });
      } else if (status.status === 'disconnected') {
        setSession({ status: 'disconnected' });
      } else {
        setSession({ status: 'connecting' });
      }
    } catch (error) {
      setSession({ 
        status: 'error', 
        error: 'Erreur de vérification du statut' 
      });
    }
  }, []);

  // Générer un QR code
  const generateQR = useCallback(async () => {
    setIsLoading(true);
    try {
      setSession({ status: 'connecting' });
      
      const qrData = await greenAPIService.getQRCode();
      
      setSession({
        status: 'qr_pending',
        qrCode: qrData.qr
      });
    } catch (error) {
      setSession({ 
        status: 'error', 
        error: 'Impossible de générer le QR code' 
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Déconnecter WhatsApp
  const disconnect = useCallback(async () => {
    setIsLoading(true);
    try {
      await greenAPIService.logout();
      setSession({ status: 'disconnected' });
    } catch (error) {
      setSession({ 
        status: 'error', 
        error: 'Erreur de déconnexion' 
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Envoyer un message de test
  const sendTestMessage = useCallback(async (to: string, message: string) => {
    try {
      await greenAPIService.sendMessage(to, message);
      return true;
    } catch (error) {
      throw new Error('Impossible d\'envoyer le message');
    }
  }, []);

  // Récupérer les messages entrants
  const fetchMessages = useCallback(async () => {
    try {
      const incomingMessages = await greenAPIService.getIncomingMessages();
      
      if (incomingMessages.length > 0) {
        // Convertir au format LiveReply
        const newMessages = incomingMessages.map(msg => ({
          id: msg.id,
          at: new Date(msg.timestamp * 1000).toISOString(),
          customer: msg.pushName || 'Client',
          customer_phone: msg.from,
          last_message: msg.text,
          status: 'waiting' as const,
          confidence: 0
        }));

        // Ajouter aux messages existants
        setMessages(prev => {
          const existing = prev.map(m => m.id);
          const filtered = newMessages.filter(m => !existing.includes(m.id));
          return [...filtered, ...prev].slice(0, 20);
        });

        // Traiter avec l'IA
        for (const msg of incomingMessages) {
          if (msg.text) {
            await this.processMessageWithAI(msg);
          }
        }
      }
    } catch (error) {
      console.error('Erreur récupération messages:', error);
    }
  }, []);

  // Traiter un message avec l'IA
  const processMessageWithAI = async (message: any) => {
    try {
      // Récupérer la base de connaissances
      const kbItems = JSON.parse(localStorage.getItem('whalix_kb_items') || '[]');
      
      // Générer la réponse IA
      const aiResponse = await greenAPIService.generateAIResponse(message.text, kbItems);
      
      if (aiResponse.shouldReply) {
        // Délai aléatoire pour paraître humain (1-3 secondes)
        const delay = Math.random() * 2000 + 1000;
        
        setTimeout(async () => {
          try {
            await greenAPIService.sendMessage(message.from, aiResponse.message);
            
            // Mettre à jour le statut du message
            setMessages(prev => prev.map(m => 
              m.id === message.id 
                ? { ...m, status: 'ai_replied', reply_preview: aiResponse.message, confidence: aiResponse.confidence }
                : m
            ));
          } catch (error) {
            console.error('Erreur envoi réponse IA:', error);
          }
        }, delay);
      }
    } catch (error) {
      console.error('Erreur traitement IA:', error);
    }
  };

  // Polling pour vérifier les nouveaux messages
  useEffect(() => {
    if (session.status === 'connected') {
      const interval = setInterval(fetchMessages, 5000); // Toutes les 5 secondes
      return () => clearInterval(interval);
    }
  }, [session.status, fetchMessages]);

  // Polling pour vérifier le statut de connexion
  useEffect(() => {
    if (session.status === 'qr_pending') {
      const interval = setInterval(checkStatus, 3000); // Toutes les 3 secondes
      return () => clearInterval(interval);
    }
  }, [session.status, checkStatus]);

  // Vérification initiale du statut
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    session,
    isLoading,
    messages,
    generateQR,
    disconnect,
    sendTestMessage,
    checkStatus,
    isConnected: session.status === 'connected',
    hasQR: session.status === 'qr_pending' && !!session.qrCode
  };
}