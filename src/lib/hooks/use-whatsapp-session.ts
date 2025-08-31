import { useState, useEffect, useCallback } from 'react';
import { supabaseService } from '@/lib/services/supabase-service';
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
      const currentUser = await supabaseService.getCurrentUser();
      if (!currentUser) return;
      
      const dbSession = await supabaseService.getWhatsAppSession(currentUser.tenant_id);
      
      if (dbSession) {
        setSession({
          id: dbSession.id,
          status: dbSession.status,
          qrCode: dbSession.qr_code || undefined,
          phoneNumber: dbSession.phone_number || undefined,
          lastConnected: dbSession.last_seen_at ? new Date(dbSession.last_seen_at) : undefined,
          error: dbSession.last_error || undefined,
          messageCount: dbSession.message_count
        });
      }
    } catch (error) {
      console.error('Erreur chargement session:', error);
    }
  }, [user?.id]);

  // Connecter WhatsApp
  const connect = useCallback(async () => {
    if (!user?.id) throw new Error('Utilisateur non connecté');
    
    setIsLoading(true);
    
    try {
      const currentUser = await supabaseService.getCurrentUser();
      if (!currentUser) throw new Error('Profil utilisateur non trouvé');
      
      // 1. Logger l'événement QR généré
      await supabaseService.logEvent({
        tenant_id: currentUser.tenant_id,
        user_id: currentUser.id,
        type: 'qr_generated',
        payload: { 
          session_name: `whalix_${currentUser.tenant_id}`,
          timestamp: new Date().toISOString()
        }
      });
      
      // 2. Créer/mettre à jour la session en DB
      const dbSession = await supabaseService.createOrUpdateWhatsAppSession({
        tenant_id: currentUser.tenant_id,
        user_id: currentUser.id,
        status: 'connecting',
        session_path: `/data/sessions/whalix_${currentUser.tenant_id}`
      });
      
      setSession({
        id: dbSession.id,
        status: 'connecting',
        phoneNumber: undefined,
        qrCode: undefined,
        error: undefined
      });
      
      // 3. Appeler l'API backend pour générer le QR
      const BACKEND_URL = 'https://whalix-server-railway-production.up.railway.app';
      const response = await fetch(`${BACKEND_URL}/api/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          restaurantId: currentUser.tenant_id,
          tenantId: currentUser.tenant_id,
          userId: currentUser.id
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 4. Mettre à jour avec le QR code
      await supabaseService.createOrUpdateWhatsAppSession({
        tenant_id: currentUser.tenant_id,
        user_id: currentUser.id,
        status: 'qr_pending',
        qr_code: data.qrCode || data.qr,
        session_path: `/data/sessions/whalix_${currentUser.tenant_id}`
      });
      
      setSession({
        id: dbSession.id,
        status: 'qr_pending',
        qrCode: data.qrCode || data.qr,
        phoneNumber: undefined,
        error: undefined
      });
      
      // 5. Commencer le polling pour vérifier le scan
      startStatusPolling(currentUser.tenant_id, currentUser.id);
      
    } catch (error) {
      console.error('Erreur connexion WhatsApp:', error);
      
      const currentUser = await supabaseService.getCurrentUser();
      if (currentUser) {
        await supabaseService.createOrUpdateWhatsAppSession({
          tenant_id: currentUser.tenant_id,
          user_id: currentUser.id,
          status: 'error',
          last_error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
      
      setSession({
        status: 'error',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Polling pour vérifier le statut
  const startStatusPolling = useCallback((tenantId: string, userId: string) => {
    const checkStatus = async () => {
      try {
        const BACKEND_URL = 'https://whalix-server-railway-production.up.railway.app';
        const response = await fetch(`${BACKEND_URL}/api/whatsapp/status/${tenantId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.status === 'connected' || data.status === 'authorized') {
            // Connexion réussie !
            await supabaseService.createOrUpdateWhatsAppSession({
              tenant_id: tenantId,
              user_id: userId,
              status: 'connected',
              phone_number: data.phoneNumber,
              wa_device_id: data.deviceId,
              qr_code: null // Effacer le QR code
            });
            
            // Logger les événements
            await supabaseService.logEvent({
              tenant_id: tenantId,
              user_id: userId,
              type: 'qr_scanned',
              payload: { phone_number: data.phoneNumber }
            });
            
            await supabaseService.logEvent({
              tenant_id: tenantId,
              user_id: userId,
              type: 'session_created',
              payload: { device_id: data.deviceId }
            });
            
            await supabaseService.logEvent({
              tenant_id: tenantId,
              user_id: userId,
              type: 'connection_open',
              payload: { phone_number: data.phoneNumber }
            });
            
            setSession({
              status: 'connected',
              phoneNumber: data.phoneNumber,
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
          // Timeout
          await supabaseService.createOrUpdateWhatsAppSession({
            tenant_id: tenantId,
            user_id: userId,
            status: 'error',
            last_error: 'QR code expiré. Veuillez réessayer.',
            qr_code: null
          });
          
          setSession({
            status: 'error',
            error: 'QR code expiré. Veuillez réessayer.',
            qrCode: undefined
          });
        }
      }
    }, 3000);
  }, []);

  // Déconnecter
  const disconnect = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const currentUser = await supabaseService.getCurrentUser();
      if (!currentUser) return;
      
      // Déconnecter côté serveur
      const BACKEND_URL = 'https://whalix-server-railway-production.up.railway.app';
      await fetch(`${BACKEND_URL}/api/whatsapp/disconnect/${currentUser.tenant_id}`, {
        method: 'POST'
      });
      
      // Mettre à jour la DB
      await supabaseService.createOrUpdateWhatsAppSession({
        tenant_id: currentUser.tenant_id,
        user_id: currentUser.id,
        status: 'disconnected',
        qr_code: null,
        phone_number: null,
        wa_device_id: null
      });
      
      // Logger l'événement
      await supabaseService.logEvent({
        tenant_id: currentUser.tenant_id,
        user_id: currentUser.id,
        type: 'connection_closed',
        payload: { manual_disconnect: true }
      });
      
      setSession({ status: 'disconnected' });
      
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  }, [user?.id]);

  // Charger la session au montage
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return {
    session,
    isLoading,
    connect,
    disconnect,
    reload: loadSession,
    isConnected: session.status === 'connected',
    hasQR: session.status === 'qr_pending' && !!session.qrCode
  };
}