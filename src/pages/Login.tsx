import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Phone, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/AuthProvider"

const loginSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, "Format: 10 chiffres (ex: 0123456789)"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
})

type LoginFormData = z.infer<typeof loginSchema>

const Login = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    try {
      // Générer l'email à partir du numéro
      const cleanPhone = data.phone.replace(/[^0-9]/g, '')
      const email = `user-${cleanPhone}@whalix.ci`
      
      await signIn(email, data.password)
      
      toast({
        title: "✅ Connexion réussie !",
        description: "Bienvenue dans votre dashboard Whalix",
      })
      
      navigate('/dashboard')
      
    } catch (error) {
      console.error('Erreur connexion:', error)
      toast({
        title: "❌ Erreur de connexion",
        description: error instanceof Error ? error.message : "Vérifiez vos identifiants",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">Connexion à Whalix</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder à votre dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground">
                          <span className="text-sm font-medium">🇨🇮 +225</span>
                          <div className="w-px h-4 bg-border"></div>
                        </div>
                        <Input 
                          placeholder="0123456789" 
                          className="pl-20"
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
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Mot de passe
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Votre mot de passe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center space-y-4">
            <Button variant="link" className="text-sm">
              Mot de passe oublié ?
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/register')}>
                Créer un compte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login