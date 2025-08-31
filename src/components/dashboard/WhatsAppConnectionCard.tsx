import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBaileysConnection } from '@/lib/hooks/use-baileys-connection';
import { 
  MessageSquare, 
  QrCode, 
  CheckCircle, 
  Loader2, 
  Smartphone, 
  Zap,
  AlertCircle,
  RefreshCw,
  Settings,
  Server
} from 'lucide-react';

interface WhatsAppConnectionCardProps {
  restaurantId: string;
  onStatusChange?: (connected: boolean) => void;
}

export function WhatsAppConnectionCard({ restaurantId, onStatusChange }: WhatsAppConnectionCardProps) {
  const { 
    session, 
    isConnected, 
    hasQR, 
    isLoading, 
    error,
    connect,
    disconnect
  } = useBaileysConnection(restaurantId);

  useEffect(() => {
    onStatusChange?.(isConnected);
  }, [isConnected, onStatusChange]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Erreur connexion:', error);
    }
  };

  const getStatusBadge = () => {
    if (!session) return null;

    switch (session.status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connecté
          </Badge>
        );
      case 'qr_pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <QrCode className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case 'connecting':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Connexion...
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Erreur
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <MessageSquare className="h-3 w-3 mr-1" />
            Non connecté
          </Badge>
        );
    }
  };

  const renderConnectionStatus = () => {
    if (!session || session.status === 'idle') {
      return (
        <div className="text-center py-6">
          <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
            <Server className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Serveur WhatsApp Baileys</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Connectez votre WhatsApp Business via notre serveur Baileys local
          </p>
          
          <Alert className="mb-4 text-left">
            <Server className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Serveur requis :</strong> Démarrez le serveur Baileys avec <code className="bg-muted px-1 rounded">npm run whatsapp:start</code>
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connexion au serveur...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Connecter WhatsApp
              </>
            )}
          </Button>
        </div>
      );
    }

    if (session.status === 'qr_pending' && session.qrCode) {
      return (
        <div className="text-center py-6">
          <h3 className="text-lg font-semibold mb-4 text-primary">Scannez le QR Code Baileys</h3>
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-4 rounded-2xl border-2 border-primary/30 mb-6 inline-block shadow-lg"
          >
            <img 
              src={session.qrCode} 
              alt="QR Code WhatsApp à scanner" 
              className="w-56 h-56 object-contain"
              onError={(e) => {
                console.error('Erreur chargement QR code:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
          </motion.div>

          <div className="space-y-3 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2 justify-center">
              <Smartphone className="h-4 w-4" />
              <span>1. Ouvrez WhatsApp sur votre téléphone</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Settings className="h-4 w-4" />
              <span>2. Allez dans Paramètres → Appareils connectés</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <QrCode className="h-4 w-4" />
              <span>3. Scannez ce QR code</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleConnect}
            className="mt-4 w-full"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Nouveau QR Code
          </Button>
        </div>
      );
    }

    if (isConnected) {
      return (
        <div className="py-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-success/20 p-4 rounded-full w-fit mx-auto mb-4 text-center"
          >
            <CheckCircle className="h-8 w-8 text-success" />
          </motion.div>
          
          <h3 className="text-lg font-semibold mb-2 text-success text-center">
            WhatsApp Baileys Connecté !
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 text-center">
            Votre serveur Baileys est connecté et l'IA répond automatiquement
          </p>

          {session.phoneNumber && (
            <div className="bg-success/10 rounded-lg p-3 mb-4 border border-success/20">
              <p className="text-xs text-muted-foreground">Numéro connecté</p>
              <p className="font-mono text-sm text-success font-semibold">{session.phoneNumber}</p>
            </div>
          )}

          {session.lastConnected && (
            <p className="text-xs text-muted-foreground mb-4 text-center">
              Connecté le {new Date(session.lastConnected).toLocaleDateString('fr-FR')} à{' '}
              {new Date(session.lastConnected).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          )}

          {session.messageCount !== undefined && (
            <div className="bg-primary/10 rounded-lg p-3 mb-4 border border-primary/20">
              <p className="text-xs text-muted-foreground">Messages traités</p>
              <p className="font-bold text-primary">{session.messageCount}</p>
            </div>
          )}
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={() => {}}>
              <Settings className="h-4 w-4 mr-2" />
              Configurer
            </Button>
            <Button variant="destructive" size="sm" onClick={disconnect}>
              Déconnecter
            </Button>
          </div>
        </div>
      );
    }

    if (session.status === 'error' || error) {
      return (
        <div className="text-center py-6">
          <div className="bg-red-100 p-4 rounded-full w-fit mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-red-800">
            Erreur Serveur Baileys
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {error || session.error || 'Une erreur est survenue lors de la connexion'}
          </p>
          
          <Alert className="mb-4 text-left">
            <Server className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Vérifiez que le serveur Baileys fonctionne sur le port 3001
            </AlertDescription>
          </Alert>
          
          <Button onClick={handleConnect} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Server className="h-5 w-5" />
            Serveur WhatsApp Baileys
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent>
        {renderConnectionStatus()}

        {/* Informations sur le serveur Baileys */}
        {isConnected && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-semibold mb-3 text-sm">Serveur Baileys actif :</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Réponses automatiques</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>WebSocket temps réel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Sessions persistantes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>IA intégrée</span>
              </div>
            </div>
          </div>
        )}

        {/* Erreur serveur */}
        {error && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}