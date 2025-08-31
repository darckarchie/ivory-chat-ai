// src/lib/hooks/use-baileys-connection.ts
import { useState, useEffect, useCallback } from 'react';
import baileysService, { WhatsAppStatus, IncomingMessage } from '@/lib/services/baileys-service';
import { useToast } from '@/components/ui/use-toast';

export interface BaileysConnection {
  status: WhatsAppStatus;
  messages: IncomingMessage[];
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (to: string, message: string) => Promise<boolean>;
  isHighIntent: (message: IncomingMessage) => boolean;
}

export function useBaileysConnection(tenantId: string): BaileysConnection {
  const { toast } = useToast();
  
  const [status, setStatus] = useState<WhatsAppStatus>({
    connected: false,
    number: null,
    qrCode: null,
    loading: false,
    error: null
  });
  
  const [messages, setMessages] = useState<IncomingMessage[]>([]);

  useEffect(() => {
    // S'abonner aux changements de statut
    const unsubscribeStatus = baileysService.onStatusChange((newStatus) => {
      setStatus(newStatus);
      
      // Notifications
      if (newStatus.connected) {
        toast({
          title: "✅ WhatsApp Connecté",
          description: `Numéro: ${newStatus.number}`,
          variant: "success"
        });
      } else if (newStatus.error) {
        toast({
          title: "❌ Erreur WhatsApp",
          description: newStatus.error,
          variant: "destructive"
        });
      }
    });

    // S'abonner aux messages
    const unsubscribeMessages = baileysService.onMessage((message) => {
      setMessages(prev => [message, ...prev].slice(0, 100)); // Garder les 100 derniers
      
      // Notification pour intention haute
      if (message.intent === 'HIGH') {
        toast({
          title: "🔥 Intention d'achat détectée!",
          description: `${message.name}: ${message.message}`,
          variant: "default",
          className: "bg-green-50 border-green-500"
        });
      }
    });

    // Connecter WebSocket
    baileysService.connect(tenantId);

    // Vérifier le statut initial
    baileysService.checkStatus();

    return () => {
      unsubscribeStatus();
      unsubscribeMessages();
    };
  }, [tenantId, toast]);

  const connect = useCallback(async () => {
    setStatus(prev => ({ ...prev, loading: true }));
    const newStatus = await baileysService.connectWhatsApp(tenantId);
    setStatus(newStatus);
  }, [tenantId]);

  const disconnect = useCallback(() => {
    baileysService.disconnect();
    setStatus({
      connected: false,
      number: null,
      qrCode: null,
      loading: false,
      error: null
    });
  }, []);

  const sendMessage = useCallback(async (to: string, message: string) => {
    return await baileysService.sendMessage(to, message);
  }, []);

  const isHighIntent = useCallback((message: IncomingMessage) => {
    return message.intent === 'HIGH';
  }, []);

  return {
    status,
    messages,
    connect,
    disconnect,
    sendMessage,
    isHighIntent
  };
}