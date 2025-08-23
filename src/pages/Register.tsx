import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useUserStore, BusinessSector } from "@/lib/store";
import { ArrowLeft, Building, Phone, User, Search, Check, ChevronRight, Sparkles } from "lucide-react";
const registerSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  businessName: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
  phone: z.string().regex(/^\+225\d{8,10}$/, "Format: +225XXXXXXXX")
});
type RegisterFormData = z.infer<typeof registerSchema>;
const Register = () => {
  const [step, setStep] = useState<'info' | 'sector'>('info');
  const [formData, setFormData] = useState<RegisterFormData | null>(null);
  const [selectedSector, setSelectedSector] = useState<BusinessSector | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const setUser = useUserStore(state => state.setUser);
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      businessName: "",
      phone: "+225"
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
      isAuthenticated: true
    };
    setUser(user);
    navigate(`/onboarding?sector=${selectedSector}`);
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
      isAuthenticated: true
    };
    setUser(user);
    navigate('/onboarding?sector=commerce');
  };
  const sectorOptions = [{
    id: 'restaurant' as BusinessSector,
    title: 'Restaurant & Alimentation',
    description: 'Servez plus, tapez moins',
    icon: '🍽️',
    benefits: ['Menu digital intelligent', 'Commandes automatisées', 'Service client IA'],
    keywords: ['restaurant', 'alimentation', 'livraison', 'menu', 'commandes'],
    isPopular: false
  }, {
    id: 'commerce' as BusinessSector,
    title: 'Commerce & E-shop',
    description: 'Vendez pendant que vous dormez',
    icon: '🏪',
    benefits: ['Catalogue auto-géré', 'Ventes 24h/7j', 'Stock optimisé'],
    keywords: ['commerce', 'boutique', 'vente', 'e-shop', 'produits'],
    isPopular: true
  }, {
    id: 'services' as BusinessSector,
    title: 'Services Professionnels',
    description: 'Dites stop au chaos des RDV',
    icon: '🔧',
    benefits: ['Devis en 2 clics', 'Planning automatique', 'Suivi client pro'],
    keywords: ['services', 'consulting', 'rendez-vous', 'devis', 'planning'],
    isPopular: false
  }, {
    id: 'hospitality' as BusinessSector,
    title: 'Hôtellerie & Réservations',
    description: 'Gérez vos réservations en automatique',
    icon: '🏨',
    benefits: ['Réservations 24/7', 'Gestion des chambres', 'Check-in automatique'],
    keywords: ['hôtel', 'réservation', 'chambre', 'hébergement', 'tourisme'],
    isPopular: false
  }];
  const filteredSectors = useMemo(() => {
    if (!searchQuery) return sectorOptions;
    const query = searchQuery.toLowerCase();
    return sectorOptions.filter(sector => sector.title.toLowerCase().includes(query) || sector.description.toLowerCase().includes(query) || sector.benefits.some(benefit => benefit.toLowerCase().includes(query)) || sector.keywords.some(keyword => keyword.toLowerCase().includes(query)));
  }, [searchQuery]);
  if (step === 'sector') {
    return <div className="min-h-screen bg-gradient-hero relative">
        <div className="container mx-auto px-4 py-8 pb-24">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="text-center mb-8">
              <Button variant="ghost" className="mb-6" onClick={() => setStep('info')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              
              <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-primary mb-4">
                  Choisissez votre secteur d'activité
                </h1>
                <p className="text-muted-foreground text-lg mb-8">
                  Sélectionnez le secteur qui correspond le mieux à votre entreprise pour personnaliser Whalix
                </p>
              </div>

              {/* Search */}
              <div className="relative max-w-md mx-auto mb-8">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher un secteur ou une fonctionnalité…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </motion.div>

            {/* Sector Cards */}
            <div role="radiogroup" aria-label="Choisir votre secteur d'activité" className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {filteredSectors.length > 0 ? filteredSectors.map((sector, index) => <motion.div key={sector.id} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: index * 0.1
            }} whileHover={{
              y: -4
            }} whileTap={{
              scale: 0.98
            }}>
                  <Card role="radio" aria-checked={selectedSector === sector.id} tabIndex={0} className={`
                      relative cursor-pointer transition-all duration-200 hover:shadow-lg group
                      ${selectedSector === sector.id ? 'ring-2 ring-primary ring-offset-2 shadow-lg border-primary' : 'border-border hover:border-muted-foreground'}
                    `} onClick={() => handleSectorSelection(sector.id)} onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSectorSelection(sector.id);
                }
              }}>
                    {/* Popular Badge */}
                    {sector.isPopular && <Badge className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Populaire
                      </Badge>}

                    {/* Selection Indicator */}
                    {selectedSector === sector.id && <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>}

                    <CardContent className="p-6">
                      {/* Icon */}
                      <div className="text-4xl mb-4 text-center">
                        {sector.icon}
                      </div>
                      
                      {/* Title & Description */}
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
                          {sector.title}
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm font-medium text-primary mb-3">
                          {sector.description}
                        </p>
                      </div>

                      {/* Benefits */}
                      <div className="space-y-2">
                        {sector.benefits.map((benefit, idx) => <div key={idx} className="text-xs text-muted-foreground bg-secondary/40 px-3 py-1.5 rounded-full text-center">
                            {benefit}
                          </div>)}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>) : <motion.div initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} className="col-span-full text-center py-12">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">Aucun résultat trouvé</h3>
                  <p className="text-sm text-muted-foreground">
                    Essayez d'autres mots-clés ou{" "}
                    <Button variant="link" className="p-0 h-auto text-sm" onClick={() => setSearchQuery("")}>
                      voir tous les secteurs
                    </Button>
                  </p>
                </motion.div>}
            </div>

            {/* Alternative Choice */}
            <div className="text-center">
              <Button variant="link" className="text-sm text-muted-foreground" onClick={handleDefaultChoice}>
                Je ne sais pas — choisir Commerce par défaut
              </Button>
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <motion.div initial={{
        y: 100
      }} animate={{
        y: 0
      }} className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4 z-50">
          <div className="container mx-auto max-w-4xl flex items-center justify-between">
            {selectedSector ? <div className="flex items-center gap-3">
                <div className="text-2xl">{sectorOptions.find(s => s.id === selectedSector)?.icon}</div>
                <div>
                  <p className="text-sm font-medium">Secteur sélectionné</p>
                  <p className="text-xs text-muted-foreground">
                    {sectorOptions.find(s => s.id === selectedSector)?.title}
                  </p>
                </div>
              </div> : <div className="text-sm text-muted-foreground">
                Sélectionnez un secteur pour continuer
              </div>}
            
            <Button size="lg" disabled={!selectedSector} onClick={handleContinue} className="min-w-[140px]">
              Continuer
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">Créer votre compte Whalix</CardTitle>
          <CardDescription>
            Commencez votre transformation digitale en quelques minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitInfo)} className="space-y-4">
              <FormField control={form.control} name="businessName" render={({
              field
            }) => <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Nom de l'entreprise
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Restaurant Chez Fatou" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({
                field
              }) => <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Prénom
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Votre prénom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="lastName" render={({
                field
              }) => <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>

              <FormField control={form.control} name="phone" render={({
              field
            }) => <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Numéro de téléphone
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+225XXXXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <Button type="submit" className="w-full" size="lg">
                Continuer
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/login')}>
                Se connecter
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default Register;