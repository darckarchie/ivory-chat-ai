import { useState, useEffect, useCallback } from 'react';
import { greenAPIService } from '../services/green-api-service';

export interface WhatsAppSession {
  restaurantId: string;
  status: 'idle' | 'connecting' | 'qr_pending' | 'connected' | 'disconnected' | 'error';
  qrCode?: string;
  lastConnected?: Date;
  phoneNumber?: string;
  error?: string;
  messageCount?: number;
}

export function useWhatsAppConnection(restaurantId: string) {
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Utiliser la vraie API Green API
  const connectWithGreenAPI = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Étape 1: Connexion en cours
      setSession({
        restaurantId,
        status: 'connecting'
      });
      
      // Étape 2: Utiliser le service Green API pour obtenir le QR code
      const qrData = await greenAPIService.getQRCode();
      
      if (qrData) {
        // QR Code reçu avec succès
        setSession({
          restaurantId,
          status: 'qr_pending',
          qrCode: qrData.qr // URL de l'image QR code
        });
        
        // Commencer à vérifier le statut de connexion
        startStatusPolling();
      } else {
        throw new Error('Impossible de générer le QR code');
      }
      
    } catch (err) {
      console.error('Erreur connexion Green API:', err);
      setError('Impossible de générer le QR code. Vérifiez votre connexion internet.');
      setSession({
        restaurantId,
        status: 'error',
        error: 'Erreur de connexion à Green API'
      });
    } finally {
      setIsConnecting(false);
    }
  }, [restaurantId]);

  // Vérifier le statut de connexion périodiquement
  const startStatusPolling = useCallback(() => {
    const checkStatus = async () => {
      try {
        const status = await greenAPIService.getConnectionStatus();
        
        if (status === 'authorized') {
          // WhatsApp connecté avec succès
          setSession({
            restaurantId,
            status: 'connected',
            phoneNumber: '+225 07 00 00 00 01', // Sera récupéré de l'API
            lastConnected: new Date(),
            messageCount: 0
          });
          
          // Arrêter le polling
          return true;
        } else if (status === 'blocked') {
          setSession({
            restaurantId,
            status: 'error',
            error: 'Compte WhatsApp bloqué'
          });
          return true;
        }
        
        return false; // Continuer le polling
      } catch (err) {
        console.error('Erreur vérification statut:', err);
        return false;
      }
    };
    
    // Vérifier toutes les 3 secondes pendant 2 minutes max
    let attempts = 0;
    const maxAttempts = 40; // 2 minutes
    
    const interval = setInterval(async () => {
      attempts++;
      const shouldStop = await checkStatus();
      
      if (shouldStop || attempts >= maxAttempts) {
        clearInterval(interval);
        
        if (attempts >= maxAttempts && session?.status === 'qr_pending') {
          setSession({
            restaurantId,
            status: 'error',
            error: 'Timeout - QR code expiré. Veuillez réessayer.'
          });
        }
      }
    }, 3000);
    
  }, [restaurantId, session?.status]);

  const connect = useCallback(async () => {
    await connectWithGreenAPI();
  }, [connectWithGreenAPI]);

  const disconnect = useCallback(async () => {
    try {
      // Utiliser le service Green API pour la déconnexion
      await greenAPIService.logout();
      
      setSession({
        restaurantId,
        status: 'disconnected'
      });
    } catch (err) {
      console.error('Erreur déconnexion:', err);
    }
  }, [restaurantId]);

  // Initialiser la session
  useEffect(() => {
    setSession({
      restaurantId,
      status: 'idle'
    });
  }, [restaurantId]);

  const isConnected = session?.status === 'connected';
  const hasQR = session?.status === 'qr_pending' && !!session?.qrCode;
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