import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { KBItem, SectorId } from '@/lib/types';
import { useUserStore } from '@/lib/store';
import { getConfig, getSectorFromString } from '@/lib/utils/sector-config';
import { AddItemModal } from '@/components/knowledge-base/AddItemModal';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Package,
  Tag
} from 'lucide-react';

export default function KnowledgeBase() {
  const navigate = useNavigate();
  const user = useUserStore(state => state.user);
  
  const [sector] = useState<SectorId>(getSectorFromString(user?.businessSector || 'commerce'));
  const [items, setItems] = useState<KBItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<KBItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KBItem | null>(null);

  const config = getConfig(sector);

  // Charger les items
  useEffect(() => {
    const stored = localStorage.getItem('whalix_kb_items');
    if (stored) {
      const parsedItems = JSON.parse(stored);
      setItems(parsedItems);
      setFilteredItems(parsedItems);
    }
  }, []);

  // Filtrer les items
  useEffect(() => {
    let filtered = items;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(item => item.tags.includes(selectedTag));
    }

    if (showAvailableOnly) {
      filtered = filtered.filter(item => item.availability);
    }

    setFilteredItems(filtered);
  }, [items, searchQuery, selectedTag, showAvailableOnly]);

  const handleSaveItem = (itemData: Omit<KBItem, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => {
    const now = new Date();
    
    if (editingItem) {
      // Modifier un item existant
      const updatedItems = items.map(item =>
        item.id === editingItem.id
          ? { ...item, ...itemData, updated_at: now }
          : item
      );
      setItems(updatedItems);
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
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      localStorage.setItem('whalix_kb_items', JSON.stringify(updatedItems));
    }
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    localStorage.setItem('whalix_kb_items', JSON.stringify(updatedItems));
  };

  const toggleAvailability = (itemId: string) => {
    const updatedItems = items.map(item =>
      item.id === itemId
        ? { ...item, availability: !item.availability, updated_at: new Date() }
        : item
    );
    setItems(updatedItems);
    localStorage.setItem('whalix_kb_items', JSON.stringify(updatedItems));
  };

  const getAllTags = () => {
    const allTags = items.flatMap(item => item.tags);
    return [...new Set(allTags)];
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString()} ${currency}`;
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'menu': return '🍽️';
      case 'product': return '📱';
      case 'service': return '🔧';
      case 'offer': return '🏨';
      default: return '📦';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Base de connaissances</h1>
              <p className="text-sm text-muted-foreground">
                {items.length} {config.itemLabel.toLowerCase()} • {config.label}
              </p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Rechercher dans les ${config.itemLabel.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Tags et filtres */}
              <div className="flex flex-wrap gap-2 items-center">
                <Button
                  variant={showAvailableOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                >
                  <Filter className="h-3 w-3 mr-1" />
                  Disponibles uniquement
                </Button>
                
                {getAllTags().slice(0, 6).map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des items */}
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {items.length === 0 ? 'Aucun item ajouté' : 'Aucun résultat'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {items.length === 0 
                  ? `Commencez par ajouter vos premiers ${config.itemLabel.toLowerCase()}`
                  : 'Essayez de modifier vos filtres de recherche'
                }
              </p>
              {items.length === 0 && (
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter le premier {config.itemLabel.toLowerCase()}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`h-full ${!item.availability ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getItemIcon(item.type)}</span>
                        <div>
                          <CardTitle className="text-base">{item.name}</CardTitle>
                          <p className="text-sm font-semibold text-primary">
                            {formatPrice(item.price, item.currency)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleAvailability(item.id)}
                          className="h-8 w-8"
                        >
                          {item.availability ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingItem(item)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    
                    {item.stock !== undefined && (
                      <div className="text-xs text-muted-foreground mb-2">
                        {sector === 'services' ? `Durée: ${item.stock}h` : `Stock: ${item.stock}`}
                      </div>
                    )}
                    
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{item.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'ajout/modification */}
      <AddItemModal
        isOpen={isAddModalOpen || editingItem !== null}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        sector={sector}
        editItem={editingItem}
      />
    </div>
  );
}