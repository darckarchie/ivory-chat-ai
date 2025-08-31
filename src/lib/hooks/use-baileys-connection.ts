import { useState, useEffect, useCallback } from 'react';
// import { baileysService, BaileysSession } from '@/lib/services/baileys-integration';

export interface BaileysSession {
  restaurantId: string;
  status: 'idle' | 'connecting' | 'qr_pending' | 'connected' | 'disconnected' | 'error';
  qrCode?: string;
  lastConnected?: Date;
  phoneNumber?: string;
  error?: string;
  messageCount?: number;
}

export function useBaileysConnection(restaurantId: string) {
  const [session, setSession] = useState<BaileysSession>({ restaurantId, status: 'idle' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const BACKEND_URL = 'https://whalix-server-railway-production.up.railway.app';

  // Vérifier la santé du serveur
  const checkServerHealth = async () => {
    console.log('🏥 [DEBUG] Vérification santé serveur...');
    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('🏥 [DEBUG] Health response:', response.status, response.ok);
      return response.ok;
      console.log('🏥 [DEBUG] Health check response:', response.status, response.ok);
    } catch (error) {
      console.warn('⚠️ [DEBUG] Baileys server unavailable:', error);
      return false;
    }
  };

  // Créer une session WhatsApp
  const createSession = async () => {
    console.log('🔗 [DEBUG] Creating session for:', restaurantId);
    setIsLoading(true);
    setError(null);
    
    try {
      setSession(prev => ({ ...prev, status: 'connecting' }));
      
      console.log('📡 [DEBUG] Sending request to:', `${BACKEND_URL}/api/whatsapp/connect/${restaurantId}`);
      const response = await fetch(`${BACKEND_URL}/api/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId })
      });
      
      console.log('📡 [DEBUG] Response status:', response.status, response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [DEBUG] Error response:', errorText);
        throw new Error(`Erreur serveur: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📡 [DEBUG] Complete server response:', JSON.stringify(data, null, 2));
      
      // Adapter la réponse selon la structure du serveur
      const adaptedSession: BaileysSession = {
        restaurantId,
        status: data.status === 'qr_pending' ? 'qr_pending' :
                data.status === 'qr_generated' ? 'qr_pending' : 
                data.status === 'connected' ? 'connected' : 
                data.status === 'authorized' ? 'connected' : 'connecting',
        qrCode: data.qr || data.qrCode || data.message,
        phoneNumber: data.phoneNumber,
        error: data.error
      };
      
      console.log('📊 [DEBUG] Adapted session:', JSON.stringify(adaptedSession, null, 2));
      console.log('🔍 [DEBUG] QR Code found:', !!adaptedSession.qrCode);
      console.log('🔍 [DEBUG] QR Code value:', adaptedSession.qrCode);
      console.log('🔍 [DEBUG] Final status:', adaptedSession.status);
      console.log('🔍 [DEBUG] Original server status:', data.status);
      
      setSession(adaptedSession);
      
      // Si QR généré, simuler une connexion après 10 secondes pour la démo
      if (adaptedSession.status === 'qr_pending') {
        console.log('⏰ [DEBUG] Simulating connection in 10 seconds...');
        setTimeout(() => {
          console.log('✅ [DEBUG] Simulated connection successful');
          setSession(prev => ({
            ...prev,
            status: 'connected',
            phoneNumber: '+225 07 00 00 00 01',
            lastConnected: new Date(),
            qrCode: undefined
          }));
        }, 10000);
      }
      
    } catch (error) {
      console.error('❌ [DEBUG] Session creation error:', error);
      setError(error instanceof Error ? error.message : 'Erreur de connexion');
      setSession(prev => ({ 
        ...prev, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Erreur de connexion' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Connecter WhatsApp
  const connect = useCallback(async () => {
    console.log('🔗 [DEBUG] Connect function called');
    
    // Vérifier la santé du serveur d'abord
    const isHealthy = await checkServerHealth();
    if (!isHealthy) {
      console.error('❌ [DEBUG] Serveur backend indisponible');
      setError('Serveur backend indisponible');
      return;
    }
    
    await createSession();
  }, [restaurantId]);

  // Déconnecter WhatsApp
  const disconnect = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/whatsapp/disconnect/${restaurantId}`, {
        method: 'POST'
      });

      if (response.ok) {
        setSession(prev => ({
          ...prev,
          status: 'disconnected',
          qrCode: undefined
        }));
      }
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  // Envoyer un message de test
  const sendTestMessage = useCallback(async (to: string, message: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/whatsapp/send/${restaurantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message })
      });
      const data = await response.json();
      return data.status === 'sent';
    } catch (error) {
      console.error('❌ Erreur envoi message test:', error);
      return false;
    }
  }, [restaurantId]);

  // Vérifier le statut initial
  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/whatsapp/status/${restaurantId}`);
        if (response.ok) {
          const data = await response.json();
          setSession(prev => ({
            ...prev,
            status: data.status,
            qrCode: data.qr,
            phoneNumber: data.phoneNumber,
            lastConnected: data.lastConnected ? new Date(data.lastConnected) : undefined
          }));
        }
      } catch (error) {
        console.warn('⚠️ Impossible de vérifier le statut initial');
      }
    };
    
    checkInitialStatus();
  }, [restaurantId]);

  return {
    session,
    isConnected: session.status === 'connected',
    hasQR: session.status === 'qr_pending' && !!session.qrCode,
    isLoading,
    error,
    connect,
    disconnect,
    sendTestMessage
  };
}