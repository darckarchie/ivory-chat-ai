# Intégration Green API dans Whalix

## Étape 1: Variables d'environnement

Crée `.env.local` dans Bolt :
```env
GREEN_API_URL=https://7105.api.greenapi.com
GREEN_API_MEDIA_URL=https://7105.media.greenapi.com
GREEN_API_INSTANCE=7105309758
GREEN_API_TOKEN=a7cfa2ce030c4a6188859f93100b96ecac0137473a3044bfbb
```

## Étape 2: Service Green API

Crée `lib/whatsapp/green-api.ts` :

```typescript
// lib/whatsapp/green-api.ts
export class GreenAPI {
  private baseUrl: string;
  private mediaUrl: string;
  private instance: string;
  private token: string;
  
  constructor() {
    this.baseUrl = process.env.GREEN_API_URL || '';
    this.mediaUrl = process.env.GREEN_API_MEDIA_URL || '';
    this.instance = process.env.GREEN_API_INSTANCE || '';
    this.token = process.env.GREEN_API_TOKEN || '';
  }
  
  // Obtenir le QR code pour scanner
  async getQRCode() {
    try {
      const response = await fetch(
        `${this.baseUrl}/waInstance${this.instance}/qr/${this.token}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur QR:', error);
      return null;
    }
  }
  
  // Vérifier le statut de connexion
  async getStatus() {
    try {
      const response = await fetch(
        `${this.baseUrl}/waInstance${this.instance}/getStateInstance/${this.token}`
      );
      const data = await response.json();
      return data.stateInstance; // 'notAuthorized', 'authorized', 'blocked', 'sleepMode'
    } catch (error) {
      console.error('Erreur status:', error);
      return 'error';
    }
  }
  
  // Envoyer un message
  async sendMessage(phone: string, message: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/waInstance${this.instance}/sendMessage/${this.token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: phone + '@c.us',
            message: message
          })
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Erreur envoi:', error);
      return { error: error.message };
    }
  }
  
  // Configurer le webhook pour recevoir les messages
  async setWebhook(webhookUrl: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/waInstance${this.instance}/setSettings/${this.token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webhookUrl: webhookUrl,
            incomingWebhook: 'yes',
            outgoingMessageWebhook: 'yes',
            stateWebhook: 'yes'
          })
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Erreur webhook:', error);
      return { error: error.message };
    }
  }
  
  // Recevoir les messages non lus
  async receiveMessages() {
    try {
      const response = await fetch(
        `${this.baseUrl}/waInstance${this.instance}/receiveNotification/${this.token}`
      );
      const data = await response.json();
      
      if (data && data.receiptId) {
        // Marquer comme lu
        await this.deleteNotification(data.receiptId);
      }
      
      return data;
    } catch (error) {
      console.error('Erreur réception:', error);
      return null;
    }
  }
  
  // Supprimer une notification (marquer comme lu)
  async deleteNotification(receiptId: number) {
    await fetch(
      `${this.baseUrl}/waInstance${this.instance}/deleteNotification/${this.token}/${receiptId}`,
      { method: 'DELETE' }
    );
  }
}
```

## Étape 3: Page de connexion WhatsApp

Crée `app/dashboard/whatsapp/page.tsx` :

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function WhatsAppConnect() {
  const [status, setStatus] = useState<string>('loading');
  const [qrCode, setQrCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [polling, setPolling] = useState<boolean>(false);
  
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const checkStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      setStatus(data.status);
      
      if (data.status === 'notAuthorized' && data.qr) {
        setQrCode(data.qr);
      } else if (data.status === 'authorized') {
        setQrCode('');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };
  
  const generateQR = async () => {
    setPolling(true);
    try {
      const res = await fetch('/api/whatsapp/qr');
      const data = await res.json();
      
      if (data.message) {
        setQrCode(data.message);
        // Commencer à vérifier le statut
        const checkInterval = setInterval(async () => {
          const statusRes = await fetch('/api/whatsapp/status');
          const statusData = await statusRes.json();
          
          if (statusData.status === 'authorized') {
            setStatus('authorized');
            setQrCode('');
            clearInterval(checkInterval);
          }
        }, 3000);
        
        // Arrêter après 2 minutes
        setTimeout(() => clearInterval(checkInterval), 120000);
      }
    } catch (err) {
      setError('Impossible de générer le QR code');
    } finally {
      setPolling(false);
    }
  };
  
  const testMessage = async () => {
    const res = await fetch('/api/whatsapp/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '2250700000000', // Remplace par ton numéro
        message: 'Test Whalix via Green API!'
      })
    });
    const data = await res.json();
    alert(data.success ? 'Message envoyé!' : 'Erreur envoi');
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Connexion WhatsApp</h1>
      <p className="text-muted-foreground mb-6">
        Connectez votre WhatsApp Business pour activer l'IA Whalix
      </p>
      
      <Card className="p-6">
        {/* Status */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant={
            status === 'authorized' ? 'default' : 
            status === 'notAuthorized' ? 'secondary' : 
            'destructive'
          }>
            {status === 'authorized' && '✅ Connecté'}
            {status === 'notAuthorized' && '⏳ Non connecté'}
            {status === 'blocked' && '🚫 Bloqué'}
            {status === 'sleepMode' && '😴 En veille'}
            {status === 'loading' && '⏳ Chargement...'}
          </Badge>
        </div>
        
        {/* QR Code ou Status */}
        {status === 'notAuthorized' && (
          <div className="text-center">
            {!qrCode ? (
              <>
                <QrCode className="w-24 h-24 mx-auto mb-4 text-gray-300" />
                <p className="mb-4">Cliquez pour générer un QR code</p>
                <Button onClick={generateQR} disabled={polling}>
                  {polling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    'Générer QR Code'
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <QRCode value={qrCode} size={256} />
                </div>
                <div className="text-left max-w-sm mx-auto">
                  <p className="font-medium mb-2">Instructions:</p>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>1. Ouvrez WhatsApp sur votre téléphone</li>
                    <li>2. Allez dans Paramètres → Appareils liés</li>
                    <li>3. Scannez ce QR code</li>
                    <li>4. Attendez la confirmation</li>
                  </ol>
                </div>
              </>
            )}
          </div>
        )}
        
        {status === 'authorized' && (
          <div className="text-center">
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">WhatsApp Connecté!</h2>
            <p className="text-muted-foreground mb-4">
              L'IA Whalix répond maintenant à vos clients automatiquement
            </p>
            <div className="space-y-2">
              <Button onClick={testMessage} className="w-full">
                Envoyer un message de test
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/dashboard'}>
                Retour au tableau de bord
              </Button>
            </div>
          </div>
        )}
        
        {status === 'blocked' && (
          <div className="text-center">
            <AlertCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Compte Bloqué</h2>
            <p className="text-muted-foreground">
              Votre compte WhatsApp semble être bloqué. 
              Contactez le support Green API.
            </p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
      </Card>
      
      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> La connexion reste active 24h/24. 
          Vos messages sont traités automatiquement même quand vous êtes hors ligne.
        </p>
      </div>
    </div>
  );
}
```

