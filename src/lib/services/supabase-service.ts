import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

type Tables = Database['public']['Tables'];
type Tenant = Tables['tenants']['Row'];
type User = Tables['users']['Row'];
type WhatsAppSession = Tables['whatsapp_sessions']['Row'];
type Event = Tables['events']['Row'];
type Conversation = Tables['conversations']['Row'];
type Message = Tables['messages']['Row'];

// Utilitaire pour normaliser les numéros ivoiriens
export function normalizeCIPhone(input10: string): string {
  // Nettoyer le numéro
  const cleaned = input10.replace(/[^0-9]/g, '');
  
  // Vérifier exactement 10 chiffres
  if (!/^\d{10}$/.test(cleaned)) {
    throw new Error(`Numéro invalide (10 chiffres attendus, reçu ${cleaned.length})`);
  }
  
  // Vérifier que ça commence par 0
  if (!cleaned.startsWith('0')) {
    throw new Error('Numéro invalide: doit commencer par 0');
  }
  
  // Convertir en E.164 : +225 + (sans le 0 initial)
  return `+225${cleaned.substring(1)}`;
}

class SupabaseService {
  // === TENANTS ===
  
  async createTenant(data: {
    name: string;
    business_sector: 'restaurant' | 'commerce' | 'services' | 'hospitality';
    phone: string; // 10 chiffres locaux
  }) {
    const normalizedPhone = normalizeCIPhone(data.phone);
    
    const { data: tenant, error } = await supabase
      .from('tenants')
      .insert({
        name: data.name,
        business_sector: data.business_sector,
        phone: normalizedPhone
      })
      .select()
      .single();
      
    if (error) throw error;
    return tenant;
  }
  
  async getTenant(tenantId: string) {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();
      
    if (error) throw error;
    return data;
  }

  // === USERS ===
  
