import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWhatsAppMetrics } from '@/hooks/use-whatsapp-metrics';
import { useAuth } from '@/components/auth/AuthProvider';

interface MetricsContextType {
  metrics: any;
  loading: boolean;
  error: string | null;
  apiHealth: any;
  refresh: () => Promise<void>;
  logEvent: (type: string, payload?: any) => Promise<void>;
  isConnected: boolean;
  hasWaitingMessages: boolean;
  getWaitingCount: () => number;
}

const MetricsContext = createContext<MetricsContextType | null>(null);

export function MetricsProvider({ children }: { children: React.ReactNode }) {
  const { user, tenant } = useAuth();
  const sessionId = tenant?.id || 'test1';
  
  const {
    metrics,
    loading,
    error,
    apiHealth,
    refresh,
    isConnected,
    hasWaitingMessages,
    getWaitingCount
  } = useWhatsAppMetrics(sessionId);


  const logEvent = async (type: string, payload: any = {}) => {
    console.log('📊 [API] Événement:', type, payload);
    
    // Recharger les métriques après un événement important
    if (['qr_generated', 'connection_open', 'message_sent'].includes(type)) {
      setTimeout(refresh, 1000);
    }
  };


  return (
    <MetricsContext.Provider value={{
      metrics,
      loading,
      error,
      apiHealth,
      refresh,
      logEvent,
      isConnected,
      hasWaitingMessages,
      getWaitingCount
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