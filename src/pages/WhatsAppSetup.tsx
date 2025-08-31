import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, CheckCircle, Zap, QrCode, Smartphone } from "lucide-react";

const WhatsAppSetup = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Configuration WhatsApp IA
              </h1>
              <p className="text-sm text-muted-foreground">
                Connectez votre WhatsApp pour activer l'assistant IA
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Activez votre Assistant IA
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Connectez votre WhatsApp Business et transformez chaque conversation en opportunité
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Réponses instantanées 24/7</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-5 w-5 text-accent" />
                <span>IA adaptée à votre secteur</span>
              </div>
            </div>
          </div>

          {/* Connection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Assistant WhatsApp IA
                <Badge variant="secondary">Baileys</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isConnected ? (
                <div className="text-center py-8">
                  <div className="bg-primary/10 p-6 rounded-2xl w-fit mx-auto mb-6">
                    <MessageSquare className="h-12 w-12 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">
                    Serveur WhatsApp Baileys
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Connectez votre WhatsApp Business via notre serveur Baileys local
                  </p>
                  
                  <Button 
                    onClick={() => setIsConnected(true)}
                    className="w-full"
                    size="lg"
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Activer l'IA WhatsApp
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-success/10 p-6 rounded-2xl w-fit mx-auto mb-6">
                    <CheckCircle className="h-12 w-12 text-success" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-success">
                    WhatsApp Connecté !
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Votre assistant IA répond maintenant automatiquement à vos clients
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-success/10 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">Numéro connecté</p>
                      <p className="font-mono text-lg text-success font-bold">+225 07 00 00 00 01</p>
                    </div>
                    
                    <Button 
                      onClick={() => navigate('/dashboard')}
                      className="w-full"
                      size="lg"
                    >
                      Retour au Dashboard
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Instructions */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg text-card-foreground mb-4 text-center">
                Comment ça marche ?
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-primary/10 p-4 rounded-2xl w-fit mx-auto mb-4">
                    <QrCode className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-card-foreground mb-2">1. Générer QR Code</h4>
                  <p className="text-muted-foreground text-sm">
                    Cliquez sur "Activer l'IA" pour générer votre QR code unique
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-primary/10 p-4 rounded-2xl w-fit mx-auto mb-4">
                    <Smartphone className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-card-foreground mb-2">2. Scanner WhatsApp</h4>
                  <p className="text-muted-foreground text-sm">
                    Scannez avec votre WhatsApp Business en 30 secondes
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-primary/10 p-4 rounded-2xl w-fit mx-auto mb-4">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-card-foreground mb-2">3. IA Active 24/7</h4>
                  <p className="text-muted-foreground text-sm">
                    Votre assistant répond automatiquement à tous vos clients
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSetup;