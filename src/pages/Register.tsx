import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useUserStore, BusinessSector } from "@/lib/store"
import { ArrowLeft, Building, Phone, User } from "lucide-react"

const registerSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  businessName: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
  phone: z.string().regex(/^\+225\d{8,10}$/, "Format: +225XXXXXXXX"),
})

type RegisterFormData = z.infer<typeof registerSchema>

const Register = () => {
  const [step, setStep] = useState<'info' | 'sector'>('info')
  const [formData, setFormData] = useState<RegisterFormData | null>(null)
  const navigate = useNavigate()
  const setUser = useUserStore(state => state.setUser)

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      businessName: "",
      phone: "+225",
    },
  })

  const onSubmitInfo = (data: RegisterFormData) => {
    setFormData(data)
    setStep('sector')
  }

  const handleSectorChoice = (sector: BusinessSector) => {
    if (!formData) return

    const user = {
      id: crypto.randomUUID(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      businessName: formData.businessName,
      businessSector: sector,
      isAuthenticated: true,
    }

    setUser(user)
    navigate('/dashboard')
  }

  const sectorOptions = [
    {
      id: 'restaurant' as BusinessSector,
      title: 'Restaurant & Alimentation',
      description: 'Restaurants, bars, alimentation, livraison',
      icon: '🍽️',
      examples: ['Menu digital', 'Gestion commandes', 'Service client IA']
    },
    {
      id: 'commerce' as BusinessSector,
      title: 'Commerce & E-shop',
      description: 'Boutique, vente en ligne, distribution',
      icon: '🏪',
      examples: ['Catalogue produits', 'Gestion stock', 'Assistant vente']
    },
    {
      id: 'services' as BusinessSector,
      title: 'Services Professionnels',
      description: 'Consulting, réparation, services aux entreprises',
      icon: '🔧',
      examples: ['Devis automatique', 'Planning RDV', 'Suivi clients']
    }
  ]

  if (step === 'sector') {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              className="w-fit mb-4"
              onClick={() => setStep('info')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <CardTitle className="text-2xl text-primary">Choisissez votre secteur d'activité</CardTitle>
            <CardDescription>
              Sélectionnez le secteur qui correspond le mieux à votre entreprise pour personnaliser Whalix
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {sectorOptions.map((sector) => (
                <Card 
                  key={sector.id}
                  className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary"
                  onClick={() => handleSectorChoice(sector.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{sector.icon}</div>
                    <h3 className="text-lg font-semibold text-primary mb-2">{sector.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{sector.description}</p>
                    <div className="space-y-1">
                      {sector.examples.map((example, index) => (
                        <div key={index} className="text-xs bg-secondary/20 px-2 py-1 rounded">
                          {example}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
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
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Nom de l'entreprise
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Restaurant Chez Fatou" {...field} />
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
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Prénom
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Votre prénom" {...field} />
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
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom" {...field} />
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
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Numéro de téléphone
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+225XXXXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
    </div>
  )
}

export default Register