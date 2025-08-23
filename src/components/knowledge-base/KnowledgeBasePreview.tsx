
import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KBItem, SectorId } from "@/lib/types";
import { getConfig } from "@/lib/utils/sector-config";
import { Plus, Package, Eye, TrendingUp, AlertCircle } from "lucide-react";

interface KnowledgeBasePreviewProps {
  items: KBItem[];
  sector: SectorId;
  onAddItem: () => void;
  onManageItems: () => void;
}

export function KnowledgeBasePreview({ 
  items, 
  sector, 
  onAddItem, 
  onManageItems
}: KnowledgeBasePreviewProps) {
  const config = getConfig(sector);
  const availableItems = items.filter(item => item.availability);
  const outOfStockItems = items.filter(item => !item.availability);
  const recentItems = items.slice(0, 4);

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

  const getStatsInsight = () => {
    if (items.length === 0) return null;
    
    const avgPrice = items.reduce((sum, item) => sum + item.price, 0) / items.length;
    const popularTags = items.flatMap(item => item.tags).reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostPopularTag = Object.entries(popularTags).sort((a, b) => b[1] - a[1])[0];
    
    return {
      avgPrice,
      mostPopularTag: mostPopularTag?.[0],
      availabilityRate: (availableItems.length / items.length) * 100
    };
  };

  const stats = getStatsInsight();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Base de connaissances
            </CardTitle>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-muted-foreground">
                {items.length} {config.itemLabel.toLowerCase()}
              </p>
              {outOfStockItems.length > 0 && (
                <Badge variant="outline" className="text-xs text-orange-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {outOfStockItems.length} indispo
                </Badge>
              )}
              {stats && stats.availabilityRate < 80 && (
                <Badge variant="destructive" className="text-xs">
                  {Math.round(stats.availabilityRate)}% disponible
                </Badge>
              )}
            </div>
          </div>
          <Button size="sm" onClick={onAddItem} className="h-8">
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Aucun {config.itemLabel.toLowerCase()}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Ajoutez vos {config.itemLabel.toLowerCase()} pour que l'IA puisse mieux répondre aux clients
            </p>
            <Button size="sm" onClick={onAddItem}>
              <Plus className="h-4 w-4 mr-1" />
              Commencer
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Statistiques rapides */}
            {stats && (
              <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Prix moyen</p>
                  <p className="text-sm font-semibold">
                    {Math.round(stats.avgPrice).toLocaleString()} FCFA
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Disponibles</p>
                  <p className="text-sm font-semibold text-green-600">
                    {availableItems.length}/{items.length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Top catégorie</p>
                  <p className="text-sm font-semibold truncate">
                    {stats.mostPopularTag || '-'}
                  </p>
                </div>
              </div>
            )}

            {/* Items récents */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Récemment ajoutés</h4>
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {recentItems.length}
                </Badge>
              </div>
              
              {recentItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between p-2 bg-background border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-base">{getItemIcon(item.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-medium truncate">
                            {item.name}
                          </h5>
                          {!item.availability && (
                            <Badge variant="outline" className="text-xs text-orange-600">
                              Indispo
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-primary font-semibold">
                          {formatPrice(item.price, item.currency)}
                        </p>
                      </div>
                    </div>
                    
                    {item.tags.length > 0 && (
                      <div className="flex gap-1">
                        {item.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={onManageItems} className="flex-1">
                <Eye className="h-4 w-4 mr-1" />
                Gérer ({items.length})
              </Button>
              <Button size="sm" onClick={onAddItem}>
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
