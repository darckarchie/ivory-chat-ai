import { useState, useEffect, useCallback } from 'react';
import { whatsappService, WhatsAppSession } from '@/lib/services/whatsapp-service';

export function useWhatsAppConnection(restaurantId: string) {
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier le statut actuel
    const currentSession = whatsappService.getSession(restaurantId);
    if (currentSession) {
      setSession(currentSession);
    }

    // S'abonner aux mises à jour
    const unsubscribe = whatsappService.onSessionUpdate(restaurantId, (updatedSession) => {
      setSession(updatedSession);
      setError(null);
      
      if (updatedSession.status === 'error') {
        setError(updatedSession.error || 'Erreur de connexion');
      }
      
      if (updatedSession.status === 'connected' || updatedSession.status === 'disconnected') {
        setIsConnecting(false);
      }
    });

    // S'abonner aux messages entrants
    const unsubscribeMessages = whatsappService.onMessageReceived(restaurantId, (message) => {
      console.log('📨 Nouveau message dans le hook:', message);
      // Le message est déjà sauvegardé dans localStorage par le service
    });

    return () => {
      unsubscribe();
      unsubscribeMessages();
    };
  }, [restaurantId]);

  const connect = useCallback(async (webhookUrl?: string) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const newSession = await whatsappService.connectWhatsApp(restaurantId, webhookUrl);
      setSession(newSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
      setIsConnecting(false);
    } finally {
      setIsConnecting(false);
    }
  }, [restaurantId]);

  const disconnect = useCallback(async () => {
    setIsConnecting(true);
    try {
      await whatsappService.disconnectWhatsApp(restaurantId);
      setSession(prev => prev ? { ...prev, status: 'disconnected' } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de déconnexion');
    } finally {
      setIsConnecting(false);
    }
  }, [restaurantId]);

  const sendTestMessage = useCallback(async (to: string, message: string) => {
    try {
      await whatsappService.sendTestMessage(restaurantId, to, message);
    } catch (err) {
      throw err;
    }
  }, [restaurantId]);
  const isConnected = session?.status === 'connected';
  const hasQR = session?.status === 'qr_pending' && !!session.qrCode;
  const isLoading = isConnecting || session?.status === 'connecting' || session?.status === 'qr_pending';

  return {
    session,
    isConnected,
    hasQR,
    isLoading,
    error,
    connect,
    disconnect,
    sendTestMessage: whatsappService.sendTestMessage ? sendTestMessage : undefined
  };
}