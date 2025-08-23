import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserStore, BusinessSector } from "@/lib/store";
import { ArrowLeft, Building, MessageCircle, Bot, ChevronRight, Check } from "lucide-react";

interface OnboardingFlowProps {
  prefillSector: BusinessSector;
}

const profileSchema = z.object({
  businessName: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
  sector: z.string(),
  country: z.string(),
  currency: z.string()
});

const whatsappSchema = z.object({
  phone: z.string().regex(/^\+225\d{8,10}$/, "Format: +225XXXXXXXX"),
  autoReply: z.boolean()
});

const assistantSchema = z.object({
  style: z.enum(['poli', 'energique', 'pro']),
  language: z.enum(['fr', 'en', 'auto']),
  useTu: z.boolean()
});

type ProfileData = z.infer<typeof profileSchema>;
type WhatsAppData = z.infer<typeof whatsappSchema>;
type AssistantData = z.infer<typeof assistantSchema>;

const OnboardingFlow = ({ prefillSector }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [whatsappData, setWhatsappData] = useState<WhatsAppData | null>(null);
  const navigate = useNavigate();
  const setUser = useUserStore(state => state.setUser);
  const user = useUserStore(state => state.user);

  const sectorLabels = {
    restaurant: 'Restaurant & Alimentation',
    commerce: 'Commerce & E-shop',
    services: 'Services Professionnels'
  };

  // Step 1: Profile Form
  const profileDefaults = useMemo<ProfileData>(() => ({
    businessName: user?.businessName || "",
    sector: prefillSector,
    country: "Côte d'Ivoire",
    currency: "FCFA",
  }), [user?.businessName, prefillSector]);

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: profileDefaults,
  });

  // Step 2: WhatsApp Form
  const whatsappDefaults = useMemo<WhatsAppData>(() => ({
    phone: user?.phone || "+225",
    autoReply: true,
  }), [user?.phone]);

  const whatsappForm = useForm<WhatsAppData>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: whatsappDefaults,
  });

  // Step 3: Assistant Form
  const assistantDefaults = useMemo<AssistantData>(() => ({
    style: 'poli',
    language: 'fr',
    useTu: true,
  }), []);

  const assistantForm = useForm<AssistantData>({
    resolver: zodResolver(assistantSchema),
    defaultValues: assistantDefaults,
  });

  const onProfileSubmit = (data: ProfileData) => {
    setProfileData(data);
    setCurrentStep(2);
  };

  const onWhatsAppSubmit = (data: WhatsAppData) => {
    setWhatsappData(data);
    setCurrentStep(3);
  };

  const onAssistantSubmit = (data: AssistantData) => {
    if (!profileData || !whatsappData || !user) return;

    // Update user with onboarding data
    const updatedUser = {
      ...user,
      businessName: profileData.businessName,
      phone: whatsappData.phone,
      onboardingComplete: true,
      whatsappSettings: {
        autoReply: whatsappData.autoReply
      },
      assistantSettings: {
        style: data.style,
        language: data.language,
        useTu: data.useTu
      }
    };

    setUser(updatedUser);
    navigate(`/dashboard?secteur=${prefillSector}`);
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/register');
    }
  };

  const StepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${currentStep >= step 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
              }
            `}>
              {currentStep > step ? <Check className="h-4 w-4" /> : step}
            </div>
            {step < 3 && (
              <div className={`
                w-8 h-0.5 mx-2
                ${currentStep > step ? 'bg-primary' : 'bg-muted'}
              `} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <Button variant="ghost" className="self-start mb-4" onClick={goBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            
            <StepIndicator />
            
            <CardTitle className="text-xl text-primary">
              {currentStep === 1 && "Profil de votre entreprise"}
              {currentStep === 2 && "Configuration WhatsApp"}
              {currentStep === 3 && "Votre assistant IA"}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {/* Step 1: Profile */}
            {currentStep === 1 && (
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Nom d'entreprise
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Restaurant Chez Fatou" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secteur d'activité</FormLabel>
                        <FormControl>
                          <Input
                            value={sectorLabels[field.value as keyof typeof sectorLabels] || field.value}
                            readOnly
                            disabled
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pays</FormLabel>
                          <FormControl>
                            <Input value={field.value} readOnly disabled />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Devise</FormLabel>
                          <FormControl>
                            <Input value={field.value} readOnly disabled />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Continuer
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </form>
              </Form>
            )}

            {/* Step 2: WhatsApp */}
            {currentStep === 2 && (
              <Form {...whatsappForm}>
                <form onSubmit={whatsappForm.handleSubmit(onWhatsAppSubmit)} className="space-y-6">
                  <FormField
                    control={whatsappForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Numéro WhatsApp
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="+225XXXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={whatsappForm.control}
                    name="autoReply"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                        <div className="space-y-1">
                          <FormLabel className="text-base font-medium">
                            Réponse automatique
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            L'IA répond automatiquement aux questions simples
                          </p>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="text-xs text-muted-foreground bg-secondary/40 p-3 rounded-lg">
                    <p className="mb-1"><strong>Que fait la réponse automatique ?</strong></p>
                    <p>• Répond aux questions sur vos horaires, prix et stock</p>
                    <p>• Confirme avec votre équipe pour les demandes complexes</p>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Continuer
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </form>
              </Form>
            )}

            {/* Step 3: Assistant */}
            {currentStep === 3 && (
              <Form {...assistantForm}>
                <form onSubmit={assistantForm.handleSubmit(onAssistantSubmit)} className="space-y-6">
                  <FormField
                    control={assistantForm.control}
                    name="style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          Style de l'assistant
                        </FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="poli">😊 Poli - Courtois et respectueux</SelectItem>
                            <SelectItem value="energique">⚡ Énergique - Dynamique et enthousiaste</SelectItem>
                            <SelectItem value="pro">💼 Pro - Formel et professionnel</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={assistantForm.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Langue principale</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fr">🇫🇷 Français</SelectItem>
                            <SelectItem value="en">🇬🇧 Anglais</SelectItem>
                            <SelectItem value="auto">🌍 Automatique</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={assistantForm.control}
                    name="useTu"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                        <div className="space-y-1">
                          <FormLabel className="text-base font-medium">
                            Tutoiement
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Utilise "tu" avec les clients pour plus de proximité
                          </p>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" size="lg">
                    Terminer
                    <Check className="h-4 w-4 ml-2" />
                  </Button>
                </form>
              </Form>
            )}

            {/* Skip option */}
            {currentStep > 1 && (
              <div className="mt-4 text-center">
                <Button 
                  variant="link" 
                  className="text-sm text-muted-foreground"
                  onClick={() => {
                    if (currentStep === 2) {
                      setWhatsappData({ phone: "+225", autoReply: true });
                      setCurrentStep(3);
                    } else if (currentStep === 3) {
                      assistantForm.handleSubmit(onAssistantSubmit)();
                    }
                  }}
                >
                  Configurer plus tard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default OnboardingFlow;