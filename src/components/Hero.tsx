import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bot, TrendingUp } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full animate-pulse"></div>
      </div>
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
            <span className="text-white text-sm font-medium">
              🇨🇮 Spécialement conçu pour la Côte d'Ivoire
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
            Votre assistant commercial sur{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">
                WhatsApp
              </span>
            </span>{" "}
            en 5 minutes
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            Automatisez vos ventes, répondez instantanément à vos clients et 
            augmentez votre chiffre d'affaires{" "}
            <span className="font-semibold text-accent">sans coder</span>
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-10 animate-fade-in">
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Configuration en 5 minutes</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Pas de carte bancaire requise</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Support 24/7</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in">
            <Button size="xl" variant="accent" className="min-w-[200px]" onClick={() => navigate('/register')}>
              Commencer l'essai gratuit
            </Button>
            <Button size="xl" variant="outline" className="min-w-[200px] bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20" onClick={() => navigate('/login')}>
              Voir le dashboard
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col items-center gap-4 text-white/80 animate-fade-in">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-accent" />
                <span className="text-sm">+ de 1000 conversations automatisées</span>
              </div>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-accent" />
                <span className="text-sm">IA intégrée</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <span className="text-sm">+40% de ventes en moyenne</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image/Dashboard Preview */}
        <div className="max-w-4xl mx-auto mt-16 animate-fade-in">
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-1 shadow-2xl">
              <img 
                src="https://imgur.com/UfKTrI4.jpg" 
                alt="Interface Whalix - Dashboard d'automatisation WhatsApp"
                className="w-full rounded-xl shadow-lg"
              />
            </div>
            {/* Floating Elements */}
            <div className="absolute -top-6 -left-6 bg-success text-success-foreground px-3 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse">
              ✓ Automatisé
            </div>
            <div className="absolute -top-6 -right-6 bg-accent text-accent-foreground px-3 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse">
              🚀 Actif 24/7
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;