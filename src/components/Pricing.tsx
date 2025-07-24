import { Check, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

const Pricing = () => {
  const plans = [
    {
      name: "Plan Starter",
      price: "10 000",
      period: "FCFA/mois",
      yearlyPrice: "90 000",
      yearlyPeriod: "FCFA/an",
      savings: "Économisez 30 000 FCFA",
      description: "Parfait pour débuter l'automatisation de vos ventes WhatsApp",
      badge: "Populaire",
      badgeColor: "bg-primary",
      features: [
        "1 000 conversations/mois",
        "Assistant IA intégré",
        "Templates préconfigurés",
        "Dashboard analytics",
        "Support email",
        "Configuration guidée",
        "Base de connaissances",
        "Bac à sable pour tests"
      ],
      limitations: [
        "1 compte WhatsApp connecté",
        "Intégrations de base"
      ],
      cta: "Commencer l'essai gratuit",
      variant: "hero" as const
    },
    {
      name: "Plan Pro",
      price: "25 000", 
      period: "FCFA/mois",
      yearlyPrice: "225 000",
      yearlyPeriod: "FCFA/an",
      savings: "Économisez 75 000 FCFA",
      description: "Solution complète pour entrepreneurs ambitieux",
      badge: "Recommandé",
      badgeColor: "bg-accent",
      features: [
        "Conversations illimitées",
        "Assistant IA avancé", 
        "Tous les templates",
        "Analytics avancées",
        "Support prioritaire 24/7",
        "Intégration Shopify",
        "API personnalisée",
        "Formation individuelle",
        "Multi-comptes WhatsApp",
        "Commandes automatisées",
        "Rapports détaillés",
        "Sauvegarde automatique"
      ],
      limitations: [],
      cta: "Passer au Pro",
      variant: "accent" as const
    }
  ];

  const setupFee = {
    price: "5 000",
    description: "Frais d'inscription uniques incluant la configuration complète et la formation"
  };

  const testimonial = {
    text: "Whalix a transformé mon business. En 2 mois, mes ventes ont augmenté de 40% et je gagne 3h par jour !",
    author: "Marie Koné",
    business: "MK Fashion, Abidjan",
    avatar: "👩🏾‍💼"
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Des tarifs transparents adaptés à votre croissance
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Choisissez le plan qui correspond à vos besoins. Tous les plans incluent 
            notre IA, les templates et 7 jours d'essai gratuit.
          </p>
          
          {/* Setup Fee */}
          <div className="inline-flex items-center gap-3 bg-card border border-border rounded-full px-6 py-3">
            <Star className="w-5 h-5 text-accent" />
            <span className="text-card-foreground">
              <span className="font-semibold">{setupFee.price} FCFA</span> - {setupFee.description}
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <div key={index} className="relative group">
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${plan.badgeColor} text-white px-4 py-1 rounded-full text-sm font-medium z-10`}>
                  {plan.badge}
                </div>
              )}

              <div className={`bg-card rounded-2xl p-8 border-2 transition-all duration-300 h-full ${
                plan.badge === "Recommandé" 
                  ? "border-accent shadow-lg scale-105" 
                  : "border-border hover:border-primary/30 hover:shadow-md"
              }`}>
                
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-card-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {plan.description}
                  </p>

                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-4xl font-bold text-card-foreground">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        ou <span className="font-semibold text-card-foreground">{plan.yearlyPrice} {plan.yearlyPeriod}</span>
                      </div>
                      <div className="text-xs text-success font-medium mt-1">
                        {plan.savings}
                      </div>
                    </div>
                  </div>

                  <Button variant={plan.variant} size="lg" className="w-full">
                    {plan.cta}
                  </Button>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-card-foreground">Inclus :</h4>
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-card-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h4 className="font-semibold text-muted-foreground text-sm mb-3">Limitations :</h4>
                      <div className="space-y-2">
                        {plan.limitations.map((limitation, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="w-5 h-5 border border-muted-foreground/30 rounded-full mt-0.5 flex-shrink-0"></div>
                            <span className="text-sm text-muted-foreground">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise Option */}
        <div className="bg-gradient-card rounded-2xl p-8 border border-border text-center mb-16">
          <Crown className="w-12 h-12 text-accent mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-card-foreground mb-4">
            Besoin de plus ?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Pour les grandes entreprises avec des besoins spécifiques : volumes élevés, 
            intégrations personnalisées, SLA dédié.
          </p>
          <Button variant="outline" size="lg">
            Contactez-nous pour un devis
          </Button>
        </div>

        {/* Testimonial */}
        <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-4xl mb-4">{testimonial.avatar}</div>
            <blockquote className="text-lg text-card-foreground mb-4 italic">
              "{testimonial.text}"
            </blockquote>
            <div className="text-sm">
              <div className="font-semibold text-card-foreground">{testimonial.author}</div>
              <div className="text-muted-foreground">{testimonial.business}</div>
            </div>
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="text-center mt-16">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Des questions sur nos tarifs ?
          </h3>
          <p className="text-muted-foreground mb-6">
            Consultez notre FAQ ou contactez notre équipe pour plus d'informations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline">
              Voir la FAQ
            </Button>
            <Button variant="ghost">
              Parler à un expert
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;