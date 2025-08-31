import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LiveReply } from "@/lib/types";
import { MessageCircle, Clock, User, Phone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ConversationsListProps {
  messages: LiveReply[];
  onOpenChat?: (chatId: string) => void;
}

export function ConversationsList({ messages, onOpenChat }: ConversationsListProps) {
  // Prendre les 10 derniers messages
  const recentMessages = messages.slice(0, 10);

  if (recentMessages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversations WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Aucune conversation récente
            </h3>
            <p className="text-sm text-muted-foreground">
              Les messages WhatsApp apparaîtront ici automatiquement
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Conversations WhatsApp
          <Badge variant="secondary" className="ml-auto">
            {recentMessages.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {recentMessages.map((message, index) => (
            <ConversationItem
              key={message.id}
              message={message}
              index={index}
              onOpenChat={onOpenChat}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ConversationItemProps {
  message: LiveReply;
  index: number;
  onOpenChat?: (chatId: string) => void;
}

function ConversationItem({ message, index, onOpenChat }: ConversationItemProps) {
  const timeAgo = new Date(message.at).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const getStatusColor = () => {
    switch (message.status) {
      case 'waiting':
        return 'text-orange-500';
      case 'ai_replied':
        return 'text-green-500';
      case 'human_replied':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBadge = () => {
    switch (message.status) {
      case 'waiting':
        return <Badge variant="destructive" className="text-xs">Nouveau</Badge>;
      case 'ai_replied':
        return <Badge className="text-xs bg-green-100 text-green-800">IA</Badge>;
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
      transition={{ delay: index * 0.05 }}
      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => onOpenChat?.(message.id)}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-foreground truncate">
              {message.customer}
            </span>
            {getStatusBadge()}
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Phone className="h-3 w-3" />
            <span className="truncate">{message.customer_phone}</span>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
          </div>
          
          <p className="text-sm text-foreground line-clamp-2">
            {message.last_message}
          </p>
          
          {/* Réponse IA preview */}
          {message.reply_preview && (
            <div className="mt-2 p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Réponse IA:</p>
              <p className="text-sm text-foreground line-clamp-1">
                {message.reply_preview}
              </p>
              {message.confidence && (
                <div className="text-xs text-muted-foreground mt-1">
                  Confiance: {Math.round(message.confidence * 100)}%
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Status indicator */}
        <div className="flex-shrink-0">
          <div className={`w-2 h-2 rounded-full ${getStatusColor().replace('text-', 'bg-')}`}></div>
        </div>
      </div>
    </motion.div>
  );
}