import { useState, useEffect, useCallback } from 'react';
import { baileysService } from '@/lib/services/baileys-integration';
import { LiveReply } from '../types';

export function useLiveFeed(businessId: string) {
  const [messages, setMessages] = useState<LiveReply[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les messages depuis localStorage au démarrage
  useEffect(() => {
    const stored = localStorage.getItem('whalix_live_messages');
    if (stored) {
      try {
        const localMessages = JSON.parse(stored);
        setMessages(localMessages);
      } catch (error) {
        console.error('Erreur parsing messages locaux:', error);
      }
    }
  }, []);

  // Écouter les nouveaux messages du serveur Baileys
  useEffect(() => {
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
      setMessages(prev => prev.map(msg => 
        msg.id === replyData.messageId 
          ? { ...msg, status: 'ai_replied', reply_preview: replyData.reply, confidence: replyData.confidence }
          : msg
      ));
    });

    return () => {
      unsubscribeMessages();
      unsubscribeAI();
    };
  }, [businessId]);

  const fetchMessages = useCallback(async () => {
    try {
      // Vérifier la connexion au serveur Baileys
      const session = baileysService.getSession(businessId);
      if (session?.status === 'connected') {
        setIsConnected(true);
        setError(null);
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      console.error('Erreur vérification serveur Baileys:', err);
      setIsConnected(false);
      setError('Serveur Baileys non disponible');
    }
  }, [businessId]);

  // Simuler de nouveaux messages en mode démo
  const simulateNewMessage = useCallback(() => {
    if (businessId !== 'demo') return;
    
    const random = Math.random();
    if (random > 0.90) { // 10% de chance d'avoir un nouveau message
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
      
      // Simuler réponse IA après 3 secondes
      setTimeout(() => {
        setMessages(prev => {
          const updated = prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'ai_replied' as const, reply_preview: 'Merci ! Je reviens vers vous rapidement.', confidence: 0.85 }
              : msg
          );
          localStorage.setItem('whalix_live_messages', JSON.stringify(updated));
          return updated;
        });
      }, 3000);
    }
  }, [businessId]);

  useEffect(() => {
    // Fetch initial
    fetchMessages();
    
    // Polling pour les mises à jour
    const interval = setInterval(() => {
      fetchMessages();
      simulateNewMessage();
    }, 15000); // Toutes les 15 secondes
    
    return () => {
      clearInterval(interval);
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