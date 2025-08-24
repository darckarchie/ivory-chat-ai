import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { KBItem, SectorId } from '@/lib/types';
import { getConfig } from '@/lib/utils/sector-config';
import { X, Plus, Upload, Tag } from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<KBItem, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => void;
  sector: SectorId;
  editItem?: KBItem | null;
}

export function AddItemModal({ isOpen, onClose, onSave, sector, editItem }: AddItemModalProps) {
  const config = getConfig(sector);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    currency: 'FCFA',
    description: '',
    availability: true,
    stock: undefined as number | undefined,
    sku: '',
    tags: [] as string[],
    image_url: '',
    popular_queries: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [newQuery, setNewQuery] = useState('');

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name,
        price: editItem.price,
        currency: editItem.currency,
        description: editItem.description || '',
        availability: editItem.availability,
        stock: editItem.stock,
        sku: editItem.sku || '',
        tags: editItem.tags,
        image_url: editItem.image_url || '',
        popular_queries: editItem.popular_queries || []
      });
    } else {
      setFormData({
        name: '',
        price: 0,
        currency: 'FCFA',
        description: '',
        availability: true,
        stock: undefined,
        sku: '',
        tags: [],
        image_url: '',
        popular_queries: []
      });
    }
  }, [editItem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type: config.itemType as any,
      ...formData
    });
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addQuery = () => {
    if (newQuery.trim() && !formData.popular_queries.includes(newQuery.trim())) {
      setFormData(prev => ({
        ...prev,
        popular_queries: [...prev.popular_queries, newQuery.trim()]
      }));
      setNewQuery('');
    }
  };

  const removeQuery = (queryToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      popular_queries: prev.popular_queries.filter(query => query !== queryToRemove)
    }));
  };

  const getSectorFields = () => {
    switch (sector) {
      case 'restaurant':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingrédients</Label>
              <Textarea
                id="ingredients"
                placeholder="Liste des ingrédients principaux..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  placeholder="Ex: Entrée, Plat, Dessert"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prep-time">Temps de préparation (min)</Label>
                <Input
                  id="prep-time"
                  type="number"
                  placeholder="20"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value ? parseInt(e.target.value) : undefined }))}
                />
              </div>
            </div>
          </>
        );
      
      case 'commerce':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU/Référence</Label>
                <Input
                  id="sku"
                  placeholder="REF-001"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock disponible</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="10"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value ? parseInt(e.target.value) : undefined }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description produit</Label>
              <Textarea
                id="description"
                placeholder="Caractéristiques, dimensions, garantie..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </>
        );
      
      case 'services':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Durée (heures)</Label>
                <Input
                  id="duration"
                  type="number"
                  step="0.5"
                  placeholder="2"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value ? parseFloat(e.target.value) : undefined }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Type de service</Label>
                <Input
                  id="category"
                  placeholder="Ex: Réparation, Installation"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description de la prestation</Label>
              <Textarea
                id="description"
                placeholder="Détails du service, matériel inclus, garantie..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </>
        );
      
      case 'hospitality':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacité (personnes)</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="2"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value ? parseInt(e.target.value) : undefined }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-type">Type d'hébergement</Label>
                <Input
                  id="room-type"
                  placeholder="Ex: Chambre, Suite, Villa"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amenities">Équipements inclus</Label>
              <Textarea
                id="amenities"
                placeholder="WiFi, Climatisation, Petit-déjeuner..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editItem ? 'Modifier' : 'Ajouter'} {config.itemLabel.toLowerCase()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                required
                placeholder={`Nom du ${config.itemLabel.toLowerCase()}`}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix *</Label>
                <Input
                  id="price"
                  type="number"
                  required
                  placeholder="0"
                  value={formData.price || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                />
              </div>
            </div>

            {/* Image */}
            <div className="space-y-2">
              <Label htmlFor="image">Image (URL)</Label>
              <div className="flex gap-2">
                <Input
                  id="image"
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                />
                <Button type="button" variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Champs spécifiques au secteur */}
          {getSectorFields()}

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter un tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" size="icon" variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Questions fréquentes */}
          <div className="space-y-2">
            <Label>Questions fréquentes des clients</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: C'est épicé ?"
                value={newQuery}
                onChange={(e) => setNewQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQuery())}
              />
              <Button type="button" size="icon" variant="outline" onClick={addQuery}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {formData.popular_queries.map((query) => (
                <div key={query} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                  <span>{query}</span>
                  <button
                    type="button"
                    onClick={() => removeQuery(query)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Disponibilité */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <Label htmlFor="availability" className="text-sm font-medium">
                Disponible
              </Label>
              <p className="text-xs text-muted-foreground">
                L'IA pourra proposer cet item aux clients
              </p>
            </div>
            <Switch
              id="availability"
              checked={formData.availability}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, availability: checked }))}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1">
              {editItem ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}