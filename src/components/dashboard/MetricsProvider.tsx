import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseService } from '@/lib/services/supabase-service';
import { useAuth } from '@/components/auth/AuthProvider';

interface MetricsContextType {
  metrics: any;
  loading: boolean;
  refresh: () => Promise<void>;
  logEvent: (type: string, payload?: any) => Promise<void>;
}

const MetricsContext = createContext<MetricsContextType | null>(null);

export function MetricsProvider({ children }: { children: React.ReactNode }) {
  const { user, tenant } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    if (!tenant?.id) return;
    
    try {
      setLoading(true);
      const data = await supabaseService.getTenantMetrics(tenant.id);
      setMetrics(data);
    } catch (error) {
      console.error('Erreur chargement métriques:', error);
    } finally {
      setLoading(false);
    }
  };

  const logEvent = async (type: string, payload: any = {}) => {
    if (!tenant?.id || !user?.id) return;
    
    try {
      await supabaseService.logEvent({
        tenant_id: tenant.id,
        user_id: user.id,
        type: type as any,
        payload
      });
      
      // Recharger les métriques après un événement important
      if (['order_created', 'payment_confirmed', 'connection_open'].includes(type)) {
        setTimeout(loadMetrics, 1000);
      }
    } catch (error) {
      console.warn('🔄 Mode démo - Événement ignoré:', error);
    }
  };

  useEffect(() => {
    loadMetrics();
    
    // Recharger les métriques toutes les 30 secondes
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, [tenant?.id]);

  return (
    <MetricsContext.Provider value={{
      metrics,
      loading,
      refresh: loadMetrics,
      logEvent
    }}>
      {children}
    </MetricsContext.Provider>
  );
}

export function useMetrics() {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error('useMetrics must be used within MetricsProvider');
  }
  return context;
}