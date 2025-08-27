import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ConversationsList } from '@/components/dashboard/ConversationsList';
import { AddItemModal } from '@/components/knowledge-base/AddItemModal';
import { useUserStore, BusinessSector } from '@/lib/store';
import { useDemoData } from '@/lib/hooks/use-demo-data';
import { useLiveFeed } from '@/lib/hooks/use-live-feed';
import { getSectorFromString } from '@/lib/utils/sector-config';
import { SectorId, KBItem, DashboardMetrics } from '@/lib/types';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  TrendingUp, 
  DollarSign, 
  Package,
  MessageSquare,
  Zap,
  ArrowUpRight,
  Eye,
  Plus
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
  const [whatsappConnected, setWhatsappConnected] = useState(true); // Simulé comme connecté

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

  // Récupérer le secteur depuis l'URL ou l'utilisateur
  useEffect(() => {
    const sectorParam = searchParams.get('secteur');
    if (sectorParam) {
      setSector(getSectorFromString(sectorParam));
    } else if (user?.businessSector) {
      setSector(getSectorFromString(user.businessSector));
    }
  }, [searchParams, user]);

  // Charger les données de démo si première visite
  const { isFirstVisit, demoItems } = useDemoData(sector);
  
  // Live feed
  const { messages, isConnected, markAsReplied } = useLiveFeed('demo');
  
  // Charger les items depuis localStorage ou API
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
      // Modifier un item existant
      const updatedItems = kbItems.map(item =>
        item.id === editingItem.id
          ? { ...item, ...itemData, updated_at: now }
          : item
      );
      setKbItems(updatedItems);
      localStorage.setItem('whalix_kb_items', JSON.stringify(updatedItems));
      setEditingItem(null);
    } else {
      // Ajouter un nouvel item
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

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'kb-add':
        setShowAddModal(true);
        break;
      case 'kb-manage':
        navigate('/dashboard/knowledge-base');
        break;
      case 'inbox':
        navigate('/dashboard/conversations');
        break;
      case 'settings':
        navigate('/dashboard/settings');
        break;
      default:
        console.log('Action:', actionId);
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

  return (
    <DashboardLayout 
      waitingMessages={messages.filter(m => m.status === 'waiting').length}
      whatsappConnected={whatsappConnected}
    >
      <div className="p-4 space-y-6">
        {/* Salutation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-primary rounded-2xl p-6 text-white"
        >
          <h2 className="text-2xl font-bold mb-2">
            Bonjour, {user.businessName} 👋
          </h2>
          <p className="opacity-90">
            {salesMetrics.ordersToday} commandes aujourd'hui • {formatCurrency(salesMetrics.revenueToday)} de CA
          </p>
          
          {/* Bouton WhatsApp IA en haut */}
          <div className="mt-4">
            <Button 
              variant="accent" 
              size="sm"
              onClick={() => navigate('/dashboard/whatsapp')}
              className="bg-white/20 hover:bg-white/30 border-white/30"
            >
              <Zap className="h-4 w-4 mr-2" />
              {whatsappConnected ? 'IA WhatsApp Active' : 'Activer IA WhatsApp'}
            </Button>
          </div>
        </motion.div>

        {/* Métriques de vente (style Shopify) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SalesMetricCard
              title="Commandes aujourd'hui"
              value={salesMetrics.ordersToday}
              trend={calculateTrend(salesMetrics.ordersToday, salesMetrics.ordersYesterday)}
              icon={ShoppingCart}
              color="green"
            />
            <SalesMetricCard
              title="CA aujourd'hui"
              value={formatCurrency(salesMetrics.revenueToday)}
              trend={calculateTrend(salesMetrics.revenueToday, salesMetrics.revenueYesterday)}
              icon={DollarSign}
              color="blue"
              isRevenue
            />
            <SalesMetricCard
              title="Panier moyen"
              value={formatCurrency(salesMetrics.avgOrderValue)}
              icon={TrendingUp}
              color="purple"
              isRevenue
            />
            <SalesMetricCard
              title="Taux conversion"
              value={`${salesMetrics.conversionRate}%`}
              icon={TrendingUp}
              color="orange"
            />
          </div>
        </motion.div>
        
        {/* 5 Dernières Conversations */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Dernières conversations
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/dashboard/conversations')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Voir tout
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Aucune conversation récente
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.slice(0, 5).map((message, index) => (
                    <div key={message.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm">👤</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{message.customer}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.at).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {message.last_message}
                        </p>
                      </div>
                      {message.status === 'waiting' && (
                        <Badge variant="destructive" className="text-xs">
                          Nouveau
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Produits en Vedette */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produits en vedette
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/dashboard/knowledge-base')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Gérer ({kbItems.length})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {kbItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Aucun produit ajouté
                  </p>
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter le premier
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {kbItems.slice(0, 6).map((item) => (
                    <div key={item.id} className="bg-muted/30 rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-1">{item.name}</h4>
                      <p className="text-primary font-semibold text-sm">
                        {formatCurrency(item.price)}
                      </p>
                      {!item.availability && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Indispo
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Modal d'ajout/modification d'items */}
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

// Composant Métrique de Vente (style Shopify)
interface SalesMetricCardProps {
  title: string;
  value: number | string;
  trend?: number;
  icon: React.ComponentType<any>;
  color: 'green' | 'blue' | 'purple' | 'orange';
  isRevenue?: boolean;
}

function SalesMetricCard({ title, value, trend, icon: Icon, color, isRevenue = false }: SalesMetricCardProps) {
  const colors = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600', 
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2 rounded-lg ${colors[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
          {trend !== undefined && (
            <span className={`text-xs flex items-center gap-0.5 ${
              trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trend > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : trend < 0 ? (
                <ArrowUpRight className="h-3 w-3 rotate-180" />
              ) : null}
              {trend !== 0 && `${Math.abs(trend)}%`}
            </span>
          )}
        </div>
        <p className={`font-bold ${isRevenue ? 'text-lg' : 'text-2xl'} mb-1`}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}

export default Dashboard;