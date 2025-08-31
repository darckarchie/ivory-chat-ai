import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useUserStore, BusinessSector } from '@/lib/store';
import { useDemoData } from '@/lib/hooks/use-demo-data';
import { useLiveFeed } from '@/lib/hooks/use-live-feed';
import { getSectorFromString } from '@/lib/utils/sector-config';
import { SectorId, KBItem } from '@/lib/types';
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddItemModal } from '@/components/knowledge-base/AddItemModal';
import { QuickMetrics } from '@/components/dashboard/QuickMetrics';
import { ConversationsList } from '@/components/dashboard/ConversationsList';
import { 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Package,
  MessageSquare,
  Zap,
  Eye,
  Plus,
  User,
  Target,
  DollarSign
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useUserStore(state => state.isAuthenticated());
  const user = useUserStore(state => state.user);
  
  const [sector, setSector] = useState<SectorId>('commerce');
  const [kbItems, setKbItems] = useState<KBItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<KBItem | null>(null);

  // Métriques de vente simulées (style Shopify)
  const [salesMetrics] = useState({
    ordersToday: 12,
    ordersYesterday: 8,
    revenueToday: 285000,
    revenueYesterday: 195000,
    avgOrderValue: 23750,
    conversionRate: 3.2
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const sectorParam = searchParams.get('secteur');
    if (sectorParam) {
      setSector(getSectorFromString(sectorParam));
    } else if (user?.businessSector) {
      setSector(getSectorFromString(user.businessSector));
    }
  }, [searchParams, user]);

  const { isFirstVisit, demoItems } = useDemoData(sector);
  const { messages } = useLiveFeed('demo');
  
  useEffect(() => {
    const loadItems = async () => {
      const stored = localStorage.getItem('whalix_kb_items');
      if (stored) {
        setKbItems(JSON.parse(stored));
      } else if (isFirstVisit && demoItems.length > 0) {
        setKbItems(demoItems);
      }
    };
    
    loadItems();
  }, [isFirstVisit, demoItems]);
  
  const handleSaveItem = (itemData: Omit<KBItem, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => {
    const now = new Date();
    
    if (editingItem) {
      const updatedItems = kbItems.map(item =>
        item.id === editingItem.id
          ? { ...item, ...itemData, updated_at: now }
          : item
      );
      setKbItems(updatedItems);
      localStorage.setItem('whalix_kb_items', JSON.stringify(updatedItems));
      setEditingItem(null);
    } else {
      const newItem: KBItem = {
        id: `kb_${Date.now()}`,
        business_id: 'demo',
        ...itemData,
        created_at: now,
        updated_at: now
      };
      const updatedItems = [...kbItems, newItem];
      setKbItems(updatedItems);
      localStorage.setItem('whalix_kb_items', JSON.stringify(updatedItems));
    }
  };
  
  if (!user) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  const calculateTrend = (today: number, yesterday: number) => {
    if (yesterday === 0) return 0;
    return Math.round(((today - yesterday) / yesterday) * 100);
  };

  const waitingMessages = messages.filter(m => m.status === 'waiting').length;
  const whatsappConnected = true; // Simulé pour la démo

  // Métriques pour le composant QuickMetrics
  const dashboardMetrics = {
    orders_today: salesMetrics.ordersToday,
    reservations_today: 0,
    quotes_today: 0,
    messages_waiting: waitingMessages,
    avg_response_min: 1.2,
    revenue_today: salesMetrics.revenueToday,
    vs_yesterday: {
      orders: calculateTrend(salesMetrics.ordersToday, salesMetrics.ordersYesterday),
      revenue: calculateTrend(salesMetrics.revenueToday, salesMetrics.revenueYesterday),
      messages: 0
    }
  };

  return (
    <DashboardLayout 
      waitingMessages={waitingMessages}
      whatsappConnected={whatsappConnected}
    >
      <div className="p-4 space-y-6">
        {/* Salutation avec CA du jour */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-primary rounded-2xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">
              Bonjour, {user.businessName} 👋
            </h2>
            <p className="text-white/90 text-lg">
              CA aujourd'hui : <span className="font-bold">{formatCurrency(salesMetrics.revenueToday)}</span>
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>{salesMetrics.ordersToday} commandes</span>
              </div>
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <Target className="h-4 w-4" />
                <span>{salesMetrics.conversionRate}% conversion</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bouton WhatsApp IA - Discret en haut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"></div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Assistant WhatsApp IA</h3>
                    <p className="text-sm text-muted-foreground">
                      {whatsappConnected ? 'Actif 24/7 - Répond automatiquement' : 'Activez votre IA en 2 clics'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant={whatsappConnected ? "outline" : "default"}
                  className={whatsappConnected ? "" : "bg-gradient-primary hover:shadow-glow"}
                  onClick={() => navigate('/dashboard/whatsapp')}
                >
                  {whatsappConnected ? 'Configurer' : 'Activer IA'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Métriques de vente (Style Shopify) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <QuickMetrics metrics={dashboardMetrics} sector={sector} />
        </motion.div>

        {/* 5 Dernières Conversations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ConversationsList 
            messages={messages.slice(0, 5)} 
            onOpenChat={(chatId) => navigate('/dashboard/conversations')}
          />
        </motion.div>

        {/* Produits en Vedette */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produits en vedette
                  <Badge variant="secondary">{kbItems.length}</Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/dashboard/knowledge-base')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Gérer
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {kbItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    Aucun produit ajouté
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ajoutez vos premiers produits pour que l'IA puisse répondre aux clients
                  </p>
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Commencer
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {kbItems.slice(0, 8).map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -2, scale: 1.02 }}
                      className="bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-all duration-200 cursor-pointer group"
                      onClick={() => setEditingItem(item)}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                          {item.type === 'menu' ? '🍽️' : 
                           item.type === 'product' ? '📱' : 
                           item.type === 'service' ? '🔧' : '🏨'}
                        </div>
                        <h4 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">
                          {item.name}
                        </h4>
                        <p className="text-primary font-bold text-sm">
                          {formatCurrency(item.price)}
                        </p>
                        {!item.availability && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Indispo
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* KPIs Supplémentaires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-4"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <User className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">284</p>
              <p className="text-xs text-muted-foreground">Clients totaux</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 text-accent mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">15</p>
              <p className="text-xs text-muted-foreground">Nouveaux clients</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-success mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">68%</p>
              <p className="text-xs text-muted-foreground">Taux fidélité</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <AddItemModal
        isOpen={showAddModal || editingItem !== null}
        onClose={() => {
          setShowAddModal(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        sector={sector}
        editItem={editingItem}
      />
    </DashboardLayout>
  );
};

export default Dashboard;