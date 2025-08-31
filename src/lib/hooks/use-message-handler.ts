import { useCallback } from 'react';
import { supabaseService } from '@/lib/services/supabase-service';

export interface IncomingMessage {
  wa_msg_id: string;
  from_phone: string;
  to_phone: string;
  body: string;
  customer_name?: string;
  timestamp: number;
}

export function useMessageHandler() {
  
  // Traiter un message entrant
  const handleIncomingMessage = useCallback(async (
    tenantId: string, 
    userId: string, 
    message: IncomingMessage
  ) => {
    try {
      console.log('📨 Traitement message entrant:', message);
      
      // 1. Créer/mettre à jour la conversation
      const conversation = await supabaseService.createOrUpdateConversation({
        tenant_id: tenantId,
        customer_phone: message.from_phone,
        customer_name: message.customer_name
      });
      
      // 2. Analyser l'intention
      const intent = analyzeIntent(message.body);
      
      // 3. Sauvegarder le message
      const savedMessage = await supabaseService.saveMessage({
        tenant_id: tenantId,
        conversation_id: conversation.id,
        wa_msg_id: message.wa_msg_id,
        direction: 'inbound',
        from_phone: message.from_phone,
        to_phone: message.to_phone,
        body: message.body,
        intent_detected: intent,
        metadata: {
          customer_name: message.customer_name,
          timestamp: message.timestamp
        }
      });
      
      // 4. Logger les événements
      await supabaseService.logEvent({
        tenant_id: tenantId,
        user_id: userId,
        conversation_id: conversation.id,
        type: 'message_received',
        payload: {
          from: message.from_phone,
          body: message.body.substring(0, 100), // Limiter la taille
          intent: intent,
          wa_msg_id: message.wa_msg_id
        }
      });
      
      if (intent === 'HIGH') {
        await supabaseService.logEvent({
          tenant_id: tenantId,
          user_id: userId,
          conversation_id: conversation.id,
          type: 'intent_detected',
          payload: {
            intent: 'HIGH',
            message_preview: message.body.substring(0, 50),
            confidence: 0.9
          }
        });
      }
      
      return { conversation, message: savedMessage, intent };
      
    } catch (error) {
      console.error('Erreur traitement message:', error);
      throw error;
    }
  }, []);
  
  // Traiter une réponse IA
  const handleAIResponse = useCallback(async (
    tenantId: string,
    userId: string,
    conversationId: string,
    response: {
      body: string;
      confidence: number;
      to_phone: string;
      from_phone: string;
    }
  ) => {
    try {
      // 1. Sauvegarder la réponse IA
      const savedMessage = await supabaseService.saveMessage({
        tenant_id: tenantId,
        conversation_id: conversationId,
        direction: 'outbound',
        from_phone: response.from_phone,
        to_phone: response.to_phone,
        body: response.body,
        ai_generated: true,
        ai_confidence: response.confidence
      });
      
      // 2. Logger l'événement
      await supabaseService.logEvent({
        tenant_id: tenantId,
        user_id: userId,
        conversation_id: conversationId,
        type: 'message_sent',
        payload: {
          ai_generated: true,
          confidence: response.confidence,
          body_preview: response.body.substring(0, 100)
        }
      });
      
      return savedMessage;
      
    } catch (error) {
      console.error('Erreur sauvegarde réponse IA:', error);
      throw error;
    }
  }, []);
  
  // Analyser l'intention d'un message
  const analyzeIntent = (messageBody: string): 'HIGH' | 'MEDIUM' | 'LOW' => {
    const text = messageBody.toLowerCase();
    
    const highIntentKeywords = [
      'acheter', 'commander', 'prendre', 'veux', 'prix', 'combien',
      'réserver', 'booking', 'disponible', 'stock', 'livraison'
    ];
    
    const mediumIntentKeywords = [
      'intéressé', 'peut-être', 'j\'aime', 'pourquoi', 'comment',
      'info', 'renseignement', 'détail'
    ];
    
    if (highIntentKeywords.some(keyword => text.includes(keyword))) {
      return 'HIGH';
    }
    
    if (mediumIntentKeywords.some(keyword => text.includes(keyword))) {
      return 'MEDIUM';
    }
    
    return 'LOW';
  };

  return {
    session,
    isLoading,
    handleIncomingMessage,
    handleAIResponse,
    analyzeIntent
  };
}