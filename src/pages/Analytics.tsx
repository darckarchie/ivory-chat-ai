import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  MessageSquare,
  ShoppingBag,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

const Analytics = () => {
  const stats = {
    messagesDay: 47,
    messagesTrend: 12,
    ordersDay: 15,
    ordersTrend: -5,
    revenue: 125000,
    revenueTrend: 8,
    avgResponse: 1.2,
    uniqueCustomers: 284,
    customersTrend: 15,
    conversionRate: 32,
    conversionTrend: 5
  };

  const topProducts = [
    { name: 'Poulet Braisé', sales: 127, revenue: '444,500' },
    { name: 'Attiéké Poisson', sales: 89, revenue: '222,500' },
    { name: 'Alloco', sales: 76, revenue: '114,000' },
    { name: 'Garba', sales: 45, revenue: '45,000' },
    { name: 'Riz sauce', sales: 32, revenue: '48,000' }
  ];

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
        </motion.div>
        
        {/* Période */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2 overflow-x-auto">
                <PeriodChip label="Aujourd'hui" active />
                <PeriodChip label="7 jours" />
                <PeriodChip label="30 jours" />
                <PeriodChip label="3 mois" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Graphique principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Évolution des ventes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gradient-to-t from-primary/10 to-transparent rounded-lg flex items-end justify-around p-2">
                {[65, 45, 78, 52, 88, 72, 95].map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                    className="w-8 bg-primary rounded-t"
                  />
                ))}
              </div>
              <div className="flex justify-around mt-2 text-xs text-gray-500">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mer</span>
                <span>Jeu</span>
                <span>Ven</span>
                <span>Sam</span>
                <span>Dim</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Métriques détaillées */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          <MetricCard
            title="Messages"
            value={stats.messagesDay}
            trend={stats.messagesTrend}
            icon={MessageSquare}
            color="blue"
          />
          <MetricCard
            title="Commandes"
            value={stats.ordersDay}
            trend={stats.ordersTrend}
            icon={ShoppingBag}
            color="green"
          />
          <MetricCard
            title="Revenus"
            value={`${(stats.revenue / 1000).toFixed(0)}k`}
            trend={stats.revenueTrend}
            icon={TrendingUp}
            color="purple"
            suffix="FCFA"
          />
          <MetricCard
            title="Temps réponse"
            value={stats.avgResponse}
            icon={Clock}
            color="orange"
            suffix="min"
          />
        </motion.div>

        {/* Métriques supplémentaires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4"
        >
          <StatCard
            icon={Users}
            label="Clients uniques"
            value="284"
            change="+12%"
            positive
          />
          <StatCard
            icon={TrendingUp}
            label="Taux conversion"
            value="32%"
            change="+5%"
            positive
          />
        </motion.div>
        
        {/* Top produits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Produits populaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <TopProduct 
                    key={index}
                    name={product.name} 
                    sales={product.sales} 
                    revenue={product.revenue} 
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

interface MetricCardProps {
  title: string;
  value: number | string;
  trend?: number;
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'purple' | 'orange';
  suffix?: string;
}

function MetricCard({ title, value, trend, icon: Icon, color, suffix }: MetricCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-2 rounded-lg ${colors[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
          {trend && (
            <span className={`text-xs flex items-center gap-0.5 ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold">
          {value}
          {suffix && <span className="text-sm font-normal text-gray-500 ml-1">{suffix}</span>}
        </p>
        <p className="text-xs text-gray-600 mt-1">{title}</p>
      </CardContent>
    </Card>
  );
}

interface PeriodChipProps {
  label: string;
  active?: boolean;
}

function PeriodChip({ label, active = false }: PeriodChipProps) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      className="whitespace-nowrap"
    >
      {label}
    </Button>
  );
}

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

interface StatCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

function StatCard({ icon: Icon, label, value, change, positive }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Icon className="h-4 w-4 text-gray-600" />
          </div>
          <span className={`text-xs ${positive ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-gray-600 mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

interface TopProductProps {
  name: string;
  sales: number;
  revenue: string;
}

function TopProduct({ name, sales, revenue }: TopProductProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium text-sm">{name}</p>
        <p className="text-xs text-gray-500">{sales} ventes</p>
      </div>
      <p className="font-bold text-sm">{revenue} FCFA</p>
    </div>
  );
}

export default Analytics;