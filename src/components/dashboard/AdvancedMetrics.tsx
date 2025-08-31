import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  MessageSquare,
  Clock,
  Target,
  Zap,
  Calendar,
  MapPin
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AdvancedMetricsProps {
  sector: 'restaurant' | 'commerce' | 'services' | 'hospitality';
}

export function AdvancedMetrics({ sector }: AdvancedMetricsProps) {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [metrics, setMetrics] = useState({
    // Ventes
    revenue_today: 285000,
    revenue_yesterday: 195000,
    orders_today: 23,
    orders_yesterday: 18,
    avg_order_value: 12391,
    conversion_rate: 3.2,
    
    // WhatsApp
    messages_today: 47,
    messages_waiting: 3,
    ai_response_time: 2.1,
    ai_success_rate: 94.5,
    
    // Clients
    new_customers_today: 8,
    total_customers: 284,
    customer_satisfaction: 4.7,
    repeat_rate: 68
  });

  // Données pour graphiques
  const salesData = [
    { day: 'Lun', revenue: 180000, orders: 15 },
    { day: 'Mar', revenue: 220000, orders: 18 },
    { day: 'Mer', revenue: 195000, orders: 16 },
    { day: 'Jeu', revenue: 285000, orders: 23 },
    { day: 'Ven', revenue: 310000, orders: 25 },
    { day: 'Sam', revenue: 420000, orders: 34 },
    { day: 'Dim', revenue: 380000, orders: 31 }
  ];

  const messagesByHour = [
    { hour: '8h', messages: 5, ai: 4 },
    { hour: '10h', messages: 8, ai: 7 },
    { hour: '12h', messages: 15, ai: 13 },
    { hour: '14h', messages: 12, ai: 11 },
    { hour: '16h', messages: 9, ai: 8 },
    { hour: '18h', messages: 18, ai: 16 },
    { hour: '20h', messages: 14, ai: 12 }
  ];

  const customerZones = [
    { name: 'Cocody', value: 35, color: '#14b8a6' },
    { name: 'Plateau', value: 28, color: '#f97316' },
    { name: 'Yopougon', value: 22, color: '#3b82f6' },
    { name: 'Marcory', value: 15, color: '#8b5cf6' }
  ];

  const calculateTrend = (today: number, yesterday: number) => {
    if (yesterday === 0) return 0;
    return ((today - yesterday) / yesterday) * 100;
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  const MetricCard = ({ 
    title, 
    value, 
    trend, 
    icon: Icon, 
    color, 
    bgColor,
    suffix = '',
    prefix = ''
  }: any) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className="text-xl font-bold text-foreground">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
            
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                ) : null}
                <span className={`text-xs ${
                  trend > 0 ? 'text-green-600' : 
                  trend < 0 ? 'text-red-600' : 'text-muted-foreground'
                }`}>
                  {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          
          <div className={`p-3 rounded-full ${bgColor}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Sélecteur de période */}
      <div className="flex gap-2">
        {(['today', 'week', 'month'] as const).map((period) => (
          <Button
            key={period}
            variant={timeRange === period ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(period)}
          >
            {period === 'today' ? "Aujourd'hui" : 
             period === 'week' ? '7 jours' : '30 jours'}
          </Button>
        ))}
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Chiffre d'affaires"
          value={metrics.revenue_today}
          trend={calculateTrend(metrics.revenue_today, metrics.revenue_yesterday)}
          icon={DollarSign}
          color="text-green-600"
          bgColor="bg-green-50"
          suffix=" FCFA"
        />
        
        <MetricCard
          title="Commandes"
          value={metrics.orders_today}
          trend={calculateTrend(metrics.orders_today, metrics.orders_yesterday)}
          icon={ShoppingCart}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        
        <MetricCard
          title="Nouveaux clients"
          value={metrics.new_customers_today}
          icon={Users}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        
        <MetricCard
          title="Messages IA"
          value={metrics.messages_today}
          icon={Zap}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>

      {/* Graphiques */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Évolution des ventes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Évolution des ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={salesData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#14b8a6" 
                  strokeWidth={3}
                  dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Messages par heure */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Messages WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={messagesByHour}>
                <XAxis dataKey="hour" />
                <YAxis />
                <Bar dataKey="messages" fill="#3b82f6" />
                <Bar dataKey="ai" fill="#14b8a6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Métriques détaillées */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Performance IA */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Taux de succès</span>
              <span className="font-bold text-green-600">{metrics.ai_success_rate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Temps de réponse</span>
              <span className="font-bold">{metrics.ai_response_time}s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Messages traités</span>
              <span className="font-bold text-primary">{metrics.messages_today}</span>
            </div>
          </CardContent>
        </Card>

        {/* Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total clients</span>
              <span className="font-bold">{metrics.total_customers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Satisfaction</span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-yellow-600">{metrics.customer_satisfaction}</span>
                <span className="text-xs text-muted-foreground">/5</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Taux fidélité</span>
              <span className="font-bold text-blue-600">{metrics.repeat_rate}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Zones géographiques */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Zones Abidjan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={customerZones}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  dataKey="value"
                >
                  {customerZones.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {customerZones.map((zone) => (
                <div key={zone.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: zone.color }}
                    />
                    <span>{zone.name}</span>
                  </div>
                  <span className="font-medium">{zone.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes et insights */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Insights IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">🔥 Opportunités détectées</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 8 clients demandent la livraison → Promouvoir service livraison</li>
                <li>• "Attiéké poisson" très demandé → Augmenter stock</li>
                <li>• Pic de messages à 18h → Optimiser réponses</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">📈 Recommandations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ajouter menu végétarien (5 demandes)</li>
                <li>• Proposer paiement mobile money</li>
                <li>• Créer offre "happy hour" 16h-18h</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}