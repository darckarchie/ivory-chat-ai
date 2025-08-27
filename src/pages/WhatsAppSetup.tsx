import { useNavigate } from "react-router-dom";
import { WhatsAppConnectionCard } from "@/components/dashboard/WhatsAppConnectionCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const WhatsAppSetup = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
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

      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <WhatsAppConnectionCard 
            restaurantId="demo"
            onStatusChange={(connected) => {
              if (connected) {
                // Rediriger vers le dashboard après connexion
                setTimeout(() => {
                  navigate('/dashboard');
                }, 2000);
              }
            }}
          />
          
          {/* Instructions */}
          <div className="mt-8 bg-card rounded-xl p-6 border">
            <h3 className="font-semibold mb-4">Comment ça marche ?</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">1</div>
                <p>Cliquez sur "Activer l'IA WhatsApp" pour générer un QR code</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">2</div>
                <p>Scannez le QR code avec votre WhatsApp Business</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">3</div>
                <p>Votre assistant IA répond automatiquement 24/7 !</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WhatsAppSetup;