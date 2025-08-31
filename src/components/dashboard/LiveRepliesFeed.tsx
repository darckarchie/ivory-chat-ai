import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LiveReply } from "@/lib/types";
import { MessageCircle, Clock, CheckCircle, User, Phone } from "lucide-react";

interface LiveRepliesFeedProps {
  messages: LiveReply[];
  onOpenChat: (messageId: string) => void;
  onQuickReply?: (messageId: string, reply: string) => void;
}

export function LiveRepliesFeed({ messages, onOpenChat, onQuickReply }: LiveRepliesFeedProps) {
  if (messages.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Aucun message en attente
          </h3>
          <p className="text-sm text-muted-foreground">
            Les nouveaux messages WhatsApp apparaîtront ici
          </p>
        </CardContent>
      </Card>
    );
  }

  const waitingMessages = messages.filter(m => m.status === 'waiting');
  const repliedMessages = messages.filter(m => m.status !== 'waiting');

  return (
    <div className="space-y-4">
      {/* Messages en attente */}
      {waitingMessages.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <h3 className="text-sm font-semibold text-foreground">
              En attente ({waitingMessages.length})
            </h3>
          </div>
          
          <div className="space-y-2">
            {waitingMessages.map((message, index) => (
              <MessageCard
                key={message.id}
                message={message}
                index={index}
                onOpenChat={onOpenChat}
                onQuickReply={onQuickReply}
                isUrgent={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Messages traités récents */}
      {repliedMessages.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            Récemment traités
          </h3>
          
          <div className="space-y-2">
            {repliedMessages.slice(0, 3).map((message, index) => (
              <MessageCard
                key={message.id}
                message={message}
                index={index}
                onOpenChat={onOpenChat}
                isUrgent={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MessageCardProps {
  message: LiveReply;
  index: number;
  onOpenChat: (messageId: string) => void;
  onQuickReply?: (messageId: string, reply: string) => void;
  isUrgent: boolean;
}

function MessageCard({ message, index, onOpenChat, onQuickReply, isUrgent }: MessageCardProps) {
  const timeAgo = new Date(message.at).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });</parameter>

  const getStatusIcon = () => {
    switch (message.status) {
      case 'waiting':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'ai_replied':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'human_replied':
        return <User className="h-4 w-4 text-blue-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (message.status) {
      case 'waiting':
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
      case 'ai_replied':
        return <Badge variant="default" className="text-xs bg-green-100 text-green-800">IA</Badge>;
      case 'human_replied':
        return <Badge variant="secondary" className="text-xs">Vous</Badge>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isUrgent ? 'border-red-200 bg-red-50/50' : 'border-border'
        }`}
        onClick={() => onOpenChat(message.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-foreground truncate">
                    {message.customer}
                  </h4>
                  {getStatusBadge()}
                </div>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <Phone className="h-3 w-3" />
                  <span className="truncate">{message.customer_phone}</span>
                  <span>•</span>
                  <span>{timeAgo}</span>
                </div>
                
                <p className="text-sm text-foreground line-clamp-2 mb-2">
                  {message.last_message}
                </p>
                
                {message.reply_preview && (
                  <div className="bg-muted/50 rounded-lg p-2 mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Réponse IA:</p>
                    <p className="text-sm text-foreground line-clamp-1">
                      {message.reply_preview}
                    </p>
                    {message.confidence && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="text-xs text-muted-foreground">
                          Confiance: {Math.round(message.confidence * 100)}%
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions rapides pour messages en attente */}
          {isUrgent && onQuickReply && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickReply(message.id, "Merci pour votre message. Je reviens vers vous rapidement.");
                }}
              >
                Réponse rapide
              </Button>
              <Button
                size="sm"
                variant="default"
                className="text-xs h-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChat(message.id);
                }}
              >
                Répondre
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}