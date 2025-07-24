import { MessageSquareX, Clock, TrendingDown, UserX, MessageSquare, Zap, TrendingUp, Users } from "lucide-react";

const ProblemSolution = () => {
  const problems = [
    {
      icon: MessageSquareX,
      image: "https://imgur.com/X38eNAu.jpg",
      title: "Messages sans réponse",
      description: "Vos clients vous contactent sur WhatsApp mais vous ne pouvez pas répondre assez rapidement. Résultat : des ventes perdues.",
      solution: "Réponses instantanées 24/7"
    },
    {
      icon: Clock,
      image: "https://imgur.com/UD6XUwG.jpg",
      title: "Temps perdu en gestion manuelle",
      description: "Vous passez des heures à répondre aux mêmes questions, gérer les commandes et faire le suivi client manuellement.",
      solution: "Automatisation complète"
    },
    {
      icon: TrendingDown,
      image: "https://imgur.com/mX9o51c.jpg",
      title: "Opportunités manquées",
      description: "Pendant que vous dormez ou que vous êtes occupé, des clients potentiels vous échappent faute de réactivité.",
      solution: "Capacité multipliée"
    },
    {
      icon: UserX,
      image: "https://imgur.com/LC179ti.jpg",
      title: "Support client limité",
      description: "Impossible d'être disponible pour tous vos clients en même temps. Votre service client ne suit pas votre croissance.",
      solution: "Service automatisé"
    }
  ];

  const solutions = [
    {
      icon: MessageSquare,
      title: "Réponses instantanées 24/7",
      description: "Votre assistant IA répond immédiatement à vos clients, même la nuit et les weekends. Aucune occasion manquée."
    },
    {
      icon: Zap,
      title: "Automatisation complète", 
      description: "Présentez vos produits, gérez les commandes et collectez les paiements automatiquement. Concentrez-vous sur l'essentiel."
    },
    {
      icon: TrendingUp,
      title: "Capacité multipliée",
      description: "Gérez 100x plus de conversations simultanément. Votre assistant ne se fatigue jamais et ne commet pas d'erreurs."
    },
    {
      icon: Users,
      title: "Service automatisé",
      description: "Support client professionnel disponible 24/7. Vos clients reçoivent toujours une réponse rapide et pertinente."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Les défis que vous rencontrez quotidiennement
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Chaque entrepreneur ivoirien fait face aux mêmes obstacles avec WhatsApp Business. 
            Whalix résout ces problèmes une fois pour toutes.
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {problems.map((problem, index) => (
            <div key={index} className="group">
              <div className="bg-card rounded-2xl p-6 shadow-md border border-border hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-destructive/10 p-3 rounded-xl">
                    <problem.icon className="w-6 h-6 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">
                      {problem.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {problem.description}
                    </p>
                  </div>
                </div>
                
                <div className="relative rounded-xl overflow-hidden mb-4">
                  <img 
                    src={problem.image} 
                    alt={problem.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>

                <div className="flex items-center gap-2 text-success font-medium">
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  <span>Solution Whalix : {problem.solution}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Solution Section */}
        <div className="relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Comment Whalix transforme votre business
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Notre solution d'automatisation WhatsApp convertit ces problèmes en opportunités de croissance.
            </p>
          </div>

          {/* Solutions Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((solution, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-card rounded-2xl p-6 border border-border hover:shadow-lg transition-all duration-300 h-full">
                  <div className="bg-primary/10 p-3 rounded-xl w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <solution.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-3">
                    {solution.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {solution.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works preview */}
        <div className="mt-20 text-center">
          <div className="bg-card rounded-2xl p-8 border border-border">
            <h3 className="text-2xl font-bold text-card-foreground mb-4">
              Voyez Whalix en action
            </h3>
            <p className="text-muted-foreground mb-6">
              Découvrez comment votre assistant IA gère automatiquement les conversations avec vos clients
            </p>
            <div className="relative max-w-2xl mx-auto">
              <img 
                src="https://imgur.com/mEbCrHH.jpg" 
                alt="Exemple de conversation automatisée Whalix"
                className="w-full rounded-xl shadow-lg"
              />
              <div className="absolute -bottom-4 -right-4 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                100% Automatisé ✨
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;