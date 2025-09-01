import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useLiveFeed } from '@/lib/hooks/use-live-feed';
import { Search, Filter, Clock, CheckCircle, User, Phone, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const Conversations = () => {
  const navigate = useNavigate();
  const { messages } = useLiveFeed('demo');
  const [filter, setFilter] = useState('all'); // all, pending, replied
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = messages.filter(conv => {
    if (filter === 'pending' && conv.status !== 'waiting') return false;
    if (filter === 'replied' && conv.status === 'waiting') return false;
    if (searchQuery && !conv.last_message.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !conv.customer.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const waitingCount = messages.filter(m => m.status === 'waiting').length;
  const repliedCount = messages.filter(m => m.status !== 'waiting').length;

  return (
    <DashboardLayout 
      waitingMessages={waitingCount}
      whatsappConnected={true}
    >
      <div className="h-full flex flex-col">
        {/* Header avec recherche */}
        <div className="bg-white border-b p-4 space-y-3">
          <h2 className="text-lg font-semibold">Conversations</h2>
          
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une conversation..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Filtres */}
          <div className="flex gap-2">
            <FilterTab
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              label="Tous"
              count={messages.length}
            />
            <FilterTab
              active={filter === 'pending'}
              onClick={() => setFilter('pending')}
              label="En attente"
              count={waitingCount}
              highlight={waitingCount > 0}
            />
            <FilterTab
              active={filter === 'replied'}
              onClick={() => setFilter('replied')}
              label="Répondus"
              count={repliedCount}
            />
          </div>
        </div>
        
        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto bg-white">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500">Aucune conversation trouvée</p>
              {searchQuery && (
                <Button 
                  variant="link" 
                  onClick={() => setSearchQuery('')}
                  className="mt-2"
                >
                  Effacer la recherche
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredConversations.map((conv, index) => (
                <ConversationItem 
                  key={conv.id} 
                  conversation={conv} 
                  index={index}
                  onClick={() => navigate(`/dashboard/conversations/${conv.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

interface FilterTabProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  highlight?: boolean;
}

function FilterTab({ active, onClick, label, count, highlight = false }: FilterTabProps) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={`
        ${active 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-background hover:bg-muted'
        }
      `}
    >
      {label}
      {count > 0 && (
        <Badge 
          variant={highlight && !active ? "destructive" : "secondary"}
          className="ml-1.5 text-xs"
        >
          {count}
        </Badge>
      )}
    </Button>
  );
}

interface ConversationItemProps {
  conversation: any;
  index: number;
  onClick: () => void;
}

function ConversationItem({ conversation, index, onClick }: ConversationItemProps) {
  const timeAgo = new Date(conversation.at).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const getStatusIcon = () => {
    switch (conversation.status) {
      case 'waiting':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'ai_replied':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'human_replied':
        return <User className="h-4 w-4 text-blue-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (conversation.status) {
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
      className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
        <User className="h-5 w-5 text-primary" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{conversation.customer}</p>
            {getStatusBadge()}
          </div>
          <span className="text-xs text-gray-500">{timeAgo}</span>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <Phone className="h-3 w-3" />
          <span className="truncate">{conversation.customer_phone}</span>
        </div>
        
        <p className="text-sm text-gray-600 truncate">{conversation.last_message}</p>
      </div>
      
      {/* Status & Badge */}
      <div className="flex items-center gap-2">
        {getStatusIcon()}
      </div>
    </motion.div>
  );
}

export default Conversations;