  async createUser(data: {
    tenant_id: string;
    first_name: string;
    last_name: string;
    phone: string; // 10 chiffres locaux
    role?: 'owner' | 'admin' | 'agent';
  }) {
    const normalizedPhone = normalizeCIPhone(data.phone);
    
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        id: (await supabase.auth.getUser()).data.user?.id!,
        tenant_id: data.tenant_id,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: normalizedPhone,
        role: data.role || 'owner'
      })
      .select()
      .single();
      
    if (error) throw error;
    return user;
  }
  
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        tenant:tenants(*)
      `)
      .eq('id', user.id)
      .single();
      
    if (error) throw error;
    return data;
  }

  // === WHATSAPP SESSIONS ===
  
  async createOrUpdateWhatsAppSession(data: {
    tenant_id: string;
    user_id: string;
    status: WhatsAppSession['status'];
    qr_code?: string;
    session_path?: string;
    wa_device_id?: string;
    phone_number?: string;
    last_error?: string;
  }) {
    const { data: session, error } = await supabase
      .from('whatsapp_sessions')
      .upsert({
        tenant_id: data.tenant_id,
        user_id: data.user_id,
        status: data.status,
        qr_code: data.qr_code,
        session_path: data.session_path,
        wa_device_id: data.wa_device_id,
        phone_number: data.phone_number,
        last_error: data.last_error,
        updated_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString()
      }, {
        onConflict: 'tenant_id'
      })
      .select()
      .single();
      
    if (error) throw error;
    return session;
  }
  
  async getWhatsAppSession(tenantId: string) {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error; // Ignore "not found"
    return data;
  }
  
  async updateSessionStatus(tenantId: string, status: WhatsAppSession['status'], extra?: {
    phone_number?: string;
    wa_device_id?: string;
    last_error?: string;
    qr_code?: string;
  }) {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .update({
        status,
        ...extra,
        updated_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString()
      })
      .eq('tenant_id', tenantId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  // === EVENTS LOGGING ===
  
  async logEvent(data: {
    tenant_id: string;
    user_id?: string;
    conversation_id?: string;
    type: Event['type'];
    payload?: any;
  }) {
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        tenant_id: data.tenant_id,
        user_id: data.user_id,
        conversation_id: data.conversation_id,
        type: data.type,
        payload: data.payload || {}
      })
      .select()
      .single();
      
    if (error) throw error;
    return event;
  }

  // === CONVERSATIONS ===
  
  async createOrUpdateConversation(data: {
    tenant_id: string;
    customer_phone: string;
    customer_name?: string;
    last_message?: string;
  }) {
    const { data: conversation, error } = await supabase
      .from('conversations')
      .upsert({
        tenant_id: data.tenant_id,
        customer_phone: data.customer_phone,
        customer_name: data.customer_name,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'tenant_id,customer_phone'
      })
      .select()
      .single();
      
    if (error) throw error;
    return conversation;
  }
  
  async getConversations(tenantId: string, limit = 50) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('last_message_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data;
  }

  // === MESSAGES ===
  
  async saveMessage(data: {
    tenant_id: string;
    conversation_id: string;
    wa_msg_id?: string;
    direction: 'inbound' | 'outbound';
    from_phone: string;
    to_phone: string;
    body: string;
    message_type?: 'text' | 'image' | 'document' | 'audio' | 'video';
    ai_generated?: boolean;
    ai_confidence?: number;
    intent_detected?: 'HIGH' | 'MEDIUM' | 'LOW';
    metadata?: any;
  }) {
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        tenant_id: data.tenant_id,
        conversation_id: data.conversation_id,
        wa_msg_id: data.wa_msg_id,
        direction: data.direction,
        from_phone: data.from_phone,
        to_phone: data.to_phone,
        body: data.body,
        message_type: data.message_type || 'text',
        ai_generated: data.ai_generated || false,
        ai_confidence: data.ai_confidence,
        intent_detected: data.intent_detected,
        metadata: data.metadata || {}
      })
      .select()
      .single();
      
    if (error) {
      // Ignorer les doublons (idempotence)
      if (error.code === '23505') {
        console.log('Message déjà existant, ignoré');
        return null;
      }
      throw error;
    }
    return message;
  }
  
  async getMessages(conversationId: string, limit = 100) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data;
  }

  // === MÉTRIQUES ===
  
  async getTenantMetrics(tenantId: string, date?: string) {
    const { data, error } = await supabase
      .rpc('get_tenant_metrics', {
        p_tenant_id: tenantId,
        p_date: date || new Date().toISOString().split('T')[0]
      });
      
    if (error) throw error;
    return data;
  }
  
  async getEventsByType(tenantId: string, eventType: Event['type'], limit = 100) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('type', eventType)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data;
  }

  // === AUTHENTIFICATION ===
  
  async signUp(email: string, password: string, userData: {
    first_name: string;
    last_name: string;
    business_name: string;
    business_sector: 'restaurant' | 'commerce' | 'services' | 'hospitality';
    phone: string; // 10 chiffres locaux
  }) {
    // 1. Créer l'utilisateur Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name
        }
      }
    });
    
    if (authError) throw authError;
    if (!authData.user) throw new Error('Erreur création utilisateur');
    
    // 2. Créer le tenant
    const tenant = await this.createTenant({
      name: userData.business_name,
      business_sector: userData.business_sector,
      phone: userData.phone
    });
    
    // 3. Créer l'utilisateur dans notre table
    const user = await this.createUser({
      tenant_id: tenant.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      role: 'owner'
    });
    
    // 4. Logger l'événement
    await this.logEvent({
      tenant_id: tenant.id,
      user_id: authData.user.id,
      type: 'user_login',
      payload: { signup: true, business_sector: userData.business_sector }
    });
    
    return { user: authData.user, tenant, profile: user };
  }
  
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Logger la connexion
    if (data.user) {
      const profile = await this.getCurrentUser();
      if (profile) {
        await this.logEvent({
          tenant_id: profile.tenant_id,
          user_id: data.user.id,
          type: 'user_login',
          payload: { login_method: 'email' }
        });
      }
    }
    
    return data;
  }
  
  async signOut() {
    const user = await this.getCurrentUser();
    
    if (user) {
      await this.logEvent({
        tenant_id: user.tenant_id,
        user_id: user.id,
        type: 'user_logout',
        payload: {}
      });
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}

export const supabaseService = new SupabaseService();

// Hooks utilitaires
export function useCurrentUser() {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    supabaseService.getCurrentUser()
      .then(setUser)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  
  return { user, loading };
}

export function useTenantMetrics(tenantId: string) {
  const [metrics, setMetrics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    if (!tenantId) return;
    
    supabaseService.getTenantMetrics(tenantId)
      .then(setMetrics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tenantId]);
  
  return { metrics, loading };
}