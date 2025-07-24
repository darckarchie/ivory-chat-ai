import { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare, Shield, Clock, CreditCard } from "lucide-react";

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([0]); // First item open by default

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const categories = [
    {
      icon: MessageSquare,
      title: "Fonctionnement",
      color: "text-primary",
      bgColor: "bg-primary/10",
      faqs: [
        {
          question: "Comment fonctionne l'intégration avec WhatsApp Business ?",
          answer: "L'intégration est simple et ne prend que quelques minutes. Vous connectez votre compte WhatsApp Business à notre plateforme via l'API officielle. Notre système vous guide pas à pas dans la configuration. Aucune connaissance technique n'est requise - il suffit de suivre notre assistant de configuration."
        },
        {
          question: "Est-ce que je peux personnaliser les réponses de l'assistant ?",
          answer: "Absolument ! Vous avez un contrôle total sur votre assistant. Vous pouvez personnaliser la personnalité, créer des scripts de conversation spécifiques, définir des réponses pour votre secteur d'activité, et même ajuster le ton pour qu'il corresponde à votre marque. Notre éditeur intuitif rend tout cela très simple."
        },
        {
          question: "L'assistant IA comprend-il le français ivoirien ?",
          answer: "Oui ! Notre IA a été spécialement entraînée pour comprendre et répondre en français ivoirien. Elle reconnaît les expressions locales, s'adapte au contexte culturel et peut même utiliser des termes spécifiques à la Côte d'Ivoire selon vos préférences."
        }
      ]
    },
    {
      icon: Shield,
      title: "Sécurité & Fiabilité",
      color: "text-success",
      bgColor: "bg-success/10",
      faqs: [
        {
          question: "Mes données et conversations sont-elles sécurisées ?",
          answer: "La sécurité est notre priorité absolue. Toutes vos données sont chiffrées, stockées de manière sécurisée et jamais partagées avec des tiers. Nous utilisons les mêmes standards de sécurité que les banques. Vos conversations restent privées et vous gardez le contrôle total sur vos informations."
        },
        {
          question: "Que se passe-t-il si Whalix ne fonctionne pas ?",
          answer: "Notre système a une disponibilité de 99.9%. En cas de problème rare, votre WhatsApp continue de fonctionner normalement - vous recevez simplement les messages directement. Nous avons aussi une équipe support 24/7 pour résoudre tout problème rapidement."
        },
        {
          question: "Puis-je récupérer mes données si j'arrête Whalix ?",
          answer: "Bien sûr ! Vous pouvez exporter toutes vos données à tout moment : conversations, contacts, configurations, analytics. Nous fournissons des formats standards pour que vous puissiez facilement utiliser vos données ailleurs. Aucun verrouillage - vos données vous appartiennent."
        }
      ]
    },
    {
      icon: Clock,
      title: "Configuration & Support",
      color: "text-accent",
      bgColor: "bg-accent/10",
      faqs: [
        {
          question: "Combien de temps faut-il pour configurer Whalix ?",
          answer: "La configuration de base prend vraiment 5 minutes ! Voici le processus : 1) Connexion de votre WhatsApp (2 min), 2) Choix de votre secteur et templates (2 min), 3) Test dans le bac à sable (1 min). Pour une configuration avancée avec vos produits et scripts personnalisés, comptez 15-30 minutes supplémentaires."
        },
        {
          question: "Avez-vous un support en français ?",
          answer: "Oui, 100% ! Notre équipe support parle français et connaît parfaitement le marché ivoirien. Support disponible par email, chat et WhatsApp (bien sûr !). Temps de réponse : moins de 2h en semaine, moins de 4h le weekend. Plan Pro : support prioritaire en moins de 30 minutes."
        },
        {
          question: "Proposez-vous de la formation ?",
          answer: "Absolument ! Nous offrons : Formation vidéo gratuite (1h), documentation complète, webinaires hebdomadaires, et pour le Plan Pro : formation individuelle personnalisée (1h) avec un expert Whalix qui vous aide à optimiser votre configuration selon votre business."
        }
      ]
    },
    {
      icon: CreditCard,
      title: "Tarifs & Facturation",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      faqs: [
        {
          question: "Comment sont facturés les frais d'utilisation ?",
          answer: "C'est très simple : abonnement mensuel (10 000 FCFA) ou annuel (90 000 FCFA - économisez 30 000 FCFA), plus frais d'inscription uniques de 5 000 FCFA. Pas de frais cachés, pas de facturation à l'usage. L'abonnement inclut TOUT : IA, templates, support, mises à jour."
        },
        {
          question: "Puis-je essayer Whalix avant de m'abonner ?",
          answer: "Oui ! Essai gratuit de 7 jours avec TOUTES les fonctionnalités - aucune limitation. Pas de carte bancaire requise. Vous pouvez configurer votre assistant, tester avec de vrais clients, voir les résultats. Si vous n'êtes pas convaincu, aucun engagement."
        },
        {
          question: "Que se passe-t-il si je dépasse 1 000 conversations ?",
          answer: "Avec le Plan Starter (1 000 conversations/mois), nous vous prévenons à 80% puis 100%. Une fois la limite atteinte, nous vous proposerons automatiquement le Plan Pro (conversations illimitées). Pas de coupure de service - nous vous laissons le temps de décider."
        },
        {
          question: "Acceptez-vous les paiements mobile money ?",
          answer: "Oui ! Nous acceptons Orange Money, MTN Money, et Wave. Vous pouvez aussi payer par virement bancaire ou carte bancaire. Facturation en FCFA uniquement - pas de frais de change. Paiement sécurisé avec reçu automatique par email."
        }
      ]
    }
  ];

  return (
    <section className="py-20 bg-background" id="faq">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Questions fréquemment posées
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Trouvez rapidement les réponses à vos questions sur Whalix. 
            Notre équipe est aussi disponible pour vous accompagner personnellement.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-card rounded-2xl border border-border p-6">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`${category.bgColor} p-3 rounded-xl`}>
                  <category.icon className={`w-6 h-6 ${category.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground">
                  {category.title}
                </h3>
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {category.faqs.map((faq, faqIndex) => {
                  const globalIndex = categoryIndex * 10 + faqIndex; // Unique index across all categories
                  const isOpen = openItems.includes(globalIndex);

                  return (
                    <div
                      key={faqIndex}
                      className="border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md"
                    >
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <span className="font-medium text-card-foreground pr-4">
                          {faq.question}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 py-4 bg-background">
                          <p className="text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-card rounded-2xl p-8 border border-border">
            <h3 className="text-2xl font-bold text-card-foreground mb-4">
              Vous ne trouvez pas la réponse à votre question ?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Notre équipe support ivoirienne est là pour vous aider. 
              Contactez-nous par email, chat ou WhatsApp - nous répondons rapidement !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors">
                💬 Chat avec le support
              </button>
              <button className="bg-success text-success-foreground px-6 py-3 rounded-lg font-medium hover:bg-success/90 transition-colors">
                📱 WhatsApp : +225 XX XX XX XX XX
              </button>
              <button className="border border-border bg-background text-card-foreground px-6 py-3 rounded-lg font-medium hover:bg-muted/50 transition-colors">
                📧 contact@whalix.ci
              </button>
            </div>
          </div>
        </div>

        {/* Knowledge Base Link */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Explorez notre centre d'aide complet
          </p>
          <button className="text-primary hover:text-primary-hover font-medium transition-colors">
            📚 Accéder à la documentation complète →
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;