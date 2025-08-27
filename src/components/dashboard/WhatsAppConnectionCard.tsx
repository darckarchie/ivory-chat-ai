import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWhatsAppConnection } from '@/lib/hooks/use-whatsapp-connection';
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
  Send,
  Phone
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
    disconnect,
    sendTestMessage 
  } = useWhatsAppConnection(restaurantId);
  
  const [testPhone, setTestPhone] = useState('+225');
  const [testMessage, setTestMessage] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    onStatusChange?.(isConnected);
  }, [isConnected, onStatusChange]);

  const handleSendTest = async () => {
    if (!testPhone || !testMessage || !sendTestMessage) return;
    
    setIsSendingTest(true);
    try {
      await sendTestMessage(testPhone, testMessage);
      setTestMessage('');
      alert('Message test envoyé !');
    } catch (error) {
      alert('Erreur envoi message test');
    } finally {
      setIsSendingTest(false);
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
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Connecter WhatsApp IA</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Activez votre assistant IA pour répondre automatiquement à vos clients 24/7
          </p>
          <Button 
            onClick={() => connect()}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Activer l'IA WhatsApp
              </>
            )}
          </Button>
        </div>
      );
    }

    if (hasQR && session.qrCode) {
      return (
        <div className="text-center py-6">
          <h3 className="text-lg font-semibold mb-4">Scannez le QR Code</h3>
          
          <div className="bg-white p-4 rounded-xl border-2 border-dashed border-primary/30 mb-6 inline-block">
            <img src={session.qrCode} alt="QR Code WhatsApp" className="w-48 h-48" />
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
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
            onClick={() => connect()}
            className="mt-4"
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
            className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-4 text-center"
          >
            <CheckCircle className="h-8 w-8 text-green-600" />
          </motion.div>
          
          <h3 className="text-lg font-semibold mb-2 text-green-800 text-center">
            WhatsApp IA Activé !
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 text-center">
            Votre assistant répond maintenant automatiquement à vos clients
          </p>

          {session.phoneNumber && (
            <div className="bg-muted/50 rounded-lg p-3 mb-4">
              <p className="text-xs text-muted-foreground">Numéro connecté</p>
              <p className="font-mono text-sm">{session.phoneNumber}</p>
              {session.messageCount !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  {session.messageCount} messages traités
                </p>
              )}
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

          {/* Test de message */}
          <div className="space-y-3 mb-4 p-3 bg-muted/30 rounded-lg">
            <Label className="text-sm font-medium">Tester l'envoi de message :</Label>
            <div className="space-y-2">
              <Input
                placeholder="+225XXXXXXXX"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Message de test..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendTest()}
                />
                <Button 
                  size="sm" 
                  onClick={handleSendTest}
                  disabled={!testPhone || !testMessage || isSendingTest}
                >
                  {isSendingTest ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={() => {}}>
              <Settings className="h-4 w-4 mr-2" />
              Configurer
            </Button>
            <Button variant="destructive" size="sm" onClick={() => disconnect()}>
              Déconnecter
            </Button>
          </div>
        </div>
      );
    }

    if (session.status === 'error') {
      return (
        <div className="text-center py-6">
          <div className="bg-red-100 p-4 rounded-full w-fit mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-red-800">
            Erreur de connexion
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {session.error || 'Une erreur est survenue lors de la connexion'}
          </p>
          <Button onClick={() => connect()} variant="outline">
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
            <MessageSquare className="h-5 w-5" />
            Assistant WhatsApp IA
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent>
        {renderConnectionStatus()}

        {/* Informations sur l'IA */}
        {isConnected && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-semibold mb-3 text-sm">Capacités de votre IA :</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Réponses automatiques</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Gestion des prix</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Horaires d'ouverture</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Informations livraison</span>
              </div>
            </div>
          </div>
        )}

        {/* Mode démo notice */}
        {restaurantId === 'demo' && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Mode démo actif. Serveur WhatsApp requis sur localhost:3001
            </AlertDescription>
          </Alert>
        )}
        
        {/* Erreur de connexion au serveur */}
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