import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDashboardMetrics } from '@/lib/hooks/use-dashboard-metrics';
import { DashboardMetrics } from '@/lib/types/dashboard-metrics';
import { useAuth } from '@/components/auth/AuthProvider';

interface MetricsContextType {
  metrics: DashboardMetrics;
  loading: boolean;
  refresh: () => Promise<void>;
  logEvent: (type: string, payload?: any) => Promise<void>;
  updateWhatsAppMetrics: (data: any) => void;
  addMessage: (message: any) => void;
  markMessageReplied: (messageId: string, isAI?: boolean) => void;
  addOrder: (orderData: any) => void;
}

const MetricsContext = createContext<MetricsContextType | null>(null);

export function MetricsProvider({ children }: { children: React.ReactNode }) {
  const { user, tenant } = useAuth();
  const tenantId = tenant?.id || 'demo';
  
  const {
    metrics,
    isLoading,
    error,
    updateWhatsAppMetrics,
    addMessage,
    markMessageReplied,
    addOrder,
    refresh
  } = useDashboardMetrics(tenantId);


  const logEvent = async (type: string, payload: any = {}) => {
    if (!tenant?.id || !user?.id) {
      console.log('📊 [DEMO] Événement:', type, payload);
      return;
    }
    
    try {
      // Essayer de logger dans Supabase
      const { supabaseService } = await import('@/lib/services/supabase-service');
      
      await supabaseService.logEvent({
        tenant_id: tenant.id,
        user_id: user.id,
        type: type as any,
        payload
      });
      
      // Recharger les métriques après un événement important
      if (['order_created', 'payment_confirmed', 'connection_open'].includes(type)) {
        setTimeout(refresh, 1000);
      }
    } catch (error) {
      console.warn('🔄 Mode démo - Événement ignoré:', error);
    }
  };


  return (
    <MetricsContext.Provider value={{
      metrics,
      loading: isLoading,
      refresh,
      logEvent,
      updateWhatsAppMetrics,
      addMessage,
      markMessageReplied,
      addOrder
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