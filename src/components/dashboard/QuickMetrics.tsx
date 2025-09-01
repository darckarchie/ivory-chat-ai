import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectorId } from "@/lib/types";
import { getConfig } from "@/lib/utils/sector-config";
import { 
  ShoppingCart, 
  Calendar, 
  FileText, 
  MessageCircle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

interface QuickMetricsProps {
  metrics: any; // Métriques depuis l'API WhatsApp
  sector: SectorId;
}

export function QuickMetrics({ metrics, sector }: QuickMetricsProps) {
  const config = getConfig(sector);

  const getMetricCards = () => {
    const cards = [
      {
        id: 'primary',
        title: config.primaryLabel,
        value: metrics?.conversations?.new_today || 0,
        icon: ShoppingCart,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        change: undefined // Pas de données de tendance pour l'instant
      },
      {
        id: 'secondary', 
        title: config.secondaryLabel,
        value: metrics?.customers?.total || 0,
        icon: Calendar,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        id: 'messages',
        title: 'Messages en attente',
        value: metrics?.messages?.pending || 0,
        icon: MessageCircle,
        color: (metrics?.messages?.pending || 0) > 0 ? 'text-red-600' : 'text-gray-600',
        bgColor: (metrics?.messages?.pending || 0) > 0 ? 'bg-red-50' : 'bg-gray-50',
        urgent: (metrics?.messages?.pending || 0) > 0
      },
      {
        id: 'response',
        title: 'Temps de réponse',
        value: `${metrics?.ai?.response_time || 2.1}s`,
        icon: Clock,
        color: (metrics?.ai?.response_time || 2.1) <= 3 ? 'text-green-600' : 'text-orange-600',
        bgColor: (metrics?.ai?.response_time || 2.1) <= 3 ? 'bg-green-50' : 'bg-orange-50'
      }
    ];

    return cards;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const getTrendIcon = (change?: number) => {
    if (!change) return <Minus className="h-3 w-3" />;
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendText = (change?: number) => {
    if (!change) return null;
    const percentage = Math.abs(change * 100).toFixed(0);
    const direction = change > 0 ? '+' : '-';
    return `${direction}${percentage}%`;
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {getMetricCards().map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -2 }}
        >
          <Card className={`relative overflow-hidden ${card.urgent ? 'ring-2 ring-red-200' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground mb-1 line-clamp-1">
                    {card.title}
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {typeof card.value === 'number' ? formatNumber(card.value) : card.value}
                  </p>
                  
                  {/* Trend indicator */}
                  {card.change !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                      {getTrendIcon(card.change)}
                      <span className={`text-xs ${
                        card.change > 0 ? 'text-green-600' : 
                        card.change < 0 ? 'text-red-600' : 'text-muted-foreground'
                      }`}>
                        {getTrendText(card.change) || 'Stable'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
              
              {/* Urgent badge */}
              {card.urgent && (
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="text-xs animate-pulse">
                    Urgent
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}