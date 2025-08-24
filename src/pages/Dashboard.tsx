import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardMobile } from '@/components/dashboard/DashboardMobile';
import { AddItemModal } from '@/components/knowledge-base/AddItemModal';
import { useUserStore, BusinessSector } from '@/lib/store';
import { useDemoData } from '@/lib/hooks/use-demo-data';
import { useLiveFeed } from '@/lib/hooks/use-live-feed';
import { getSectorFromString } from '@/lib/utils/sector-config';
import { SectorId, KBItem, DashboardMetrics } from '@/lib/types';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useUserStore(state => state.isAuthenticated());
  const user = useUserStore(state => state.user);
  
  const [sector, setSector] = useState<SectorId>('commerce');
  const [kbItems, setKbItems] = useState<KBItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<KBItem | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    orders_today: 0,
    reservations_today: 0,
    quotes_today: 0,
    messages_waiting: 0,
    avg_response_min: 0,
    revenue_today: 0
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
  
  // Charger les métriques
  useEffect(() => {
    const loadMetrics = async () => {
      // Mode démo avec données réalistes
      setMetrics({
        orders_today: Math.floor(Math.random() * 20) + 5,
        reservations_today: Math.floor(Math.random() * 10) + 2,
        quotes_today: Math.floor(Math.random() * 5) + 1,
        messages_waiting: messages.filter(m => m.status === 'waiting').length,
        avg_response_min: Math.floor(Math.random() * 10) + 1,
        revenue_today: Math.floor(Math.random() * 100000) + 50000,
        vs_yesterday: {
          orders: (Math.random() - 0.5) * 0.4, // -20% à +20%
          revenue: (Math.random() - 0.5) * 0.4,
          messages: (Math.random() - 0.5) * 0.4
        }
      });
    };
    
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, [messages]);
  
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
        navigate('/knowledge-base');
        break;
      case 'inbox':
        navigate('/messages');
        break;
      case 'view-orders':
        navigate('/orders');
        break;
      case 'view-appointments':
        navigate('/appointments');
        break;
      case 'calendar':
        navigate('/calendar');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        console.log('Action:', actionId);
    }
  };
  
  const handleOpenChat = (chatId: string) => {
    navigate(`/messages/${chatId}`);
  };
  if (!user) {
    return null;
  }

  return (
    <>
      <DashboardMobile
        sector={sector}
        metrics={metrics}
        live={messages}
        kbItems={kbItems}
        onAction={handleAction}
        onOpenChat={handleOpenChat}
      />
      
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
      
      {/* Indicateur de connexion */}
      {!isConnected && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-yellow-500/90 text-xs text-white px-3 py-1 rounded-full">
            Mode hors ligne
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
