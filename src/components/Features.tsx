import { Bot, MessageSquare, BarChart3, Package, Zap, Settings, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Features = () => {
  const mainFeatures = [
    {
      icon: MessageSquare,
      title: "Automatisation WhatsApp",
      description: "Connectez votre WhatsApp Business en quelques clics. Configuration guidée sans compétences techniques requises.",
      benefits: ["Intégration API officielle", "Configuration en 5 minutes", "Compatibilité garantie"]
    },
    {
      icon: Bot,
      title: "IA intégrée",
      description: "Assistant intelligent qui comprend vos clients et répond avec la personnalité de votre marque.",
      benefits: ["Réponses personnalisées", "Apprentissage continu", "Contexte mémorisé"]
    },
    {
      icon: Package,
      title: "Templates préconfigurés",
      description: "Modèles prêts à l'emploi adaptés à votre secteur d'activité en Côte d'Ivoire.",
      benefits: ["Restaurant & Maquis", "Commerce & Boutiques", "Services & Consulting"]
    },
    {
      icon: BarChart3,
      title: "Analytics & CRM",
      description: "Suivez vos performances, analysez vos conversations et optimisez vos ventes en temps réel.",
      benefits: ["Tableau de bord complet", "Rapports détaillés", "Métriques de conversion"]
    }
  ];

  const additionalFeatures = [
    {
      icon: Zap,
      title: "Automatisation avancée",
      description: "Workflows intelligents pour capturer, qualifier et convertir vos prospects automatiquement."
    },
    {
      icon: Settings,
      title: "Configuration intuitive",
      description: "Interface simple pour personnaliser votre assistant sans aucune connaissance technique."
    },
    {
      icon: Users,
      title: "Multi-conversations",
      description: "Gérez des centaines de conversations simultanément avec la même qualité de service."
    },
    {
      icon: TrendingUp,
      title: "Optimisation continue",
      description: "L'IA apprend de chaque interaction pour améliorer constamment ses performances."
    }
  ];

  const sectors = [
    {
      emoji: "🍽️",
      name: "Restauration",
      description: "Maquis, restaurants, livraison",
      example: "Menu automatique, prise de commandes, gestion livraisons"
    },
    {
      emoji: "🏪", 
      name: "Commerce",
      description: "Boutiques, magasins, e-commerce",
      example: "Catalogue produits, stock, commandes en ligne"
    },
    {
      emoji: "🏨",
      name: "Hôtellerie",
      description: "Hôtels, auberges, locations",
      example: "Réservations, disponibilités, services clients"
    },
    {
      emoji: "📱",
      name: "Services digitaux", 
      description: "Formations, consulting, services",
      example: "Qualification prospects, prise RDV, follow-up"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tout ce dont vous avez besoin pour automatiser vos ventes
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Whalix combine intelligence artificielle et automatisation pour créer l'assistant commercial 
            parfait adapté au marché ivoirien.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {mainFeatures.map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-all duration-300 h-full">
                <div className="bg-primary/10 p-4 rounded-xl w-fit mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="text-2xl font-semibold text-card-foreground mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {feature.description}
                </p>

                <div className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm text-card-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">
            Fonctionnalités avancées incluses
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-all duration-300 text-center h-full">
                  <div className="bg-secondary/10 p-3 rounded-xl w-fit mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h4 className="text-lg font-semibold text-card-foreground mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Templates */}
        <div className="bg-card rounded-2xl p-8 border border-border">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-card-foreground mb-4">
              Templates spécialisés par secteur
            </h3>
            <p className="text-muted-foreground">
              Configurations prêtes à l'emploi adaptées aux spécificités du marché ivoirien
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {sectors.map((sector, index) => (
              <div key={index} className="text-center group">
                <div className="bg-muted/50 rounded-xl p-6 hover:bg-muted transition-colors">
                  <div className="text-4xl mb-3">{sector.emoji}</div>
                  <h4 className="text-lg font-semibold text-card-foreground mb-2">
                    {sector.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {sector.description}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {sector.example}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg">
              Voir tous les templates disponibles
            </Button>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-primary rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Prêt à transformer votre WhatsApp en machine de vente ?
            </h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Rejoignez les centaines d'entrepreneurs ivoiriens qui automatisent déjà leurs ventes avec Whalix
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="accent" size="xl">
                Démarrer l'essai gratuit
              </Button>
              <Button variant="outline" size="xl" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                Planifier une démonstration
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;