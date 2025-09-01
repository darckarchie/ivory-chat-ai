import { useState, useEffect, useCallback } from 'react';
import { simpleAPI } from '@/lib/services/simple-api-demo';
import { useUserStore } from '@/lib/store';

export interface WhatsAppSessionState {
  id?: string;
  status: 'idle' | 'connecting' | 'qr_pending' | 'connected' | 'disconnected' | 'error';
  qrCode?: string;
  phoneNumber?: string;
  lastConnected?: Date;
  error?: string;
  messageCount?: number;
}

export function useWhatsAppSession() {
  const user = useUserStore(state => state.user);
  const [session, setSession] = useState<WhatsAppSessionState>({ status: 'idle' });
  const [isLoading, setIsLoading] = useState(false);

  // Charger la session existante
  const loadSession = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // SUPABASE DÉSACTIVÉ - Utiliser données démo
      console.log('🔄 Mode démo - Session WhatsApp simulée');
      return;
      
      // const currentUser = await supabaseService.getCurrentUser();
      // if (!currentUser) return;
      
      // const dbSession = await supabaseService.getWhatsAppSession(currentUser.tenant_id);
      
      // if (dbSession) {
      //   setSession({
      //     id: dbSession.id,
      //     status: dbSession.status,
      //     qrCode: dbSession.qr_code || undefined,
      //     phoneNumber: dbSession.phone_number || undefined,
      //     lastConnected: dbSession.last_seen_at ? new Date(dbSession.last_seen_at) : undefined,
      //     error: dbSession.last_error || undefined,
      //     messageCount: dbSession.message_count
      //   });
      // }
    } catch (error) {
      console.error('Erreur chargement session:', error);
    }
  }, [user?.id]);

  // Connecter WhatsApp
  const connect = useCallback(async () => {
    if (!user?.id) throw new Error('Utilisateur non connecté');
    
    setIsLoading(true);
    setSession({ status: 'connecting' });
    
    try {
      console.log('🔗 Début connexion WhatsApp via API...');
      
      // 1. Vérifier que l'API est disponible
      const health = await simpleAPI.checkHealth();
      if (!health.available) {
        throw new Error(`API non disponible: ${health.error}`);
      }
      
      console.log('✅ API disponible, création session...');
      
      // 2. Créer la session via l'API
      const sessionResult = await simpleAPI.createSession(user.id);
      
      if (!sessionResult.success) {
        throw new Error(sessionResult.error || 'Erreur création session');
      }
      
      console.log('📱 QR Code reçu de l\'API');
      
      // 3. Mettre à jour l'état avec le QR code de l'API
      setSession({
        status: sessionResult.status === 'qr_generated' ? 'qr_pending' : 'connecting',
        qrCode: sessionResult.qrCode,
        error: undefined
      });
      
      // 4. Démarrer le polling pour vérifier la connexion
      if (sessionResult.qrCode) {
        startStatusPolling(user.id);
      }
      
    } catch (error) {
      console.error('❌ Erreur connexion API:', error);
      
      setSession({
        status: 'error',
        error: error instanceof Error ? error.message : 'Erreur de connexion'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Polling pour vérifier le statut via l'API
  const startStatusPolling = useCallback((sessionId: string) => {
    const checkStatus = async () => {
      try {
        const statusResult = await simpleAPI.getSessionStatus(sessionId);
        
        if (statusResult.success) {
          if (statusResult.status === 'connected') {
            console.log('✅ WhatsApp connecté via API!');
            
            setSession({
              status: 'connected',
              phoneNumber: statusResult.phoneNumber,
              lastConnected: new Date(),
              qrCode: undefined,
              error: undefined
            });
            
            return true; // Arrêter le polling
          }
        }
        
        return false; // Continuer le polling
      } catch (error) {
        console.error('Erreur polling:', error);
        return false;
      }
    };
    
    // Polling toutes les 3 secondes pendant 2 minutes max
    let attempts = 0;
    const maxAttempts = 40;
    
    const interval = setInterval(async () => {
      attempts++;
      const shouldStop = await checkStatus();
      
      if (shouldStop || attempts >= maxAttempts) {
        clearInterval(interval);
        
        if (attempts >= maxAttempts) {
          setSession({
            status: 'error',
            error: 'QR code expiré. Veuillez réessayer.',
            qrCode: undefined
          });
        }
      }
    }, 3000);
  }, []);

  // Déconnecter (adapté à votre API)
  const disconnect = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔴 Déconnexion via API...');
      
      const result = await simpleAPI.disconnectSession(user.id);
      
      if (result.success) {
        console.log('✅ Déconnexion réussie');
        setSession({ status: 'disconnected' });
      } else {
        throw new Error(result.error || 'Erreur déconnexion');
      }
      
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      setSession({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Erreur déconnexion' 
      });
    }
  }, [user?.id]);

  // Charger la session au montage
  useEffect(() => {
    const checkInitialStatus = async () => {
      if (!user?.id) return;
      
      try {
        const statusResult = await simpleAPI.getSessionStatus(user.id);
        
        if (statusResult.success) {
          setSession({
            status: statusResult.status as any,
            phoneNumber: statusResult.phoneNumber,
            qrCode: statusResult.qrCode,
            error: undefined
          });
        }
      } catch (error) {
        console.warn('⚠️ Impossible de vérifier le statut initial');
      }
    };
    
    checkInitialStatus();
  }, [user?.id]);

  return {
    session,
    isLoading,
    connect,
    disconnect,
    reload: () => {}, // Pas de reload nécessaire
    isConnected: session.status === 'connected',
    hasQR: session.status === 'qr_pending' && !!session.qrCode
  };
}