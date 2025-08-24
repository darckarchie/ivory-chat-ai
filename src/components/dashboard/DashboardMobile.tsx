
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardMetrics, LiveReply, KBItem, SectorId } from "@/lib/types";
import { getConfig } from "@/lib/utils/sector-config";
import { QuickMetrics } from "./QuickMetrics";
import { LiveRepliesFeed } from "./LiveRepliesFeed";
import { KnowledgeBasePreview } from "../knowledge-base/KnowledgeBasePreview";
import { WhatsAppConnectionCard } from "./WhatsAppConnectionCard";
import { AIResponsePreview } from "./AIResponsePreview";
import { 
  MessageCircle, 
  Settings, 
  BarChart3,
  Zap,
  Bell,
  Menu
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
        {/* Quick Metrics */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <QuickMetrics metrics={metrics} sector={sector} />
        </motion.div>

        {/* Live Messages Feed */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Messages en direct
                  {waitingMessages > 0 && (
                    <Badge variant="destructive" className="animate-pulse">
                      {waitingMessages}
                    </Badge>
                  )}
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onAction('inbox')}
                >
                  Voir tout
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <LiveRepliesFeed 
                messages={live} 
                onOpenChat={onOpenChat}
                onQuickReply={(messageId, reply) => {
                  // Simuler une réponse rapide
                  console.log('Quick reply:', messageId, reply);
                }}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Knowledge Base - Version améliorée */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <KnowledgeBasePreview
            items={kbItems}
            sector={sector}
            onAddItem={() => onAction('kb-add')}
            onManageItems={() => onAction('kb-manage')}
          />
        </motion.div>

        {/* AI Response Preview */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <AIResponsePreview 
            isConnected={whatsappConnected}
            kbItems={kbItems}
          />
        </motion.div>
        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {config.actions.map((action, index) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-12 flex flex-col gap-1"
                    onClick={() => onAction(action.id)}
                  >
                    <span className="text-lg">{getActionIcon(action.icon)}</span>
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Card (si applicable) */}
        {metrics.revenue_today > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-gradient-primary text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Chiffre d'affaires aujourd'hui</p>
                    <p className="text-2xl font-bold">
                      {metrics.revenue_today.toLocaleString()} FCFA
                    </p>
                    {metrics.vs_yesterday?.revenue && (
                      <p className="text-white/80 text-sm mt-1">
                        {metrics.vs_yesterday.revenue > 0 ? '+' : ''}
                        {(metrics.vs_yesterday.revenue * 100).toFixed(0)}% vs hier
                      </p>
                    )}
                  </div>
                  <BarChart3 className="h-8 w-8 text-white/80" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Fixed CTA Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.7 }}
        className="fixed bottom-0 left-0 right-0 bg-primary/95 backdrop-blur-sm border-t border-primary/20 p-4 z-50"
      >
        <div className="container mx-auto max-w-md">
          <Button 
            size="lg" 
            className="w-full bg-white text-primary hover:bg-white/90 shadow-lg"
            onClick={() => onAction('inbox')}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Répondre aux clients
            {waitingMessages > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">
                {waitingMessages}
              </Badge>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function getActionIcon(iconName: string) {
  const icons: Record<string, string> = {
    'receipt': '🧾',
    'plus': '➕',
    'clock': '🕐',
    'package': '📦',
    'calendar': '📅',
    'file-text': '📄',
    'calendar-days': '📆',
    'book': '📖',
    'calendar-check': '✅'
  };
  
  return icons[iconName] || '📋';
}
