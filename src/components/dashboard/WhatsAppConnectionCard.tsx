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
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const BACKEND_URL = 'https://whalix-server-railway-production.up.railway.app';

  useEffect(() => {
    onStatusChange?.(session?.status === 'connected');
  }, [session?.status, onStatusChange]);

  const checkServerHealth = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const createSession = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }
      
      const data = await response.json();
      setSession(data);
      
      // Commencer à vérifier le statut
      if (data.sessionId) {
        startStatusPolling(data.sessionId);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const checkSessionStatus = async (sessionId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/session/${sessionId}/status`);
      if (response.ok) {
        const data = await response.json();
        setSession(data);
        return data;
      }
    } catch (error) {
      console.error('Erreur vérification statut:', error);
    }
    return null;
  };

  const startStatusPolling = (sessionId: string) => {
    const interval = setInterval(async () => {
      const status = await checkSessionStatus(sessionId);
      if (status?.status === 'connected' || status?.status === 'error') {
        clearInterval(interval);
      }
    }, 3000);
    
    // Arrêter après 2 minutes
    setTimeout(() => clearInterval(interval), 120000);
  };

  const handleConnect = async () => {
    const isHealthy = await checkServerHealth();
    if (!isHealthy) {
      setError('Serveur backend indisponible');
      return;
    }
    
    await createSession();
  };

  const handleDisconnect = () => {
    setSession(null);
    setError(null);
  };

  const getStatusBadge = () => {
    if (!session) return null;

    switch (session.status) {
      case 'connected':
        return (
          <Badge className="bg-success/20 text-success border-success/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connecté
          </Badge>
        );
      case 'qr_pending':
        return (
          <Badge className="bg-warning/20 text-warning border-warning/30">
            <QrCode className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case 'connecting':
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30">
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
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-primary/10 p-6 rounded-2xl w-fit mx-auto mb-6"
          >
            <Server className="h-12 w-12 text-primary" />
          </motion.div>
          
          <h3 className="text-xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
            Assistant WhatsApp IA
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Connectez votre WhatsApp Business pour activer l'assistant IA automatique
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full bg-gradient-primary hover:shadow-glow"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Activer l'IA WhatsApp
                </>
              )}
            </Button>
          </div>
          
          {error && (
            <Alert className="mt-4 bg-destructive/5 border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      );
    }

    if (session?.status === 'qr_pending' && session?.qrCode) {
      return (
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6"
          >
            <h3 className="text-xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Scannez le QR Code WhatsApp
            </h3>
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-2xl border-2 border-primary/30 mb-6 inline-block shadow-glow"
            >
              <img 
                src={session.qrCode} 
                alt="QR Code WhatsApp" 
                className="w-64 h-64 object-contain"
                onError={(e) => {
                  console.error('Erreur chargement QR code:', e);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </motion.div>
          </motion.div>

          <div className="space-y-4 text-sm text-muted-foreground mb-6">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 justify-center bg-muted/30 p-3 rounded-lg"
            >
              <div className="bg-primary/20 p-2 rounded-full">
                <Smartphone className="h-4 w-4 text-primary" />
              </div>
              <span>1. Ouvrez WhatsApp sur votre téléphone</span>
            </motion.div>
            
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 justify-center bg-muted/30 p-3 rounded-lg"
            >
              <div className="bg-primary/20 p-2 rounded-full">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              <span>2. Allez dans Paramètres → Appareils connectés</span>
            </motion.div>
            
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 justify-center bg-muted/30 p-3 rounded-lg"
            >
              <div className="bg-primary/20 p-2 rounded-full">
                <QrCode className="h-4 w-4 text-primary" />
              </div>
              <span>3. Scannez ce QR code</span>
            </motion.div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleConnect}
            className="w-full"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Nouveau QR Code
          </Button>
        </div>
      );
    }

    if (session?.status === 'connected') {
      return (
        <div className="py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-success/20 p-6 rounded-2xl w-fit mx-auto mb-6 text-center"
          >
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-2" />
            <div className="w-4 h-4 bg-success rounded-full animate-pulse mx-auto"></div>
          </motion.div>
          
          <h3 className="text-xl font-bold mb-3 text-success text-center">
            🎉 WhatsApp Connecté !
          </h3>
          
          <p className="text-muted-foreground text-sm mb-6 text-center max-w-md mx-auto leading-relaxed">
            Votre assistant IA est opérationnel et répond automatiquement à vos clients 24/7
          </p>

          <div className="space-y-4 mb-6">
            {session?.phoneNumber && (
              <div className="bg-success/10 rounded-xl p-4 border border-success/20">
                <p className="text-xs text-muted-foreground mb-1">Numéro connecté</p>
                <p className="font-mono text-lg text-success font-bold">{session.phoneNumber}</p>
              </div>
            )}

            {session?.lastConnected && (
              <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Dernière connexion</p>
                <p className="text-sm text-primary font-semibold">
                  {new Date(session.lastConnected).toLocaleDateString('fr-FR')} à{' '}
                  {new Date(session.lastConnected).toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            )}

            {session?.messageCount !== undefined && (
              <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
                <p className="text-xs text-muted-foreground mb-1">Messages traités aujourd'hui</p>
                <p className="text-2xl font-bold text-accent">{session.messageCount}</p>
              </div>
            )}
          </div>

          {/* Fonctionnalités actives */}
          <div className="bg-gradient-card rounded-xl p-4 border border-border mb-6">
            <h4 className="font-semibold mb-3 text-sm text-card-foreground">Assistant IA actif :</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-card-foreground">Réponses automatiques</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-card-foreground">Connexion temps réel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-card-foreground">Sessions persistantes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-card-foreground">IA intégrée</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" size="sm" onClick={() => {}}>
              <Settings className="h-4 w-4 mr-2" />
              Configurer
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDisconnect}>
              Déconnecter
            </Button>
          </div>
        </div>
      );
    }

    if (session?.status === 'error' || error) {
      return (
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-destructive/10 p-6 rounded-2xl w-fit mx-auto mb-6"
          >
            <AlertCircle className="h-12 w-12 text-destructive" />
          </motion.div>
          
          <h3 className="text-xl font-bold mb-3 text-destructive">
            Serveur WhatsApp Indisponible
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto leading-relaxed">
            {error || session?.error || 'Le serveur WhatsApp n\'est pas disponible'}
          </p>
          
          <div className="space-y-3">
            <Button onClick={handleConnect} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer la connexion
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-card border border-border">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/5 rounded-full animate-pulse"></div>
      </div>

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Server className="h-5 w-5 text-white" />
            </div>
            Assistant WhatsApp IA
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {renderConnectionStatus()}
      </CardContent>
    </Card>
  );
}