## Étape 4: Routes API

### `/app/api/whatsapp/status/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { GreenAPI } from '@/lib/whatsapp/green-api';

export async function GET() {
  const api = new GreenAPI();
  const status = await api.getStatus();
  
  // Si pas connecté, obtenir le QR
  let qr = null;
  if (status === 'notAuthorized') {
    const qrData = await api.getQRCode();
    qr = qrData?.message || null;
  }
  
  return NextResponse.json({ status, qr });
}
```

### `/app/api/whatsapp/qr/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { GreenAPI } from '@/lib/whatsapp/green-api';

export async function GET() {
  const api = new GreenAPI();
  const data = await api.getQRCode();
  return NextResponse.json(data);
}
```

### `/app/api/whatsapp/webhook/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai/generator';

export async function POST(request: Request) {
  const data = await request.json();
  
  // Green API envoie différents types de webhooks
  if (data.typeWebhook === 'incomingMessageReceived') {
    const message = data.messageData;
    
    // Extraire les infos
    const from = data.senderData.chatId;
    const text = message.textMessageData?.textMessage || '';
    const senderName = data.senderData.senderName || 'Client';
    
    console.log(`Message reçu de ${senderName}: ${text}`);
    
    // Générer réponse IA
    const response = await generateAIResponse(text, from);
    
    // Envoyer la réponse
    const api = new GreenAPI();
    await api.sendMessage(from.replace('@c.us', ''), response);
  }
  
  return NextResponse.json({ received: true });
}
```

### `/app/api/whatsapp/test/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { GreenAPI } from '@/lib/whatsapp/green-api';

export async function POST(request: Request) {
  const { phone, message } = await request.json();
  
  const api = new GreenAPI();
  const result = await api.sendMessage(phone, message);
  
  return NextResponse.json({
    success: result.idMessage ? true : false,
    result
  });
}
```

## Étape 5: Configuration du webhook

Une fois connecté, configure le webhook :

```typescript
// app/api/whatsapp/setup/route.ts
import { NextResponse } from 'next/server';
import { GreenAPI } from '@/lib/whatsapp/green-api';

export async function POST() {
  const api = new GreenAPI();
  
  const webhookUrl = process.env.NODE_ENV === 'production' 
    ? 'https://ton-app.vercel.app/api/whatsapp/webhook'
    : 'https://ngrok-url.ngrok.io/api/whatsapp/webhook'; // Utilise ngrok pour dev local
    
  const result = await api.setWebhook(webhookUrl);
  return NextResponse.json(result);
}
```

## Instructions pour démarrer :

1. **Copie le code** dans Bolt
2. **Va sur** `/dashboard/whatsapp`
3. **Clique** "Générer QR Code"
4. **Scanne** avec ton WhatsApp
5. **C'est connecté!**

## Pour tester en local avec ngrok :

```bash
# Installe ngrok
npm install -g ngrok

# Lance Bolt
npm run dev

# Dans un autre terminal
ngrok http 3000

# Copie l'URL https et configure le webhook
```

Ça marche directement dans Bolt avec Green API!
