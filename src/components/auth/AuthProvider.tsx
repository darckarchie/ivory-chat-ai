import React, { createContext, useContext, useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabase';
// import { supabaseService } from '@/lib/services/supabase-service';
import { useUserStore } from '@/lib/store';

interface AuthContextType {
  user: any;
  tenant: any;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

interface SignUpData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  business_name: string;
  business_sector: 'restaurant' | 'commerce' | 'services' | 'hospitality';
  phone: string; // 10 chiffres locaux
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const setStoreUser = useUserStore(state => state.setUser);

  useEffect(() => {
    // SUPABASE DÉSACTIVÉ TEMPORAIREMENT
    console.log('🔄 Mode démo - Supabase désactivé');
    setLoading(false);
    
    // // Vérifier la session existante
    // supabase.auth.getSession().then(({ data: { session } }) => {
    //   if (session?.user) {
    //     loadUserProfile(session.user.id);
    //   } else {
    //     setLoading(false);
    //   }
    // });

    // // Écouter les changements d'auth
    // const { data: { subscription } } = supabase.auth.onAuthStateChange(
    //   async (event, session) => {
    //     if (session?.user) {
    //       await loadUserProfile(session.user.id);
    //     } else {
    //       setUser(null);
    //       setTenant(null);
    //       setStoreUser(null);
    //       setLoading(false);
    //     }
    //   }
    // );

    // return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      // SUPABASE DÉSACTIVÉ - Utiliser profil démo
      const profile = {
        id: userId,
        first_name: 'Utilisateur',
        last_name: 'Démo',
        phone: '+22501234567',
        tenant_id: 'demo-tenant',
        tenant: {
          id: 'demo-tenant',
          name: 'Entreprise Démo',
          business_sector: 'commerce'
        }
      };
      
      // const profile = await supabaseService.getCurrentUser();
      
      if (profile) {
        setUser(profile);
        setTenant(profile.tenant);
        
        // Synchroniser avec le store Zustand
        setStoreUser({
          id: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          phone: profile.phone,
          businessName: profile.tenant.name,
          businessSector: profile.tenant.business_sector,
          isAuthenticated: true,
          onboardingComplete: true
        });
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: SignUpData) => {
    setLoading(true);
    try {
      // SUPABASE DÉSACTIVÉ - Simulation inscription
      console.log('🔄 Mode démo - Inscription simulée');
      
      const result = {
        user: {
          id: `demo-user-${Date.now()}`,
          email: data.email
        }
      };
      
      // const result = await supabaseService.signUp(
      //   data.email,
      //   data.password,
      //   {
      //     first_name: data.first_name,
      //     last_name: data.last_name,
      //     business_name: data.business_name,
      //     business_sector: data.business_sector,
      //     phone: data.phone
      //   }
      // );
      
      // Charger le profil complet
      await loadUserProfile(result.user.id);
      
    } catch (error) {
      console.error('Erreur inscription:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // SUPABASE DÉSACTIVÉ - Simulation connexion
      console.log('🔄 Mode démo - Connexion simulée');
      
      const authUser = {
        id: `demo-user-${Date.now()}`,
        email: email
      };
      
      // const { user: authUser } = await supabaseService.signIn(email, password);
      if (authUser) {
        await loadUserProfile(authUser.id);
      }
    } catch (error) {
      console.error('Erreur connexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // SUPABASE DÉSACTIVÉ - Simulation déconnexion
      console.log('🔄 Mode démo - Déconnexion simulée');
      
      // await supabaseService.signOut();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      tenant,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}