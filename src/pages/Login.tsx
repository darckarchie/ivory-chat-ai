import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Phone, Lock, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/AuthProvider"
import { motion } from "framer-motion"

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
      // Convertir le numéro en email pour Supabase
      const email = `user-${data.phone}@whalix.ci`
      
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
        description: "Vérifiez votre numéro et mot de passe",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
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
              <MessageSquare className="h-8 w-8 text-white" />
            </motion.div>
            
            <CardTitle className="text-2xl font-bold text-primary">
              Connexion Whalix
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Connectez-vous avec votre numéro de téléphone
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <Lock className="h-4 w-4" />
                        Mot de passe
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Votre mot de passe" 
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
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                  ) : (
                    <Phone className="h-5 w-5 mr-2" />
                  )}
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center space-y-4">
              <Button variant="link" className="text-sm text-muted-foreground hover:text-primary">
                Mot de passe oublié ?
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Pas encore de compte ?{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary hover:text-primary-hover font-medium" 
                  onClick={() => navigate('/register')}
                >
                  Créer un compte
                </Button>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground text-center">
                🇨🇮 <strong>Spécialement conçu pour la Côte d'Ivoire</strong><br/>
                Utilisez votre numéro ivoirien pour vous connecter
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default Login