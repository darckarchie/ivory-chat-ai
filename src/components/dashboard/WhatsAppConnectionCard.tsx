import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWhatsAppSession } from '@/lib/hooks/use-whatsapp-session';
import { useMetrics } from '@/components/dashboard/MetricsProvider';
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
  const { session, isLoading, connect, disconnect, error } = useWhatsAppSession();
  const { logEvent } = useMetrics();
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 10));
    console.log(`🔍 [DEBUG] ${message}`);
  };

  useEffect(() => {
    console.log('📊 [DEBUG] Session status changed:', session?.status);
    onStatusChange?.(session?.status === 'connected');
    
    // Logger les changements de statut
    if (session?.status) {
      addDebugLog(`Status: ${session.status}`);
    }
  }, [session?.status, onStatusChange]);

  const handleConnect = async () => {
    addDebugLog('1. Début connexion WhatsApp...');
    try {
      await connect();
      await logEvent('qr_generated', { timestamp: new Date().toISOString() });
      addDebugLog('✅ Connexion initiée avec succès');
    } catch (error) {
      addDebugLog(`❌ Erreur: ${error}`);
    }
  };
  
  const handleDisconnect = async () => {
    addDebugLog('Déconnexion...');
    try {
      await disconnect();
      await logEvent('connection_closed', { manual: true });
      addDebugLog('✅ Déconnecté avec succès');
    } catch (error) {
      addDebugLog(`❌ Erreur déconnexion: ${error}`);
    }
  };

  const getStatusBadge = () => {
    console.log('🏷️ [DEBUG] Génération badge pour status:', session?.status);
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
    console.log('🎨 Rendu statut:', session?.status);
    
    if (!session || session.status === 'idle' || session.status === 'disconnected') {
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
          
          {/* Debug visible */}
          {debugLogs.length > 0 && (
            <div className="mt-4 bg-muted/50 rounded-lg p-3 border">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">Debug en temps réel :</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {debugLogs.map((log, index) => (
                  <div key={index} className="text-xs font-mono text-foreground bg-background/50 p-1 rounded">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // État de connexion en cours
    if (session?.status === 'connecting') {
      return (
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-primary/10 p-6 rounded-2xl w-fit mx-auto mb-6"
          >
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </motion.div>
          
          <h3 className="text-xl font-bold mb-3 text-primary">
            Connexion en cours...
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            Génération du QR code WhatsApp
          </p>
          
          {/* Debug visible pendant connexion */}
          {debugLogs.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-3 border max-w-md mx-auto">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">Progression :</h4>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {debugLogs.slice(0, 5).map((log, index) => (
                  <div key={index} className="text-xs font-mono text-foreground bg-background/50 p-1 rounded">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (session?.status === 'qr_pending' && session?.qrCode) {
      console.log('📱 [DEBUG] Affichage QR - Status:', session.status);
      console.log('📱 [DEBUG] QR Code value:', session.qrCode);
      console.log('📱 [DEBUG] QR Code type:', typeof session.qrCode);
      console.log('📱 [DEBUG] QR Code starts with data:', session.qrCode.startsWith('data:'));
      console.log('📱 [DEBUG] QR Code starts with http:', session.qrCode.startsWith('http'));
      
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
              className="bg-white p-4 rounded-2xl border-2 border-primary/30 mb-6 inline-block shadow-glow"
            >
              {session.qrCode ? (
                session.qrCode.startsWith('http') || session.qrCode.startsWith('data:') ? (
                  <div>
                    <img 
                      src={session.qrCode}
                      alt="QR Code WhatsApp" 
                      className="w-48 h-48 object-contain mx-auto"
                      onLoad={() => console.log('✅ [DEBUG] Image QR chargée avec succès')}
                      onError={(e) => console.error('❌ [DEBUG] Erreur chargement image QR:', e)}
                    />
                    <p className="text-xs text-muted-foreground mt-2">QR Code généré</p>
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Mode Test</p>
                      <p className="text-xs text-gray-400 mt-2 break-all">QR: {session.qrCode.substring(0, 50)}...</p>
                      <p className="text-xs text-gray-400">Type: {typeof session.qrCode}</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Loader2 className="h-16 w-16 text-gray-400 mx-auto mb-2 animate-spin" />
                    <p className="text-sm text-gray-500">Génération QR...</p>
                  </div>
                </div>
              )}
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
            onClick={() => {
              addDebugLog('1. Clic sur Activer IA');
              connect();
            }}
            className="w-full"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Nouveau QR Code
          </Button>
        </div>
      );
    }

    if (session.status === 'connected') {
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
            {session.phoneNumber && (
              <div className="bg-success/10 rounded-xl p-4 border border-success/20">
                <p className="text-xs text-muted-foreground mb-1">Numéro connecté</p>
                <p className="font-mono text-lg text-success font-bold">{session.phoneNumber}</p>
              </div>
            )}

            {session.lastConnected && (
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

            {session.messageCount !== undefined && (
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

    if (session.status === 'error' || error) {
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
            {error || session.error || 'Le serveur WhatsApp n\'est pas disponible'}
          </p>
          
          <div className="space-y-3">
            <Button onClick={connect} variant="outline" className="w-full">
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
    <Card className="relative overflow-hidden bg-gradient-card border-border/50 shadow-glow">
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
        <div>
          {renderConnectionStatus()}
        </div>
      </CardContent>
    </Card>
  );
}