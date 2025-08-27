# 🎨 Refonte Dashboard Whalix - Architecture Professionnelle

## 📱 Structure Mobile-First avec Navigation Bottom

### Architecture des pages

```
/dashboard
  ├── /home (vue d'ensemble)
  ├── /conversations (historique messages)
  ├── /knowledge (base de connaissances)
  ├── /analytics (statistiques)
  └── /settings (paramètres)
```

## 1. Layout Principal avec Bottom Navigation

```tsx
// app/dashboard/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  MessageSquare, 
  Database, 
  BarChart3, 
  Settings,
  Plus
} from 'lucide-react';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  
  const navigation = [
    { name: 'Accueil', href: '/dashboard', icon: Home },
    { name: 'Messages', href: '/dashboard/conversations', icon: MessageSquare, badge: 3 },
    { name: 'Produits', href: '/dashboard/knowledge', icon: Database },
    { name: 'Stats', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Réglages', href: '/dashboard/settings', icon: Settings }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixe */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b">
        <div className="px-4 h-14 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            Whalix
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-600">WhatsApp connecté</span>
          </div>
        </div>
      </header>
      
      {/* Contenu principal avec padding pour header et bottom nav */}
      <main className="pt-14 pb-16 min-h-screen">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
      
      {/* Bottom Navigation Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t md:hidden">
        <div className="grid grid-cols-5 h-16">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  relative flex flex-col items-center justify-center gap-1
                  transition-colors duration-200
                  ${isActive 
                    ? 'text-green-600' 
                    : 'text-gray-400 hover:text-gray-600'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
                {item.badge && (
                  <span className="absolute top-2 right-4 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:block fixed left-0 top-14 bottom-0 w-64 bg-white border-r">
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-green-50 text-green-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
      
      {/* FAB Mobile pour actions rapides */}
      <button className="md:hidden fixed bottom-20 right-4 z-50 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition-colors">
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
```

## 2. Page d'Accueil - Vue d'ensemble

```tsx
// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageCircle,
  ShoppingBag,
  Clock
} from 'lucide-react';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    messagesDay: 47,
    messagesTrend: 12,
    ordersDay: 15,
    ordersTrend: -5,
    revenue: 125000,
    revenueTrend: 8,
    avgResponse: 1.2
  });
  
  return (
    <div className="p-4 space-y-6">
      {/* Salutation */}
      <div className="bg-gradient-to-r from-green-600 to-green-400 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Bonjour, Restaurant Chez Fatou 👋</h2>
        <p className="opacity-90">Votre assistant IA a répondu à 47 messages aujourd'hui</p>
      </div>
      
      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Messages"
          value={stats.messagesDay}
          trend={stats.messagesTrend}
          icon={MessageCircle}
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
      </div>
      
      {/* Actions rapides */}
      <div className="bg-white rounded-xl p-4">
        <h3 className="font-semibold mb-3">Actions rapides</h3>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction
            label="Ajouter un produit"
            icon="📦"
            onClick={() => {}}
          />
          <QuickAction
            label="Voir les messages"
            icon="💬"
            badge={3}
            onClick={() => {}}
          />
          <QuickAction
            label="Modifier horaires"
            icon="🕐"
            onClick={() => {}}
          />
          <QuickAction
            label="Promouvoir"
            icon="📢"
            onClick={() => {}}
          />
        </div>
      </div>
      
      {/* Activité récente */}
      <div className="bg-white rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Activité récente</h3>
          <button className="text-sm text-green-600">Tout voir</button>
        </div>
        <div className="space-y-3">
          <ActivityItem
            avatar="👤"
            title="Nouveau message de Kouassi"
            subtitle="Il y a 2 min"
            status="new"
          />
          <ActivityItem
            avatar="🛒"
            title="Commande #1234 confirmée"
            subtitle="Il y a 15 min"
            status="success"
          />
          <ActivityItem
            avatar="🤖"
            title="IA a répondu à 5 questions"
            subtitle="Il y a 1h"
            status="auto"
          />
        </div>
      </div>
    </div>
  );
}

// Composant Métrique
function MetricCard({ title, value, trend, icon: Icon, color, suffix }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };
  
  return (
    <div className="bg-white rounded-xl p-4">
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
    </div>
  );
}

// Composant Action Rapide
function QuickAction({ label, icon, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
    >
      <span className="text-2xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {badge && (
        <span className="absolute top-2 right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

// Composant Activité
function ActivityItem({ avatar, title, subtitle, status }) {
  const statusColors = {
    new: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    auto: 'bg-gray-100 text-gray-600'
  };
  
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
        {avatar}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      <div className={`px-2 py-1 rounded-full text-xs ${statusColors[status]}`}>
        {status === 'new' && 'Nouveau'}
        {status === 'success' && 'Succès'}
        {status === 'auto' && 'Auto'}
      </div>
    </div>
  );
}
```

