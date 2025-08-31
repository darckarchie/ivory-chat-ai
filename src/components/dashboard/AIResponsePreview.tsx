import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Bot, Send, MessageSquare, Sparkles, RefreshCw, Zap } from 'lucide-react';

interface AIResponsePreviewProps {
  isConnected: boolean;
  kbItems: any[];
}

export function AIResponsePreview({ isConnected, kbItems }: AIResponsePreviewProps) {
  const [testMessage, setTestMessage] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [confidence, setConfidence] = useState(0);

  const sampleQuestions = [
    'Bonjour, vous êtes ouverts ?',
    'Prix du menu du jour ?',
    'Vous livrez à Cocody ?',
    'Je peux commander ?',
    'Quels sont vos horaires ?'
  ];

  const generateAIResponse = async (message: string) => {
    setIsGenerating(true);
    setAiResponse(null);
    
    // Simuler un délai de génération
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Logique IA basée sur la base de connaissances
    const lowerText = message.toLowerCase();
    let response = '';
    let conf = 0;
    
    if (lowerText.includes('bonjour') || lowerText.includes('salut')) {
      response = 'Bonjour ! 👋 Bienvenue chez nous. Comment puis-je vous aider aujourd\'hui ?';
      conf = 0.95;
    } else if (lowerText.includes('prix') || lowerText.includes('menu')) {
      if (kbItems.length > 0) {
        response = '📋 NOTRE MENU :\n\n';
        kbItems.slice(0, 3).forEach((item, idx) => {
          response += `${idx + 1}. ${item.name} - ${item.price.toLocaleString()} FCFA\n`;
        });
        response += '\nPour commander, envoyez le numéro du plat ! 😊';
        conf = 0.90;
      } else {
        response = 'Merci pour votre intérêt ! Notre équipe va vous envoyer le menu rapidement.';
        conf = 0.70;
      }
    } else if (lowerText.includes('ouvert') || lowerText.includes('horaire')) {
      response = '🕐 HORAIRES :\n\n📍 Lundi - Samedi : 8h - 22h\n📍 Dimanche : 10h - 20h\n\nNous sommes actuellement ouverts ! 😊';
      conf = 0.95;
    } else if (lowerText.includes('livr') || lowerText.includes('command')) {
      response = '🚗 LIVRAISON DISPONIBLE !\n\n✅ Zone : 5km\n⏱️ Délai : 30-45 min\n💵 Frais : 1000 FCFA\n\nQue souhaitez-vous commander ?';
      conf = 0.90;
    } else {
      response = 'Merci pour votre message ! 😊 Un de nos agents va vous répondre rapidement.';
      conf = 0.60;
    }
    
    setAiResponse(response);
    setConfidence(conf);
    setIsGenerating(false);
  };

  const handleTestMessage = (message: string) => {
    setTestMessage(message);
    generateAIResponse(message);
  };

  return (
    <Card className={`relative overflow-hidden ${!isConnected ? 'opacity-60' : ''}`}>
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
      
      <CardHeader className="pb-3 relative z-10">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="bg-gradient-primary p-2 rounded-lg">
            <Bot className="h-5 w-5 text-white" />
          </div>
          Aperçu IA
          {isConnected && (
            <Badge className="bg-success/20 text-success border-success/30">
              <Sparkles className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10">
        {!isConnected ? (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-muted/50 p-6 rounded-2xl w-fit mx-auto mb-4"
            >
              <Bot className="h-12 w-12 text-muted-foreground" />
            </motion.div>
            <h3 className="font-semibold text-muted-foreground mb-2">
              IA en attente
            </h3>
            <p className="text-sm text-muted-foreground">
              Connectez WhatsApp pour tester votre IA
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Test Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-card-foreground">Testez votre IA :</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Tapez un message de test..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && generateAIResponse(testMessage)}
                  className="bg-background/50 backdrop-blur-sm"
                />
                <Button 
                  size="icon" 
                  onClick={() => generateAIResponse(testMessage)}
                  disabled={!testMessage.trim() || isGenerating}
                  className="bg-gradient-primary hover:shadow-glow"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Sample Questions */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-card-foreground">Ou essayez :</label>
              <div className="flex flex-wrap gap-2">
                {sampleQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 bg-background/50 backdrop-blur-sm hover:bg-primary/10"
                    onClick={() => handleTestMessage(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>

            {/* AI Response */}
            {(aiResponse || isGenerating) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-card rounded-xl p-4 border-l-4 border-primary backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-gradient-primary p-1.5 rounded-lg">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-card-foreground">Réponse IA</span>
                  {confidence > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(confidence * 100)}% confiance
                    </Badge>
                  )}
                </div>
                
                {isGenerating ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">L'IA génère une réponse...</span>
                  </div>
                ) : (
                  <div className="text-sm whitespace-pre-line text-card-foreground bg-background/30 p-3 rounded-lg">
                    {aiResponse}
                  </div>
                )}
              </motion.div>
            )}

            {/* IA Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-success/10 p-3 rounded-lg border border-success/20">
                <p className="text-xs text-muted-foreground mb-1">Réponses auto</p>
                <p className="font-bold text-success">24/7</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Temps réponse</p>
                <p className="font-bold text-primary">&lt; 3s</p>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
                <p className="text-xs text-muted-foreground mb-1">Précision</p>
                <p className="font-bold text-accent">95%</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}