import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardMetrics, LiveReply, KBItem, SectorId } from "@/lib/types";
import { getConfig } from "@/lib/utils/sector-config";
import { QuickMetrics } from "./QuickMetrics";
import { KnowledgeBasePreview } from "../knowledge-base/KnowledgeBasePreview";
import { WhatsAppConnectionCard } from "./WhatsAppConnectionCard";
import { useState } from "react";
import { 
  MessageCircle, 
  Settings, 
  Zap,
  User,
  Clock
} from "lucide-react";

interface DashboardMobileProps {
  sector: SectorId;
  metrics: DashboardMetrics;
  live: LiveReply[];
  kbItems: KBItem[];
  onAction: (actionId: string) => void;
  onOpenChat: (chatId: string) => void;
}

export function DashboardMobile({
  sector,
  metrics,
  live,
  kbItems,
  onAction,
  onOpenChat
}: DashboardMobileProps) {
  const config = getConfig(sector);
  const waitingMessages = live.filter(m => m.status === 'waiting').length;
  const [whatsappConnected, setWhatsappConnected] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">{config.label}</p>
            </div>
            <div className="flex items-center gap-2">
              {whatsappConnected && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Zap className="h-3 w-3 mr-1" />
                  IA Active
                </Badge>
              )}
              {waitingMessages > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {waitingMessages}
                </Badge>
              )}
              <Button variant="ghost" size="icon" onClick={() => onAction('settings')}>
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* WhatsApp IA Connection */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <WhatsAppConnectionCard 
            restaurantId="demo"
            onStatusChange={setWhatsappConnected}
          />
        </motion.div>
        
        {/* Aperçu des conversations WhatsApp */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversations WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              {live.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Aucune conversation récente
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {live.slice(0, 5).map((message, index) => (
                    <div key={message.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium truncate">{message.customer}</span>
                          <span className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(message.at).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground line-clamp-2">
                          {message.last_message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Knowledge Base */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <KnowledgeBasePreview
            items={kbItems}
            sector={sector}
            onAddItem={() => onAction('kb-add')}
            onManageItems={() => onAction('kb-manage')}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default DashboardMobile;