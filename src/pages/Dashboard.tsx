import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore, BusinessSector } from '@/lib/store';
import { useDemoData } from '@/lib/hooks/use-demo-data';
import { useLiveFeed } from '@/lib/hooks/use-live-feed';
import { getSectorFromString } from '@/lib/utils/sector-config';
import { SectorId, KBItem } from '@/lib/types';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddItemModal } from '@/components/knowledge-base/AddItemModal';
import { 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Package,
  MessageSquare,
  Zap,
  ArrowUpRight,
  Eye,
  Plus,
  Settings,
  User,
  Clock,
  CheckCircle,
  Bot,
  Sparkles,
  Crown,
  Star,
  BarChart3,
  Phone,
  Calendar,
  Target,
  Activity
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
  const [whatsappConnected, setWhatsappConnected] = useState(true);

  // Métriques de vente simulées (style Shopify Premium)
  const [salesMetrics] = useState({
    ordersToday: 12,
    ordersYesterday: 8,
    revenueToday: 285000,
    revenueYesterday: 195000,
    avgOrderValue: 23750,
    conversionRate: 3.2,
    totalCustomers: 284,
    newCustomers: 15,
    repeatRate: 68
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
  const { messages } = useLiveFeed('demo');
  
  // Charger les items depuis localStorage
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      {/* Header Premium */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="bg-gradient-primary p-3 rounded-2xl shadow-glow"
              >
                <MessageSquare className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {user.businessName}
                </h1>
                <p className="text-white/80 text-sm">
                  Dashboard • {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* WhatsApp IA Status */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="accent"
                  size="sm"
                  onClick={() => navigate('/dashboard/whatsapp')}
                  className="bg-white/20 hover:bg-white/30 border-white/30 backdrop-blur-sm"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {whatsappConnected ? 'IA Active' : 'Activer IA'}
                  {whatsappConnected && (
                    <div className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></div>
                  )}
                </Button>
              </motion.div>

              {/* Notifications */}
              {waitingMessages > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative"
                >
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => navigate('/dashboard/conversations')}
                    className="animate-pulse"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {waitingMessages} nouveau{waitingMessages > 1 ? 'x' : ''}
                  </Button>
                </motion.div>
              )}

              {/* Settings */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate('/dashboard/settings')}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8 space-y-8">
        {/* Métriques de Vente Premium (Style Shopify) */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <PremiumMetricCard
              title="Commandes aujourd'hui"
              value={salesMetrics.ordersToday}
              trend={calculateTrend(salesMetrics.ordersToday, salesMetrics.ordersYesterday)}
              icon={ShoppingCart}
              gradient="from-emerald-400 to-green-600"
              glowColor="shadow-green-500/30"
            />
            <PremiumMetricCard
              title="CA aujourd'hui"
              value={formatCurrency(salesMetrics.revenueToday)}
              trend={calculateTrend(salesMetrics.revenueToday, salesMetrics.revenueYesterday)}
              icon={DollarSign}
              gradient="from-blue-400 to-indigo-600"
              glowColor="shadow-blue-500/30"
              isRevenue
            />
            <PremiumMetricCard
              title="Panier moyen"
              value={formatCurrency(salesMetrics.avgOrderValue)}
              icon={TrendingUp}
              gradient="from-purple-400 to-pink-600"
              glowColor="shadow-purple-500/30"
              isRevenue
            />
            <PremiumMetricCard
              title="Taux conversion"
              value={`${salesMetrics.conversionRate}%`}
              icon={Target}
              gradient="from-orange-400 to-red-600"
              glowColor="shadow-orange-500/30"
            />
          </div>
        </motion.div>

        {/* KPIs Supplémentaires */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-3 gap-4">
            <MiniKPICard
              label="Clients totaux"
              value={salesMetrics.totalCustomers}
              icon={User}
              color="text-cyan-400"
            />
            <MiniKPICard
              label="Nouveaux clients"
              value={salesMetrics.newCustomers}
              icon={Star}
              color="text-yellow-400"
            />
            <MiniKPICard
              label="Taux de fidélité"
              value={`${salesMetrics.repeatRate}%`}
              icon={Crown}
              color="text-purple-400"
            />
          </div>
        </motion.div>
        
        {/* 5 Dernières Conversations */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-white flex items-center gap-3">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-2 rounded-xl">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  Dernières conversations
                </CardTitle>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/dashboard/conversations')}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir tout ({messages.length})
                  </Button>
                </motion.div>
              </div>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="bg-white/10 p-6 rounded-2xl w-fit mx-auto mb-6"
                  >
                    <MessageSquare className="h-16 w-16 text-white/60" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Aucune conversation récente
                  </h3>
                  <p className="text-white/60 text-sm">
                    Les messages WhatsApp apparaîtront ici automatiquement
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.slice(0, 5).map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5, scale: 1.02 }}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                      onClick={() => navigate('/dashboard/conversations')}
                    >
                      <div className="flex items-center gap-4">
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg"
                        >
                          <User className="h-6 w-6 text-white" />
                        </motion.div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-white font-semibold">{message.customer}</span>
                            {message.status === 'waiting' && (
                              <Badge className="bg-red-500/90 text-white border-0 animate-pulse">
                                Nouveau
                              </Badge>
                            )}
                            {message.status === 'ai_replied' && (
                              <Badge className="bg-green-500/90 text-white border-0">
                                <Bot className="h-3 w-3 mr-1" />
                                IA
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-white/60 text-xs mb-2">
                            <Phone className="h-3 w-3" />
                            <span>{message.customer_phone}</span>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>{new Date(message.at).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}</span>
                          </div>
                          
                          <p className="text-white/90 text-sm line-clamp-1 group-hover:text-white transition-colors">
                            {message.last_message}
                          </p>
                        </div>
                        
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ArrowUpRight className="h-5 w-5 text-white/60" />
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Produits en Vedette */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-white flex items-center gap-3">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-2 rounded-xl">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  Produits en vedette
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {kbItems.length}
                  </Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/dashboard/knowledge-base')}
                      className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Gérer
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="sm"
                      onClick={() => setShowAddModal(true)}
                      className="bg-gradient-primary hover:shadow-glow"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {kbItems.length === 0 ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="bg-white/10 p-6 rounded-2xl w-fit mx-auto mb-6"
                  >
                    <Package className="h-16 w-16 text-white/60" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Aucun produit ajouté
                  </h3>
                  <p className="text-white/60 text-sm mb-6">
                    Ajoutez vos premiers produits pour que l'IA puisse répondre aux clients
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => setShowAddModal(true)}
                      className="bg-gradient-primary hover:shadow-glow"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Commencer
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {kbItems.slice(0, 6).map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.05 }}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 group cursor-pointer"
                      onClick={() => setEditingItem(item)}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                          {item.type === 'menu' ? '🍽️' : 
                           item.type === 'product' ? '📱' : 
                           item.type === 'service' ? '🔧' : '🏨'}
                        </div>
                        <h4 className="font-semibold text-white text-sm mb-2 line-clamp-2">
                          {item.name}
                        </h4>
                        <p className="text-accent font-bold text-sm">
                          {formatCurrency(item.price)}
                        </p>
                        {!item.availability && (
                          <Badge variant="secondary" className="text-xs mt-2 bg-red-500/20 text-red-300 border-red-400/30">
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

        {/* Actions Rapides */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-3">
                <div className="bg-gradient-to-r from-indigo-400 to-purple-500 p-2 rounded-xl">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                Actions rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickActionCard
                  label="Voir commandes"
                  icon="🛒"
                  gradient="from-green-400 to-emerald-600"
                  onClick={() => navigate('/dashboard/analytics')}
                />
                <QuickActionCard
                  label="Messages clients"
                  icon="💬"
                  gradient="from-blue-400 to-cyan-600"
                  badge={waitingMessages}
                  onClick={() => navigate('/dashboard/conversations')}
                />
                <QuickActionCard
                  label="Ajouter produit"
                  icon="📦"
                  gradient="from-purple-400 to-pink-600"
                  onClick={() => setShowAddModal(true)}
                />
                <QuickActionCard
                  label="Statistiques"
                  icon="📊"
                  gradient="from-orange-400 to-red-600"
                  onClick={() => navigate('/dashboard/analytics')}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Navigation Mobile */}
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.6 }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-xl border-t border-white/20"
      >
        <div className="grid grid-cols-5 h-16">
          {[
            { name: 'Accueil', href: '/dashboard', icon: BarChart3, active: true },
            { name: 'Messages', href: '/dashboard/conversations', icon: MessageSquare, badge: waitingMessages },
            { name: 'Produits', href: '/dashboard/knowledge-base', icon: Package },
            { name: 'Stats', href: '/dashboard/analytics', icon: TrendingUp },
            { name: 'Réglages', href: '/dashboard/settings', icon: Settings }
          ].map((item) => (
            <motion.button
              key={item.name}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(item.href)}
              className={`
                relative flex flex-col items-center justify-center gap-1
                transition-colors duration-200
                ${item.active 
                  ? 'text-accent' 
                  : 'text-white/60 hover:text-white'
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
              {item.badge && item.badge > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-3 h-5 w-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center animate-pulse"
                >
                  {item.badge}
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>
      </motion.nav>

      {/* FAB Mobile */}
      <motion.button 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAddModal(true)}
        className="md:hidden fixed bottom-20 right-6 z-50 w-16 h-16 bg-gradient-primary rounded-2xl shadow-glow flex items-center justify-center hover:shadow-2xl transition-all duration-300"
      >
        <Plus className="h-8 w-8 text-white" />
      </motion.button>
      
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

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 8s infinite ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

// Composant Métrique Premium (Style Apple/Tesla)
interface PremiumMetricCardProps {
  title: string;
  value: number | string;
  trend?: number;
  icon: React.ComponentType<any>;
  gradient: string;
  glowColor: string;
  isRevenue?: boolean;
}

function PremiumMetricCard({ title, value, trend, icon: Icon, gradient, glowColor, isRevenue = false }: PremiumMetricCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      <Card className={`bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/20 transition-all duration-300 hover:shadow-2xl ${glowColor} hover:shadow-xl overflow-hidden relative`}>
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between mb-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
            {trend !== undefined && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`text-sm flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm ${
                  trend > 0 ? 'text-green-300 bg-green-500/20' : 
                  trend < 0 ? 'text-red-300 bg-red-500/20' : 
                  'text-white/60 bg-white/10'
                }`}
              >
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : null}
                {trend !== 0 && `${Math.abs(trend)}%`}
              </motion.span>
            )}
          </div>
          <p className={`font-bold text-white mb-2 ${isRevenue ? 'text-xl' : 'text-3xl'} group-hover:text-white transition-colors`}>
            {value}
          </p>
          <p className="text-white/60 text-sm group-hover:text-white/80 transition-colors">{title}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Composant Mini KPI
interface MiniKPICardProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<any>;
  color: string;
}

function MiniKPICard({ label, value, icon: Icon, color }: MiniKPICardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 text-center group"
    >
      <Icon className={`h-6 w-6 ${color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-white/60 text-xs">{label}</p>
    </motion.div>
  );
}

// Composant Action Rapide
interface QuickActionCardProps {
  label: string;
  icon: string;
  gradient: string;
  badge?: number;
  onClick: () => void;
}

function QuickActionCard({ label, icon, gradient, badge, onClick }: QuickActionCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group text-center"
    >
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl`} />
      
      <div className="relative z-10">
        <motion.div
          whileHover={{ scale: 1.2, rotate: 10 }}
          className="text-4xl mb-3"
        >
          {icon}
        </motion.div>
        <p className="text-sm font-semibold text-white group-hover:text-white transition-colors">
          {label}
        </p>
      </div>
      
      {badge && badge > 0 && (
        <motion.span 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse shadow-lg"
        >
          {badge}
        </motion.span>
      )}
    </motion.button>
  );
}

export default Dashboard;