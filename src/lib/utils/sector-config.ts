import { SectorId } from '../types';

export const sectorConfig = {
  restaurant: {
    label: 'Restaurant & Alimentation',
    icon: 'utensils',
    primaryMetric: 'orders_today',
    primaryLabel: 'Commandes aujourd\'hui',
    secondaryMetric: 'reservations_today',
    secondaryLabel: 'Réservations',
    itemType: 'menu',
    itemLabel: 'Menu',
    actions: [
      { id: 'view-orders', label: 'Voir commandes', icon: 'receipt' },
      { id: 'add-item', label: 'Ajouter plat', icon: 'plus' },
      { id: 'opening-hours', label: 'Horaires', icon: 'clock' }
    ],
    quickReplies: [
      'Nous sommes ouverts de 8h à 22h',
      'Livraison disponible dans un rayon de 5km',
      'Menu du jour disponible à midi'
    ]
  },
  commerce: {
    label: 'Commerce & E-shop',
    icon: 'shopping-bag',
    primaryMetric: 'orders_today',
    primaryLabel: 'Commandes aujourd\'hui',
    secondaryMetric: 'quotes_today',
    secondaryLabel: 'Devis',
    itemType: 'product',
    itemLabel: 'Produits',
    actions: [
      { id: 'view-orders', label: 'Voir commandes', icon: 'receipt' },
      { id: 'add-product', label: 'Ajouter produit', icon: 'plus' },
      { id: 'stock', label: 'Stocks', icon: 'package' }
    ],
    quickReplies: [
      'Livraison sous 24-48h',
      'Paiement à la livraison disponible',
      'Retour gratuit sous 7 jours'
    ]
  },
  services: {
    label: 'Services Professionnels',
    icon: 'wrench',
    primaryMetric: 'reservations_today',
    primaryLabel: 'RDV aujourd\'hui',
    secondaryMetric: 'quotes_today',
    secondaryLabel: 'Devis',
    itemType: 'service',
    itemLabel: 'Prestations',
    actions: [
      { id: 'view-appointments', label: 'Voir RDV', icon: 'calendar' },
      { id: 'new-quote', label: 'Nouveau devis', icon: 'file-text' },
      { id: 'calendar', label: 'Calendrier', icon: 'calendar-days' }
    ],
    quickReplies: [
      'Devis gratuit sous 24h',
      'Intervention rapide possible',
      'Garantie 1 an sur nos prestations'
    ]
  },
  hospitality: {
    label: 'Hôtellerie & Réservations',
    icon: 'bed',
    primaryMetric: 'reservations_today',
    primaryLabel: 'Réservations aujourd\'hui',
    secondaryMetric: 'occupancy_rate',
    secondaryLabel: 'Taux d\'occupation',
    itemType: 'offer',
    itemLabel: 'Offres',
    actions: [
      { id: 'view-reservations', label: 'Réservations', icon: 'book' },
      { id: 'availability', label: 'Disponibilités', icon: 'calendar-check' },
      { id: 'calendar', label: 'Calendrier', icon: 'calendar' }
    ],
    quickReplies: [
      'Chambres disponibles ce soir',
      'Petit-déjeuner inclus',
      'Check-in à partir de 14h'
    ]
  }
} as const;

export function getConfig(sector: SectorId) {
  return sectorConfig[sector];
}

export function getSectorFromString(sectorStr: string): SectorId {
  const validSectors: SectorId[] = ['restaurant', 'commerce', 'services', 'hospitality'];
  return validSectors.includes(sectorStr as SectorId) ? sectorStr as SectorId : 'commerce';
}