import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Marie Koné",
      business: "MK Fashion",
      location: "Abidjan, Cocody",
      avatar: "👩🏾‍💼",
      rating: 5,
      text: "Whalix a transformé notre façon de vendre. Nos clients reçoivent des réponses instantanées et notre taux de conversion a augmenté de 35% en seulement deux mois. C'est révolutionnaire !",
      metric: "+35% de ventes",
      sector: "Commerce"
    },
    {
      id: 2,
      name: "Ibrahima Diallo", 
      business: "Maquis Chez Ibra",
      location: "Abidjan, Yopougon",
      avatar: "👨🏾‍🍳",
      rating: 5,
      text: "Avant, je manquais de nombreuses commandes car je ne pouvais pas répondre assez rapidement. Avec Whalix, mes clients sont servis 24/7 et mes ventes ont doublé. Incroyable !",
      metric: "+100% de commandes",
      sector: "Restauration"
    },
    {
      id: 3,
      name: "Sophie Mensah",
      business: "Hôtel Délices Tropicaux",
      location: "Abidjan, Plateau",
      avatar: "👩🏾‍💼",
      rating: 5,
      text: "La simplicité d'utilisation m'a bluffé. En 5 minutes, mon assistant était opérationnel et mes clients adorent la réactivité. Un investissement rentabilisé en quelques jours seulement.",
      metric: "ROI en 3 jours",
      sector: "Hôtellerie"
    },
    {
      id: 4,
      name: "Kouadio Yves",
      business: "YK Digital Solutions",
      location: "Abidjan, Marcory",
      avatar: "👨🏾‍💻",
      rating: 5,
      text: "Whalix gère la qualification de mes prospects automatiquement. Je peux me concentrer sur la livraison de mes formations pendant que l'IA trouve de nouveaux clients. Parfait !",
      metric: "+50% de prospects qualifiés",
      sector: "Services digitaux"
    },
    {
      id: 5,
      name: "Fatou Traoré",
      business: "Boutique Fatou Style",
      location: "Bouaké",
      avatar: "👩🏾‍🦱",
      rating: 5,
      text: "Mes clients peuvent voir mon catalogue complet automatiquement. Plus besoin d'envoyer les photos une par une ! Whalix a simplifié ma vie et augmenté mes ventes.",
      metric: "+40% d'efficacité",
      sector: "Commerce"
    },
    {
      id: 6,
      name: "Emmanuel Kouassi",
      business: "EK Consulting",
      location: "Abidjan, Riviera",
      avatar: "👨🏾‍💼",
      rating: 5,
      text: "L'assistant IA de Whalix prend des rendez-vous à ma place et qualifie parfaitement mes prospects. Mon agenda se remplit automatiquement avec des clients qualifiés !",
      metric: "+60% de RDV qualifiés",
      sector: "Consulting"
    }
  ];

  const stats = [
    {
      number: "500+",
      label: "Entrepreneurs satisfaits",
      description: "Font confiance à Whalix"
    },
    {
      number: "40%",
      label: "Augmentation moyenne des ventes",
      description: "Mesurée sur 3 mois"
    },
    {
      number: "24/7",
      label: "Disponibilité",
      description: "Assistant toujours actif"
    },
    {
      number: "5 min",
      label: "Configuration",
      description: "De l'inscription à l'activation"
    }
  ];

  return (
    <section className="py-20 bg-muted/30" id="testimonials">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ce que disent nos clients ivoiriens
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Découvrez comment Whalix transforme les entreprises de Côte d'Ivoire, 
            du petit maquis aux grandes boutiques d'Abidjan.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-all duration-300">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm font-semibold text-card-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="group">
              <div className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-all duration-300 h-full relative">
                {/* Quote Icon */}
                <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
                
                {/* Sector Badge */}
                <div className="inline-block bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full mb-4">
                  {testimonial.sector}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-card-foreground mb-6 leading-relaxed text-sm">
                  "{testimonial.text}"
                </blockquote>

                {/* Metric Highlight */}
                <div className="bg-success/10 text-success px-3 py-2 rounded-full text-sm font-semibold mb-4 inline-block">
                  {testimonial.metric}
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-card-foreground text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.business}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      📍 {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Testimonial Section */}
        <div className="bg-card rounded-2xl p-8 border border-border text-center">
          <h3 className="text-2xl font-bold text-card-foreground mb-4">
            Découvrez Whalix en action
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Regardez comment Marie a configuré son assistant Whalix en 5 minutes 
            et transformé sa boutique en machine de vente automatisée.
          </p>
          
          <div className="relative max-w-3xl mx-auto">
            <div className="bg-muted rounded-xl aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-primary-hover transition-colors">
                  <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <p className="text-muted-foreground">
                  Cliquez pour voir la démonstration (2 min)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            Rejoignez des centaines d'entrepreneurs qui font déjà confiance à Whalix
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-sm font-medium">🏪 Boutiques d'Abidjan</div>
            <div className="text-sm font-medium">🍽️ Maquis de Yopougon</div>
            <div className="text-sm font-medium">🏨 Hôtels du Plateau</div>
            <div className="text-sm font-medium">📱 Consultants de Cocody</div>
            <div className="text-sm font-medium">🛍️ E-commerce CI</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;