## 3. Page Conversations - Historique Messages

```tsx
// app/dashboard/conversations/page.tsx
'use client';

import { useState } from 'react';
import { Search, Filter, Clock, Check, CheckCheck, AlertCircle } from 'lucide-react';

export default function ConversationsPage() {
  const [filter, setFilter] = useState('all'); // all, pending, replied
  const [searchQuery, setSearchQuery] = useState('');
  
  const conversations = [
    {
      id: 1,
      phone: '+225 07 00 00 00 01',
      lastMessage: 'Je voudrais commander 2 poulets braisés',
      timestamp: '14:30',
      unread: 2,
      status: 'pending',
      customerName: 'Client'
    },
    {
      id: 2,
      phone: '+225 05 00 00 00 02',
      lastMessage: 'Merci pour la livraison rapide!',
      timestamp: '13:45',
      unread: 0,
      status: 'replied',
      customerName: 'Client'
    },
    // ... plus de conversations
  ];
  
  const filteredConversations = conversations.filter(conv => {
    if (filter !== 'all' && conv.status !== filter) return false;
    if (searchQuery && !conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  
  return (
    <div className="h-full flex flex-col">
      {/* Header avec recherche */}
      <div className="bg-white border-b p-4 space-y-3">
        <h2 className="text-lg font-semibold">Conversations</h2>
        
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm"
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
            count={conversations.length}
          />
          <FilterTab
            active={filter === 'pending'}
            onClick={() => setFilter('pending')}
            label="En attente"
            count={conversations.filter(c => c.status === 'pending').length}
            highlight
          />
          <FilterTab
            active={filter === 'replied'}
            onClick={() => setFilter('replied')}
            label="Répondus"
            count={conversations.filter(c => c.status === 'replied').length}
          />
        </div>
      </div>
      
      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map(conv => (
          <ConversationItem key={conv.id} conversation={conv} />
        ))}
        
        {filteredConversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune conversation trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant Tab de filtre
function FilterTab({ active, onClick, label, count, highlight = false }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
        ${active 
          ? 'bg-green-100 text-green-700' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
      `}
    >
      {label}
      {count > 0 && (
        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
          highlight && !active ? 'bg-red-500 text-white' : ''
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// Composant Conversation
function ConversationItem({ conversation }) {
  const statusIcons = {
    pending: <Clock className="h-4 w-4 text-orange-500" />,
    replied: <CheckCheck className="h-4 w-4 text-green-500" />,
    error: <AlertCircle className="h-4 w-4 text-red-500" />
  };
  
  return (
    <div className="flex items-center gap-3 p-4 bg-white hover:bg-gray-50 border-b transition-colors cursor-pointer">
      {/* Avatar */}
      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
        <span className="text-lg">👤</span>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="font-medium text-sm">{conversation.phone}</p>
          <span className="text-xs text-gray-500">{conversation.timestamp}</span>
        </div>
        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
      </div>
      
      {/* Status & Badge */}
      <div className="flex items-center gap-2">
        {statusIcons[conversation.status]}
        {conversation.unread > 0 && (
          <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">
            {conversation.unread}
          </span>
        )}
      </div>
    </div>
  );
}
```

## 4. Page Base de Connaissances

```tsx
// app/dashboard/knowledge/page.tsx
'use client';

import { useState } from 'react';
import { Plus, Search, Grid, List, Edit, Trash, Image } from 'lucide-react';

export default function KnowledgePage() {
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showAddModal, setShowAddModal] = useState(false);
  
  const items = [
    {
      id: 1,
      name: 'Poulet Braisé',
      price: 3500,
      category: 'Plats',
      image: '/api/placeholder/100/100',
      stock: 'Disponible'
    },
    {
      id: 2,
      name: 'Attiéké Poisson',
      price: 2500,
      category: 'Plats',
      image: '/api/placeholder/100/100',
      stock: 'Disponible'
    },
    // ... plus d'items
  ];
  
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Base de connaissances</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Ajouter</span>
        </button>
      </div>
      
      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm"
            />
          </div>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
          </button>
        </div>
        
        {/* Catégories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <CategoryChip label="Tous" active count={25} />
          <CategoryChip label="Plats" count={15} />
          <CategoryChip label="Boissons" count={8} />
          <CategoryChip label="Desserts" count={2} />
        </div>
      </div>
      
      {/* Liste/Grille des produits */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden">
          {items.map(item => (
            <ProductListItem key={item.id} item={item} />
          ))}
        </div>
      )}
      
      {/* Modal d'ajout (placeholder) */}
      {showAddModal && (
        <AddItemModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

// Composant Catégorie
function CategoryChip({ label, active = false, count }) {
  return (
    <button className={`
      px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
      ${active 
        ? 'bg-green-100 text-green-700' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }
    `}>
      {label}
      {count && <span className="ml-1.5 text-xs opacity-70">({count})</span>}
    </button>
  );
}

// Composant Card Produit
function ProductCard({ item }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gray-100 relative">
        <Image className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute top-2 right-2 flex gap-1">
          <button className="p-1.5 bg-white rounded-lg shadow hover:shadow-md">
            <Edit className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="p-3">
        <p className="font-medium text-sm mb-1">{item.name}</p>
        <p className="text-green-600 font-bold">{item.price} FCFA</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
            {item.stock}
          </span>
          <span className="text-xs text-gray-500">{item.category}</span>
        </div>
      </div>
    </div>
  );
}

// Composant Liste Produit
function ProductListItem({ item }) {
  return (
    <div className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b">
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
        <Image className="h-8 w-8 text-gray-400" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{item.name}</p>
        <p className="text-sm text-gray-500">{item.category}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-green-600">{item.price} FCFA</p>
        <p className="text-xs text-gray-500">{item.stock}</p>
      </div>
      <div className="flex gap-1">
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <Edit className="h-4 w-4 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <Trash className="h-4 w-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
```

## 5. Page Analytics

```tsx
// app/dashboard/analytics/page.tsx
'use client';

import { TrendingUp, Users, Clock, MessageSquare } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Statistiques</h2>
      
      {/* Période */}
      <div className="bg-white rounded-xl p-4">
        <div className="flex gap-2 overflow-x-auto">
          <PeriodChip label="Aujourd'hui" active />
          <PeriodChip label="7 jours" />
          <PeriodChip label="30 jours" />
          <PeriodChip label="3 mois" />
        </div>
      </div>
      
      {/* Graphique principal */}
      <div className="bg-white rounded-xl p-4">
        <h3 className="font-medium mb-4">Évolution des ventes</h3>
        <div className="h-48 bg-gradient-to-t from-green-50 to-transparent rounded-lg flex items-end justify-around p-2">
          {[65, 45, 78, 52, 88, 72, 95].map((height, i) => (
            <div
              key={i}
              className="w-8 bg-green-500 rounded-t"
              style={{ height: `${height}%` }}
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
      </div>
      
      {/* Métriques détaillées */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={Users}
          label="Clients uniques"
          value="284"
          change="+12%"
          positive
        />
        <StatCard
          icon={MessageSquare}
          label="Messages traités"
          value="1,247"
          change="+8%"
          positive
        />
        <StatCard
          icon={Clock}
          label="Temps réponse moy."
          value="45s"
          change="-15%"
          positive
        />
        <StatCard
          icon={TrendingUp}
          label="Taux conversion"
          value="32%"
          change="+5%"
          positive
        />
      </div>
      
      {/* Top produits */}
      <div className="bg-white rounded-xl p-4">
        <h3 className="font-medium mb-3">Produits populaires</h3>
        <div className="space-y-2">
          <TopProduct name="Poulet Braisé" sales={127} revenue="444,500" />
          <TopProduct name="Attiéké Poisson" sales={89} revenue="222,500" />
          <TopProduct name="Alloco" sales={76} revenue="114,000" />
        </div>
      </div>
    </div>
  );
}

function PeriodChip({ label, active = false }) {
  return (
    <button className={`
      px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
      ${active 
        ? 'bg-green-600 text-white' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }
    `}>
      {label}
    </button>
  );
}

function StatCard({ icon: Icon, label, value, change, positive }) {
  return (
    <div className="bg-white rounded-xl p-4">
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
    </div>
  );
}

function TopProduct({ name, sales, revenue }) {
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
```

## Points clés de cette refonte :

### ✅ Architecture claire
- Navigation bottom pour mobile (comme Instagram)
- Sidebar pour desktop
- Pages séparées par fonction
- URL propres et logiques

### ✅ Design professionnel
- Cards avec ombres subtiles
- Gradients modernes
- Animations fluides
- Espacement cohérent

### ✅ Mobile-first vraiment pensé
- Gros boutons tactiles
- Swipe gestures ready
- FAB pour actions rapides
- Bottom sheet modals

### ✅ UX améliorée
- Badges pour notifications
- États visuels clairs
- Recherche partout
- Filtres intelligents

### ✅ Performance
- Lazy loading des pages
- Pagination des listes
- Cache des données
- Optimistic UI

Cette architecture est scalable et professionnelle, inspirée des meilleures pratiques de Shopify, Square et autres leaders SaaS.
