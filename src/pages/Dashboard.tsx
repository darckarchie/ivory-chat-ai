import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Bot, 
  BarChart3, 
  MessageSquare, 
  Users, 
  Settings, 
  Package, 
  Calendar,
  TrendingUp,
  Sparkles,
  LogOut,
  Building
} from "lucide-react"

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useUserStore()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  if (!user) return null

  const getSectorConfig = () => {
    switch (user.businessSector) {
      case 'restaurant':
        return {
          title: 'Dashboard Restaurant',
          color: 'bg-orange-500',
          features: [
            { icon: MessageSquare, title: 'Assistant IA Menu', description: 'Créez et optimisez vos menus', status: 'active' },
            { icon: Users, title: 'Service Client IA', description: 'Répondez aux clients automatiquement', status: 'active' },
            { icon: Package, title: 'Gestion Commandes', description: 'Suivez vos commandes en temps réel', status: 'coming' },
            { icon: BarChart3, title: 'Analytics Restaurant', description: 'Analysez vos performances', status: 'coming' },
          ]
        }
      case 'commerce':
        return {
          title: 'Dashboard E-Commerce',
          color: 'bg-blue-500',
          features: [
            { icon: Bot, title: 'Assistant Vente IA', description: 'Conseillez vos clients intelligemment', status: 'active' },
            { icon: Package, title: 'Gestion Catalogue', description: 'Gérez votre inventaire facilement', status: 'active' },
            { icon: TrendingUp, title: 'Optimisation Prix', description: 'Prix intelligents basés sur le marché', status: 'coming' },
            { icon: BarChart3, title: 'Analytics Ventes', description: 'Tableaux de bord détaillés', status: 'coming' },
          ]
        }
      case 'services':
        return {
          title: 'Dashboard Services Pro',
          color: 'bg-green-500',
          features: [
            { icon: Bot, title: 'Assistant IA Devis', description: 'Générez des devis automatiquement', status: 'active' },
            { icon: Calendar, title: 'Gestion RDV', description: 'Planifiez vos rendez-vous', status: 'active' },
            { icon: Users, title: 'CRM Clients', description: 'Suivez vos relations clients', status: 'coming' },
            { icon: BarChart3, title: 'Analytics Business', description: 'Analysez votre activité', status: 'coming' },
          ]
        }
      default:
        return {
          title: 'Dashboard',
          color: 'bg-primary',
          features: []
        }
    }
  }

  const sectorConfig = getSectorConfig()
  const activeFeatures = sectorConfig.features.filter(f => f.status === 'active')
  const comingFeatures = sectorConfig.features.filter(f => f.status === 'coming')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-primary">Whalix</span>
              </div>
              <Badge variant="secondary" className="hidden sm:flex">
                {user.businessSector}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground">{user.businessName}</p>
              </div>
              <Avatar>
                <AvatarFallback className={sectorConfig.color}>
                  {user.firstName[0]}{user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Bienvenue sur votre {sectorConfig.title}
          </h1>
          <p className="text-muted-foreground">
            Transformez votre entreprise avec l'intelligence artificielle adaptée au marché ivoirien
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${sectorConfig.color}`}>
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">Entreprise connectée</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeFeatures.length}</p>
                  <p className="text-sm text-muted-foreground">Outils IA disponibles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0%</p>
                  <p className="text-sm text-muted-foreground">Croissance ce mois</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Nouveau</p>
                  <p className="text-sm text-muted-foreground">Statut du compte</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Outils disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeFeatures.map((feature, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${sectorConfig.color}`}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <Badge variant="secondary" className="w-fit">Disponible</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                  <Button className="w-full mt-4">
                    Utiliser maintenant
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Coming Soon Features */}
        {comingFeatures.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Bientôt disponible</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {comingFeatures.map((feature, index) => (
                <Card key={index} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <feature.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-muted-foreground">{feature.title}</CardTitle>
                        <Badge variant="outline">Bientôt</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {feature.description}
                    </CardDescription>
                    <Button variant="secondary" disabled className="w-full mt-4">
                      En développement
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard