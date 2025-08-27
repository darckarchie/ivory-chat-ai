import { useState, useEffect, useCallback } from 'react';

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
      
      // Étape 2: Appeler l'API Green API pour obtenir le QR code
      const response = await fetch(`https://7105.api.green-api.com/waInstance7105309758/qr/a7cfa2ce030c4a6188859f93100b96ecac0137473a3044bfbb`);
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.type === 'qrCode' && data.message) {
        // QR Code reçu avec succès
        setSession({
          restaurantId,
          status: 'qr_pending',
          qrCode: data.message // URL de l'image QR code
        });
        
        // Commencer à vérifier le statut de connexion
        startStatusPolling();
      } else {
        throw new Error('Format de réponse QR invalide');
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
        const response = await fetch(`https://7105.api.green-api.com/waInstance7105309758/getStateInstance/a7cfa2ce030c4a6188859f93100b96ecac0137473a3044bfbb`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.stateInstance === 'authorized') {
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
          } else if (data.stateInstance === 'blocked') {
            setSession({
              restaurantId,
              status: 'error',
              error: 'Compte WhatsApp bloqué'
            });
            return true;
          }
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
      // Appeler l'API de déconnexion Green API
      await fetch(`https://7105.api.green-api.com/waInstance7105309758/logout/a7cfa2ce030c4a6188859f93100b96ecac0137473a3044bfbb`);
      
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