import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Bot, Send, MessageSquare, Sparkles, RefreshCw } from 'lucide-react';

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
    
    const lowerMessage = message.toLowerCase();
    let response = '';
    let conf = 0;
    
    if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut')) {
      response = 'Bonjour ! 👋 Bienvenue chez nous. Comment puis-je vous aider aujourd\'hui ?';
      conf = 0.95;
    } else if (lowerMessage.includes('prix') || lowerMessage.includes('menu')) {
      if (kbItems.length > 0) {
        response = `📋 NOTRE MENU :\n\n${kbItems.slice(0, 3).map((item, idx) => 
          `${idx + 1}. ${item.name} - ${item.price.toLocaleString()} FCFA`
        ).join('\n')}\n\nPour commander, envoyez le numéro du plat !`;
        conf = 0.90;
      } else {
        response = 'Notre menu est en cours de mise à jour. Contactez-nous directement pour plus d\'informations.';
        conf = 0.70;
      }
    } else if (lowerMessage.includes('ouvert') || lowerMessage.includes('horaire')) {
      response = '🕐 HORAIRES D\'OUVERTURE :\n\n📍 Lundi - Samedi : 8h - 22h\n📍 Dimanche : 10h - 20h\n\nNous sommes actuellement ouverts !';
      conf = 0.95;
    } else if (lowerMessage.includes('livr')) {
      response = '🚗 LIVRAISON DISPONIBLE !\n\n✅ Zone : 5km autour du restaurant\n⏱️ Délai : 30-45 minutes\n💵 Frais : 1000 FCFA\n\nPour commander, choisissez vos plats !';
      conf = 0.90;
    } else if (lowerMessage.includes('command')) {
      response = '📝 POUR COMMANDER :\n\n1️⃣ Choisissez vos plats\n2️⃣ Confirmez votre adresse\n3️⃣ Choisissez le mode de paiement\n\nQue souhaitez-vous commander ?';
      conf = 0.85;
    } else {
      response = 'Merci pour votre message ! 😊 Un de nos agents va vous répondre rapidement. En attendant, vous pouvez consulter notre menu ou nos horaires.';
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
    <Card className={`${!isConnected ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Aperçu IA
          {isConnected && (
            <Badge className="bg-green-100 text-green-800">
              <Sparkles className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {!isConnected ? (
          <div className="text-center py-6">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Connectez WhatsApp pour tester votre IA
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Test Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Testez votre IA :</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Tapez un message de test..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && generateAIResponse(testMessage)}
                />
                <Button 
                  size="icon" 
                  onClick={() => generateAIResponse(testMessage)}
                  disabled={!testMessage.trim() || isGenerating}
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Ou essayez :</label>
              <div className="flex flex-wrap gap-2">
                {sampleQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
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
                className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Réponse IA</span>
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
                  <div className="text-sm whitespace-pre-line text-foreground">
                    {aiResponse}
                  </div>
                )}
              </motion.div>
            )}

            {/* IA Stats */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div>
                <p className="text-muted-foreground">Réponses auto</p>
                <p className="font-semibold text-green-600">24/7</p>
              </div>
              <div>
                <p className="text-muted-foreground">Temps réponse</p>
                <p className="font-semibold text-blue-600">&lt; 3s</p>
              </div>
              <div>
                <p className="text-muted-foreground">Précision</p>
                <p className="font-semibold text-purple-600">95%</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}