import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KBItem, SectorId } from "@/lib/types";
import { getConfig } from "@/lib/utils/sector-config";
import { Plus, Package, Eye, Edit, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KnowledgeBaseCardProps {
  items: KBItem[];
  sector: SectorId;
  onAddItem: () => void;
  onManageItems: () => void;
  onEditItem?: (item: KBItem) => void;
}

export function KnowledgeBaseCard({ 
  items, 
  sector, 
  onAddItem, 
  onManageItems,
  onEditItem 
}: KnowledgeBaseCardProps) {
  const config = getConfig(sector);
  const availableItems = items.filter(item => item.availability);
  const outOfStockItems = items.filter(item => !item.availability);

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString()} ${currency}`;
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'menu':
        return '🍽️';
      case 'product':
        return '📱';
      case 'service':
        return '🔧';
      case 'offer':
        return '🏨';
      default:
        return '📦';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Base de connaissances</CardTitle>
            <p className="text-sm text-muted-foreground">
              {items.length} {config.itemLabel.toLowerCase()}
              {availableItems.length !== items.length && (
                <span className="text-orange-600 ml-1">
                  • {outOfStockItems.length} indisponible{outOfStockItems.length > 1 ? 's' : ''}
                </span>
              )}
            </p>
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
              Ajoutez vos premiers {config.itemLabel.toLowerCase()} pour que l'IA puisse répondre aux clients
            </p>
            <Button size="sm" onClick={onAddItem}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter le premier
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Items récents */}
            <div className="space-y-2">
              {items.slice(0, 3).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-lg">{getItemIcon(item.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {item.name}
                          </h4>
                          {!item.availability && (
                            <Badge variant="secondary" className="text-xs">
                              Indispo
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm font-semibold text-primary">
                            {formatPrice(item.price, item.currency)}
                          </p>
                          {item.stock !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              Stock: {item.stock}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {onEditItem && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditItem(item)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={onManageItems} className="flex-1">
                <Eye className="h-4 w-4 mr-1" />
                Voir tout ({items.length})
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