import { useState, useEffect } from 'react';
import { SectorId, KBItem } from '../types';

const DEMO_DATA: Record<SectorId, KBItem[]> = {
  restaurant: [
    { 
      id: 'demo_1', 
      business_id: 'demo',
      type: 'menu',
      name: 'Attiéké poisson', 
      price: 2500,
      currency: 'FCFA',
      tags: ['poisson', 'traditionnel', 'attiéké'],
      availability: true,
      description: 'Attiéké frais avec poisson braisé et sa sauce tomate',
      created_at: new Date(),
      updated_at: new Date()
    },
    { 
      id: 'demo_2',
      business_id: 'demo', 
      type: 'menu',
      name: 'Alloco poulet', 
      price: 2000,
      currency: 'FCFA',
      tags: ['poulet', 'alloco', 'plantain'],
      availability: true,
      description: 'Bananes plantain frites avec poulet braisé',
      created_at: new Date(),
      updated_at: new Date()
    },
    { 
      id: 'demo_3',
      business_id: 'demo',
      type: 'menu', 
      name: 'Garba', 
      price: 1000,
      currency: 'FCFA',
      tags: ['garba', 'thon', 'rapide'],
      availability: true,
      description: 'Attiéké avec thon et piment',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],
  commerce: [
    { 
      id: 'demo_1',
      business_id: 'demo',
      type: 'product', 
      name: 'iPhone 13', 
      price: 450000,
      currency: 'FCFA',
      tags: ['téléphone', 'apple', 'smartphone'],
      availability: true,
      stock: 5,
      created_at: new Date(),
      updated_at: new Date()
    },
    { 
      id: 'demo_2',
      business_id: 'demo',
      type: 'product', 
      name: 'Samsung A54', 
      price: 285000,
      currency: 'FCFA',
      tags: ['téléphone', 'samsung', 'android'],
      availability: true,
      stock: 8,
      created_at: new Date(),
      updated_at: new Date()
    }
  ],
  services: [
    { 
      id: 'demo_1',
      business_id: 'demo',
      type: 'service', 
      name: 'Dépannage climatiseur', 
      price: 15000,
      currency: 'FCFA',
      tags: ['climatisation', 'réparation', 'maintenance'],
      availability: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    { 
      id: 'demo_2',
      business_id: 'demo',
      type: 'service', 
      name: 'Installation split', 
      price: 35000,
      currency: 'FCFA',
      tags: ['climatisation', 'installation', 'split'],
      availability: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ],
  hospitality: [
    { 
      id: 'demo_1',
      business_id: 'demo',
      type: 'offer', 
      name: 'Chambre Standard', 
      price: 25000,
      currency: 'FCFA',
      tags: ['chambre', 'standard', 'nuit'],
      availability: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    { 
      id: 'demo_2',
      business_id: 'demo',
      type: 'offer', 
      name: 'Suite Deluxe', 
      price: 55000,
      currency: 'FCFA',
      tags: ['suite', 'deluxe', 'luxe'],
      availability: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]
};

export function useDemoData(sector: SectorId) {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [demoItems, setDemoItems] = useState<KBItem[]>([]);

  useEffect(() => {
    const visited = localStorage.getItem('whalix_visited');
    
    if (!visited) {
      // Première visite : injecter les données de démo
      localStorage.setItem('whalix_visited', 'true');
      localStorage.setItem('whalix_demo_mode', 'true');
      
      const items = DEMO_DATA[sector] || DEMO_DATA.commerce;
      localStorage.setItem('whalix_kb_items', JSON.stringify(items));
      
      setIsFirstVisit(true);
      setDemoItems(items);
      
      // Message de bienvenue
      const welcomeMessage = {
        id: 'welcome_1',
        at: new Date().toISOString(),
        customer: 'Assistant Whalix',
        customer_phone: 'system',
        last_message: 'Bienvenue ! J\'ai ajouté quelques exemples pour vous aider à démarrer. Vous pouvez les modifier ou supprimer à tout moment.',
        status: 'ai_replied' as const
      };
      
      localStorage.setItem('whalix_live_messages', JSON.stringify([welcomeMessage]));
    } else {
      // Charger les items existants
      const storedItems = localStorage.getItem('whalix_kb_items');
      if (storedItems) {
        setDemoItems(JSON.parse(storedItems));
      }
    }
  }, [sector]);

  return { isFirstVisit, demoItems };
}