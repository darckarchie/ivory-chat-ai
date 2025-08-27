import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/lib/store";
import { 
  Home, 
  MessageSquare, 
  Database, 
  BarChart3, 
  Settings,
  Plus,
  Zap
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  waitingMessages?: number;
  whatsappConnected?: boolean;
}

export function DashboardLayout({ children, waitingMessages = 0, whatsappConnected = false }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useUserStore(state => state.user);

  const navigation = [
    { name: 'Accueil', href: '/dashboard', icon: Home },
    { name: 'Messages', href: '/dashboard/conversations', icon: MessageSquare, badge: waitingMessages },
    { name: 'Produits', href: '/dashboard/knowledge-base', icon: Database },
    { name: 'Stats', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Réglages', href: '/dashboard/settings', icon: Settings }
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixe */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b">
        <div className="px-4 h-14 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Whalix
          </h1>
          <div className="flex items-center gap-2">
            {whatsappConnected && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <Zap className="h-3 w-3 mr-1" />
                IA Active
              </Badge>
            )}
            {waitingMessages > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {waitingMessages}
              </Badge>
            )}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">WhatsApp connecté</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Contenu principal avec padding pour header et bottom nav */}
      <main className="pt-14 pb-16 min-h-screen md:pl-64">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
      
      {/* Bottom Navigation Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t md:hidden">
        <div className="grid grid-cols-5 h-16">
          {navigation.map((item) => {
            const active = isActive(item.href);
            
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`
                  relative flex flex-col items-center justify-center gap-1
                  transition-colors duration-200
                  ${active 
                    ? 'text-primary' 
                    : 'text-gray-400 hover:text-gray-600'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute top-2 right-4 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:block fixed left-0 top-14 bottom-0 w-64 bg-white border-r">
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left
                  ${active 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
      
      {/* FAB Mobile pour actions rapides */}
      <button 
        onClick={() => navigate('/dashboard/knowledge-base')}
        className="md:hidden fixed bottom-20 right-4 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-hover transition-colors"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}