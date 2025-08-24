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
    });

    return unsubscribe;
  }, [restaurantId]);

  const connect = useCallback(async (webhookUrl?: string) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const newSession = await whatsappService.connectWhatsApp(restaurantId, webhookUrl);
      setSession(newSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setIsConnecting(false);
    }
  }, [restaurantId]);

  const disconnect = useCallback(async () => {
    try {
      await whatsappService.disconnectWhatsApp(restaurantId);
      setSession(prev => prev ? { ...prev, status: 'disconnected' } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de déconnexion');
    }
  }, [restaurantId]);

  const isConnected = session?.status === 'connected';
  const hasQR = session?.status === 'qr_pending' && !!session.qrCode;
  const isLoading = isConnecting || session?.status === 'connecting';

  return {
    session,
    isConnected,
    hasQR,
    isLoading,
    error,
    connect,
    disconnect
  };
}