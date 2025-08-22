import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BusinessSector } from "@/lib/store";
import { 
  MessageCircle, 
  Clock, 
  ShoppingCart, 
  Calendar, 
  FileText, 
  Plus,
  Eye,
  Package,
  Users,
  TrendingUp
} from "lucide-react";

interface DashboardMetrics {
  ordersToday?: number;
  reservationsToday?: number;
  appointmentsToday?: number;
  quotesToday?: number;
  messagesWaiting: number;
  avgResponseMin: number;
}

interface DashboardSimpleProps {
  sector: BusinessSector;
  metrics: DashboardMetrics;
}

const DashboardSimple = ({ sector, metrics }: DashboardSimpleProps) => {
  const getSectorConfig = () => {
    switch (sector) {
      case 'restaurant':
        return {
          title: 'Restaurant & Alimentation',
          primaryMetrics: [
            {
              title: 'Commandes aujourd\'hui',
              value: metrics.ordersToday || 0,
              icon: ShoppingCart,
              color: 'text-green-600',
              bgColor: 'bg-green-50'
            },
            {
              title: 'Réservations',
              value: metrics.reservationsToday || 0,
              icon: Calendar,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            }
          ],
          quickActions: [
            { label: 'Voir commandes', icon: Eye, variant: 'default' as const },
            { label: 'Ajouter plat', icon: Plus, variant: 'outline' as const },
            { label: 'Planning', icon: Calendar, variant: 'outline' as const }
          ]
        };
      
      case 'services':
        return {
          title: 'Services Professionnels',
          primaryMetrics: [
            {
              title: 'RDV aujourd\'hui',
              value: metrics.appointmentsToday || 0,
              icon: Calendar,
              color: 'text-purple-600',
              bgColor: 'bg-purple-50'
            },
            {
              title: 'Devis en cours',
              value: metrics.quotesToday || 0,
              icon: FileText,
              color: 'text-orange-600',
              bgColor: 'bg-orange-50'
            }
          ],
          quickActions: [
            { label: 'Voir RDV', icon: Calendar, variant: 'default' as const },
            { label: 'Nouveau devis', icon: Plus, variant: 'outline' as const },
            { label: 'Clients', icon: Users, variant: 'outline' as const }
          ]
        };
      
      default: // commerce
        return {
          title: 'Commerce & E-shop',
          primaryMetrics: [
            {
              title: 'Commandes aujourd\'hui',
              value: metrics.ordersToday || 0,
              icon: ShoppingCart,
              color: 'text-green-600',
              bgColor: 'bg-green-50'
            },
            {
              title: 'Devis en attente',
              value: metrics.quotesToday || 0,
              icon: FileText,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            }
          ],
          quickActions: [
            { label: 'Voir commandes', icon: ShoppingCart, variant: 'default' as const },
            { label: 'Ajouter produit', icon: Package, variant: 'outline' as const },
            { label: 'Statistiques', icon: TrendingUp, variant: 'outline' as const }
          ]
        };
    }
  };

  const config = getSectorConfig();

  const MetricCard = ({ metric }: { metric: typeof config.primaryMetrics[0] }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {metric.title}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {metric.value}
              </p>
            </div>
            <div className={`p-3 rounded-full ${metric.bgColor}`}>
              <metric.icon className={`h-6 w-6 ${metric.color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

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
              <h1 className="text-xl font-bold text-foreground">Tableau de bord</h1>
              <p className="text-sm text-muted-foreground">{config.title}</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              Whalix Pro
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Primary Metrics */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 mb-6"
        >
          {config.primaryMetrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </motion.div>

        {/* Secondary Metrics */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 md:grid-cols-2 mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Messages en attente
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {metrics.messagesWaiting}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-50">
                  <MessageCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              {metrics.messagesWaiting > 0 && (
                <div className="mt-2">
                  <Badge variant="destructive" className="text-xs">
                    Urgent
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Temps de réponse
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {metrics.avgResponseMin}min
                  </p>
                </div>
                <div className="p-3 rounded-full bg-yellow-50">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-2">
                <Badge 
                  variant={metrics.avgResponseMin <= 5 ? "default" : "secondary"} 
                  className="text-xs"
                >
                  {metrics.avgResponseMin <= 5 ? "Excellent" : "À améliorer"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {config.quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant}
                    className="w-full flex items-center gap-2 h-12"
                    size="lg"
                  >
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Fixed CTA Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.4 }}
        className="fixed bottom-0 left-0 right-0 bg-primary/95 backdrop-blur-sm border-t border-primary/20 p-4 z-50"
      >
        <div className="container mx-auto max-w-md">
          <Button 
            size="lg" 
            className="w-full bg-white text-primary hover:bg-white/90 shadow-lg"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Répondre aux clients
            {metrics.messagesWaiting > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">
                {metrics.messagesWaiting}
              </Badge>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardSimple;