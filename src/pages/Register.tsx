import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useUserStore, BusinessSector } from "@/lib/store";
import { ArrowLeft, Building, Phone, User, Search, Check, ChevronRight, Sparkles, Star, TrendingUp } from "lucide-react";

const registerSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  businessName: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
  phone: z.string().regex(/^\d{10}$/, "Format: 10 chiffres (ex: 0123456789)"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères")
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const [step, setStep] = useState<'info' | 'sector'>('info');
  const [formData, setFormData] = useState<RegisterFormData | null>(null);
  const [selectedSector, setSelectedSector] = useState<BusinessSector | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredSector, setHoveredSector] = useState<BusinessSector | null>(null);
  const navigate = useNavigate();
  const setUser = useUserStore(state => state.setUser);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      businessName: "",
      phone: "",
      password: ""
    }
  });

  const onSubmitInfo = (data: RegisterFormData) => {
    setFormData(data);
    setStep('sector');
  };

  const handleSectorSelection = (sector: BusinessSector) => {
    setSelectedSector(sector);
  };

  const handleContinue = () => {
    if (!formData || !selectedSector) return;
    
    const user = {
      id: crypto.randomUUID(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      businessName: formData.businessName,
      businessSector: selectedSector,
      isAuthenticated: true,
      onboardingComplete: true
    };
    
    setUser(user);
    navigate(`/dashboard?secteur=${selectedSector}`);
  };

  const handleDefaultChoice = () => {
    if (!formData) return;
    
    const user = {
      id: crypto.randomUUID(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      businessName: formData.businessName,
      businessSector: 'commerce' as BusinessSector,
      isAuthenticated: true,
      onboardingComplete: true
    };
    
    setUser(user);
    navigate('/dashboard?secteur=commerce');
  };

  const sectorOptions = [
    {
      id: 'restaurant' as BusinessSector,
      title: 'Restaurant & Alimentation',
      subtitle: 'Maquis, livraison, traiteur',
      description: 'Automatisez vos commandes et livraisons',
      icon: '🍽️',
      gradient: 'from-orange-400 via-red-500 to-pink-500',
      bgGradient: 'from-accent/10 to-accent/20',
      borderColor: 'border-accent/30',
      hoverShadow: 'hover:shadow-accent/30',
      benefits: ['Menu digital intelligent', 'Commandes automatisées', 'Gestion livraisons'],
      keywords: ['restaurant', 'alimentation', 'livraison', 'menu', 'commandes', 'maquis', 'traiteur'],
      stats: { users: '2.3k+', growth: '+45%' },
      isPopular: false,
      isTrending: true
    },
    {
      id: 'commerce' as BusinessSector,
      title: 'Commerce & E-shop',
      subtitle: 'Boutiques, magasins, vente en ligne',
      description: 'Vendez 24/7 avec votre assistant IA',
      icon: '🏪',
      gradient: 'from-blue-400 via-purple-500 to-indigo-600',
      bgGradient: 'from-primary/10 to-primary/20',
      borderColor: 'border-primary/30',
      hoverShadow: 'hover:shadow-primary/30',
      benefits: ['Catalogue auto-géré', 'Ventes 24h/7j', 'Stock optimisé'],
      keywords: ['commerce', 'boutique', 'vente', 'e-shop', 'produits', 'magasin'],
      stats: { users: '5.1k+', growth: '+67%' },
      isPopular: true,
      isTrending: false
    },
    {
      id: 'services' as BusinessSector,
      title: 'Services Professionnels',
      subtitle: 'Consulting, réparations, formations',
      description: 'Gérez vos RDV et devis automatiquement',
      icon: '🔧',
      gradient: 'from-green-400 via-emerald-500 to-teal-600',
      bgGradient: 'from-success/10 to-success/20',
      borderColor: 'border-success/30',
      hoverShadow: 'hover:shadow-success/30',
      benefits: ['Devis en 2 clics', 'Planning automatique', 'Suivi client pro'],
      keywords: ['services', 'consulting', 'rendez-vous', 'devis', 'planning', 'réparation'],
      stats: { users: '1.8k+', growth: '+52%' },
      isPopular: false,
      isTrending: true
    },
    {
      id: 'hospitality' as BusinessSector,
      title: 'Hôtellerie & Tourisme',
      subtitle: 'Hôtels, auberges, locations',
      description: 'Réservations et check-in automatisés',
      icon: '🏨',
      gradient: 'from-purple-400 via-pink-500 to-rose-500',
      bgGradient: 'from-secondary/10 to-secondary/20',
      borderColor: 'border-secondary/30',
      hoverShadow: 'hover:shadow-secondary/30',
      benefits: ['Réservations 24/7', 'Gestion des chambres', 'Check-in automatique'],
      keywords: ['hôtel', 'réservation', 'chambre', 'hébergement', 'tourisme', 'auberge'],
      stats: { users: '890+', growth: '+38%' },
      isPopular: false,
      isTrending: false
    }
  ];

  const filteredSectors = useMemo(() => {
    if (!searchQuery) return sectorOptions;
    const query = searchQuery.toLowerCase();
    return sectorOptions.filter(sector => 
      sector.title.toLowerCase().includes(query) ||
      sector.subtitle.toLowerCase().includes(query) ||
      sector.description.toLowerCase().includes(query) ||
      sector.benefits.some(benefit => benefit.toLowerCase().includes(query)) ||
      sector.keywords.some(keyword => keyword.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  if (step === 'sector') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <Button 
                variant="ghost" 
                className="mb-8 text-white/80 hover:text-white hover:bg-white/10" 
                onClick={() => setStep('info')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              
              <div className="max-w-4xl mx-auto">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-6xl font-bold text-white mb-6"
                >
                  Choisissez votre{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    secteur d'activité
                  </span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl text-white/80 mb-8 leading-relaxed"
                >
                  Sélectionnez votre domaine pour personnaliser votre assistant IA WhatsApp
                </motion.p>

                {/* Search */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative max-w-md mx-auto"
                >
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                  <Input
                    placeholder="Rechercher votre secteur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-primary/60"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Sector Cards */}
            <AnimatePresence mode="wait">
              {filteredSectors.length > 0 ? (
                <motion.div 
                  key="sectors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 mb-12"
                >
                  {filteredSectors.map((sector, index) => (
                    <motion.div
                      key={sector.id}
                      initial={{ opacity: 0, y: 40, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }}
                      whileHover={{ 
                        y: -8,
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                      onHoverStart={() => setHoveredSector(sector.id)}
                      onHoverEnd={() => setHoveredSector(null)}
                    >
                      <Card 
                        className={`
                          relative cursor-pointer transition-all duration-300 overflow-hidden group
                          bg-gradient-to-br ${sector.bgGradient} backdrop-blur-sm
                          border-2 ${selectedSector === sector.id ? 'border-white shadow-2xl shadow-white/25' : `${sector.borderColor} hover:border-white/50`}
                          ${sector.hoverShadow} hover:shadow-2xl
                          h-full min-h-[320px]
                        `}
                        onClick={() => handleSectorSelection(sector.id)}
                      >
                        {/* Badges */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                          {sector.isPopular && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                              <Star className="h-3 w-3 mr-1" />
                              Populaire
                            </Badge>
                          )}
                          {sector.isTrending && (
                            <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-lg">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Tendance
                            </Badge>
                          )}
                        </div>

                        {/* Selection Indicator */}
                        <AnimatePresence>
                          {selectedSector === sector.id && (
                            <motion.div 
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="absolute top-4 left-4 bg-white text-green-600 rounded-full p-2 shadow-lg z-20"
                            >
                              <Check className="h-4 w-4" />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${sector.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                        
                        {/* Animated Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
                        </div>

                        <CardContent className="p-8 relative z-10 h-full flex flex-col">
                          {/* Icon with Animation */}
                          <motion.div 
                            className="text-6xl mb-6 text-center"
                            animate={hoveredSector === sector.id ? { 
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0]
                            } : {}}
                            transition={{ duration: 0.6 }}
                          >
                            {sector.icon}
                          </motion.div>
                          
                          {/* Title & Subtitle */}
                          <div className="text-center mb-6 flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                              {sector.title}
                            </h3>
                            <p className="text-sm font-medium text-gray-600 mb-3">
                              {sector.subtitle}
                            </p>
                            <p className="text-sm text-gray-700 font-medium bg-white/60 px-3 py-2 rounded-full">
                              {sector.description}
                            </p>
                          </div>

                          {/* Stats */}
                          <div className="flex justify-center gap-6 mb-6">
                            <div className="text-center">
                              <p className="text-lg font-bold text-gray-900">{sector.stats.users}</p>
                              <p className="text-xs text-gray-600">utilisateurs</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-green-600">{sector.stats.growth}</p>
                              <p className="text-xs text-gray-600">croissance</p>
                            </div>
                          </div>

                          {/* Benefits */}
                          <div className="space-y-2">
                            {sector.benefits.map((benefit, idx) => (
                              <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + idx * 0.1 }}
                                className="flex items-center gap-2 text-sm text-gray-700 bg-white/40 px-3 py-2 rounded-lg"
                              >
                                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                                <span className="font-medium">{benefit}</span>
                              </motion.div>
                            ))}
                          </div>

                          {/* Hover Effect Arrow */}
                          <motion.div 
                            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                            animate={hoveredSector === sector.id ? { x: [0, 5, 0] } : {}}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <ChevronRight className="h-6 w-6 text-gray-600" />
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="no-results"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-16"
                >
                  <div className="text-6xl mb-6">🔍</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Aucun résultat trouvé</h3>
                  <p className="text-white/80 mb-8">
                    Essayez d'autres mots-clés ou{" "}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-cyan-400 hover:text-cyan-300" 
                      onClick={() => setSearchQuery("")}
                    >
                      voir tous les secteurs
                    </Button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Alternative Choice */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <Button 
                variant="link" 
                className="text-white/60 hover:text-primary" 
                onClick={handleDefaultChoice}
              >
                Je ne sais pas — choisir Commerce par défaut
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Floating Action Bar */}
        <AnimatePresence>
          {selectedSector && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-white/20 p-6 z-50"
            >
              <div className="container mx-auto max-w-6xl flex items-center justify-between">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-4"
                >
                  <div className="text-4xl">
                    {sectorOptions.find(s => s.id === selectedSector)?.icon}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Secteur sélectionné</p>
                    <p className="text-sm text-gray-600">
                      {sectorOptions.find(s => s.id === selectedSector)?.title}
                    </p>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  <Button 
                    size="lg" 
                    onClick={handleContinue}
                    className="min-w-[180px] bg-gradient-primary hover:shadow-glow text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Continuer
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>
            
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Créer votre compte Whalix
            </CardTitle>
            <CardDescription className="text-gray-600">
              Commencez votre transformation digitale en quelques minutes
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitInfo)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                        <Building className="h-4 w-4" />
                        Nom de l'entreprise
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Restaurant Chez Fatou" 
                          className="h-12 bg-white/80 border-gray-200 focus:border-primary focus:ring-primary/20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                          <User className="h-4 w-4" />
                          Prénom
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Votre prénom" 
                            className="h-12 bg-white/80 border-gray-200 focus:border-primary focus:ring-primary/20"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Nom</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Votre nom" 
                            className="h-12 bg-white/80 border-gray-200 focus:border-primary focus:ring-primary/20"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                        <Phone className="h-4 w-4" />
                        Numéro de téléphone
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground">
                            <span className="text-sm font-medium">🇨🇮 +225</span>
                            <div className="w-px h-4 bg-border"></div>
                          </div>
                          <Input 
                            placeholder="0123456789" 
                            className="h-12 bg-white/80 border-gray-200 focus:border-primary focus:ring-primary/20 pl-20"
                            maxLength={10}
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-medium">
                        <User className="h-4 w-4" />
                        Mot de passe
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="Minimum 6 caractères" 
                          className="h-12 bg-white/80 border-gray-200 focus:border-primary focus:ring-primary/20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-primary hover:shadow-glow text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2"
                  >
                    Continuer
                    <ChevronRight className="h-4 w-4" />
                  </motion.span>
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte ?{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary hover:text-primary-hover font-medium" 
                  onClick={() => navigate('/login')}
                >
                  Se connecter
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

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

export default Register;