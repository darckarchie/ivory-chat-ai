import { useState, useEffect, useCallback } from 'react';
import { baileysService, BaileysSession } from '@/lib/services/baileys-integration';

export function useBaileysConnection(restaurantId: string) {
  const [session, setSession] = useState<BaileysSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connecter WhatsApp via Baileys
  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🔗 Connexion Baileys pour ${restaurantId}`);
      const newSession = await baileysService.connectWhatsApp(restaurantId);
      setSession(newSession);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      console.error('❌ Erreur connexion Baileys:', err);
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  // Déconnecter WhatsApp
  const disconnect = useCallback(async () => {
    setIsLoading(true);
    try {
      await baileysService.disconnectWhatsApp(restaurantId);
      setSession(prev => prev ? { ...prev, status: 'disconnected' } : null);
    } catch (err) {
      console.error('❌ Erreur déconnexion:', err);
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  // Envoyer un message de test
  const sendTestMessage = useCallback(async (to: string, message: string) => {
    try {
      return await baileysService.sendTestMessage(restaurantId, to, message);
    } catch (err) {
      console.error('❌ Erreur envoi test:', err);
      return false;
    }
  }, [restaurantId]);

  // Vérifier le statut initial et s'abonner aux mises à jour
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const initializeConnection = async () => {
      try {
        // Vérifier le statut actuel
        const currentSession = await baileysService.getConnectionStatus(restaurantId);
        if (currentSession) {
          setSession(currentSession);
        }

        // S'abonner aux mises à jour de session
        cleanup = baileysService.onSessionUpdate(restaurantId, (updatedSession) => {
          console.log(`📡 Session mise à jour:`, updatedSession);
          setSession(updatedSession);
          
          // Effacer les erreurs si la connexion réussit
          if (updatedSession.status === 'connected') {
            setError(null);
          }
        });

      } catch (err) {
        console.error('❌ Erreur initialisation:', err);
        setError('Impossible de se connecter au serveur WhatsApp');
      }
    };

    initializeConnection();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [restaurantId]);

  // États dérivés
  const isConnected = session?.status === 'connected';
  const hasQR = session?.status === 'qr_pending' && !!session?.qrCode;
  const isConnecting = isLoading || session?.status === 'connecting';

  return {
    session,
    isConnected,
    hasQR,
    isLoading: isConnecting,
    error,
    connect,
    disconnect,
    sendTestMessage
  };
}