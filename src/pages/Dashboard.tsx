import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ConversationsList } from '@/components/dashboard/ConversationsList';
import { KnowledgeBasePreview } from '@/components/knowledge-base/KnowledgeBasePreview';
import { WhatsAppConnectionCard } from '@/components/dashboard/WhatsAppConnectionCard';
import { AddItemModal } from '@/components/knowledge-base/AddItemModal';
import { useUserStore, BusinessSector } from '@/lib/store';
import { useDemoData } from '@/lib/hooks/use-demo-data';
import { useLiveFeed } from '@/lib/hooks/use-live-feed';
import { getSectorFromString } from '@/lib/utils/sector-config';
import { SectorId, KBItem, DashboardMetrics } from '@/lib/types';
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useUserStore(state => state.isAuthenticated());
  const user = useUserStore(state => state.user);
  
  const [sector, setSector] = useState<SectorId>('commerce');
  const [kbItems, setKbItems] = useState<KBItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<KBItem | null>(null);
  const [whatsappConnected, setWhatsappConnected] = useState(false);

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
  
  const handleOpenChat = (chatId: string) => {
    navigate(`/dashboard/conversations/${chatId}`);
  };
  if (!user) {
    return null;
  }

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
            Votre assistant IA est {whatsappConnected ? 'actif' : 'en attente de connexion'}
          </p>
        </motion.div>

        {/* WhatsApp Connection */}
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
        
        {/* Conversations Overview */}
        <ConversationsList 
          messages={messages}
          onOpenChat={handleOpenChat}
        />
        
        {/* Knowledge Base Preview */}
        <KnowledgeBasePreview
          items={kbItems}
          sector={sector}
          onAddItem={() => setShowAddModal(true)}
          onManageItems={() => navigate('/dashboard/knowledge-base')}
        />
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

export default Dashboard;