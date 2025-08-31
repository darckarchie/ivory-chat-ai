import { useState, useEffect, useCallback } from 'react';
import { baileysService } from '@/lib/services/baileys-integration';
import { LiveReply } from '../types';

export function useLiveFeed(businessId: string) {
  const [messages, setMessages] = useState<LiveReply[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Écouter les nouveaux messages du serveur Baileys
  useEffect(() => {
    if (businessId === 'demo') {
      const unsubscribeMessages = baileysService.onMessageReceived(businessId, (message) => {
        const newMessage: LiveReply = {
          id: message.id,
          at: new Date(message.timestamp).toISOString(),
          customer: message.pushName || 'Client',
          customer_phone: message.from,
          last_message: message.text,
          status: 'waiting',
          confidence: 0
        };
        
        setMessages(prev => {
          const existing = prev.find(m => m.id === message.id);
          if (existing) return prev;
          
          const updated = [newMessage, ...prev].slice(0, 20);
          localStorage.setItem('whalix_live_messages', JSON.stringify(updated));
          return updated;
        });
      });

      const unsubscribeAI = baileysService.onAIReply(businessId, (replyData) => {
        setMessages(prev => {
          const updated = prev.map(msg => 
            msg.id === replyData.messageId 
              ? { 
                  ...msg, 
                  status: 'ai_replied' as const, 
                  reply_preview: replyData.reply, 
                  confidence: replyData.confidence 
                }
              : msg
          );
          localStorage.setItem('whalix_live_messages', JSON.stringify(updated));
          return updated;
        });
      });

      return () => {
        unsubscribeMessages();
        unsubscribeAI();
      };
    }
  }, [businessId]);

  // Écouter les événements personnalisés pour les mises à jour UI
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const newMessage = event.detail;
      setMessages(prev => {
        const existing = prev.find(m => m.id === newMessage.id);
        if (existing) return prev;
        return [newMessage, ...prev].slice(0, 20);
      });
    };

    const handleAIReply = (event: CustomEvent) => {
      const replyData = event.detail;
      setMessages(prev => prev.map(msg => 
        msg.id === replyData.messageId 
          ? { ...msg, status: 'ai_replied', reply_preview: replyData.reply, confidence: replyData.confidence }
          : msg
      ));
    };

    window.addEventListener('whalix-new-message', handleNewMessage as EventListener);
    window.addEventListener('whalix-ai-reply', handleAIReply as EventListener);

    return () => {
      window.removeEventListener('whalix-new-message', handleNewMessage as EventListener);
      window.removeEventListener('whalix-ai-reply', handleAIReply as EventListener);
    };
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      // En mode démo, utiliser les données locales
      if (businessId === 'demo') {
        const stored = localStorage.getItem('whalix_live_messages');
        if (stored) {
          const localMessages = JSON.parse(stored);
          setMessages(localMessages);
          setError(null);
          return;
        }
      }

      const res = await fetch(`/api/messages?business_id=${businessId}&status=waiting`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('Connexion perdue');
    }
  }, [businessId]);

  // Simuler de nouveaux messages en mode démo
  const simulateNewMessage = useCallback(() => {
    if (businessId !== 'demo') return;
    
    const random = Math.random();
    if (random > 0.8) { // 20% de chance d'avoir un nouveau message
      const customers = ['Kouassi', 'Aminata', 'Yao', 'Fatou', 'Ibrahim'];
      const messages = [
        'Bonjour, c\'est ouvert ?',
        'Prix du menu du jour ?',
        'Vous livrez à Cocody ?',
        'Disponible demain ?',
        'Je peux commander ?'
      ];
      
      const newMessage: LiveReply = {
        id: `msg_${Date.now()}`,
        at: new Date().toISOString(),
        customer: customers[Math.floor(Math.random() * customers.length)],
        customer_phone: `+22507000000${Math.floor(Math.random() * 100)}`,
        last_message: messages[Math.floor(Math.random() * messages.length)],
        status: 'waiting',
        confidence: 0
      };
      
      setMessages(prev => {
        const updated = [newMessage, ...prev].slice(0, 20); // Garder max 20 messages
        localStorage.setItem('whalix_live_messages', JSON.stringify(updated));
        return updated;
      });
    }
  }, [businessId]);

  useEffect(() => {
    // Fetch initial
    fetchMessages();
    
    // Polling pour les mises à jour
    const interval = setInterval(() => {
      fetchMessages();
      simulateNewMessage();
    }, 10000); // Toutes les 10 secondes
    
    setIsConnected(true);
    
    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [businessId, fetchMessages, simulateNewMessage]);

  const markAsReplied = useCallback((messageId: string, reply: string) => {
    setMessages(prev => {
      const updated = prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'ai_replied' as const, reply_preview: reply, confidence: 0.95 }
          : msg
      );
      localStorage.setItem('whalix_live_messages', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { messages, isConnected, error, refetch: fetchMessages, markAsReplied };
}