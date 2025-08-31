import { useNavigate } from "react-router-dom";
import { WhatsAppConnectionCard } from "@/components/dashboard/WhatsAppConnectionCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, CheckCircle, Zap, Users, Clock, QrCode, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const WhatsAppSetup = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2 text-white">
                <MessageSquare className="h-6 w-6" />
                Configuration WhatsApp IA
              </h1>
              <p className="text-sm text-white/80">
                Connectez votre WhatsApp pour activer l'assistant IA
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Hero Section */}
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Activez votre{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Assistant IA
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Connectez votre WhatsApp Business et transformez chaque conversation en opportunité de vente
            </motion.p>

            {/* Benefits */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6 mb-8"
            >
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Réponses instantanées 24/7</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <Zap className="h-5 w-5 text-accent" />
                <span>IA adaptée à votre secteur</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <Users className="h-5 w-5 text-secondary" />
                <span>Conversations illimitées</span>
              </div>
            </motion.div>
          </div>

          {/* Connection Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto"
          >
            <WhatsAppConnectionCard 
              restaurantId="demo"
              onStatusChange={(connected) => {
                if (connected) {
                  // Rediriger vers le dashboard après connexion
                  setTimeout(() => {
                    navigate('/dashboard');
                  }, 3000);
                }
              }}
            />
          </motion.div>
          
          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-8">
                <h3 className="font-bold text-xl text-white mb-6 text-center">
                  Comment ça marche ?
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-gradient-primary p-4 rounded-2xl w-fit mx-auto mb-4">
                      <QrCode className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">1. Générer QR Code</h4>
                    <p className="text-white/80 text-sm">
                      Cliquez sur "Activer l'IA" pour générer votre QR code unique
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-gradient-primary p-4 rounded-2xl w-fit mx-auto mb-4">
                      <Smartphone className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">2. Scanner WhatsApp</h4>
                    <p className="text-white/80 text-sm">
                      Scannez avec votre WhatsApp Business en 30 secondes
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-gradient-primary p-4 rounded-2xl w-fit mx-auto mb-4">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">3. IA Active 24/7</h4>
                    <p className="text-white/80 text-sm">
                      Votre assistant répond automatiquement à tous vos clients
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-white mb-4 text-center">
                  Résultats moyens avec Whalix IA
                </h3>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-success mb-1">+40%</div>
                    <p className="text-white/80 text-sm">Ventes</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-accent mb-1">24/7</div>
                    <p className="text-white/80 text-sm">Disponibilité</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-secondary mb-1">&lt;3s</div>
                    <p className="text-white/80 text-sm">Réponse</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 8s infinite ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default WhatsAppSetup;