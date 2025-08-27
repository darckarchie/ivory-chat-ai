import { useState, useEffect, useCallback } from 'react';

export interface WhatsAppSession {
  restaurantId: string;
  status: 'idle' | 'connecting' | 'qr_pending' | 'connected' | 'disconnected' | 'error';
  qrCode?: string;
  lastConnected?: Date;
  phoneNumber?: string;
  error?: string;
  messageCount?: number;
}

export function useWhatsAppConnection(restaurantId: string) {
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simuler une connexion Green API
  const simulateGreenAPIConnection = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    
    // Étape 1: Connexion en cours
    setSession({
      restaurantId,
      status: 'connecting'
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Étape 2: QR Code généré
    const qrCodeSVG = `
      <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
        <rect width="256" height="256" fill="white"/>
        <rect x="20" y="20" width="216" height="216" fill="none" stroke="black" stroke-width="4"/>
        <rect x="40" y="40" width="40" height="40" fill="black"/>
        <rect x="176" y="40" width="40" height="40" fill="black"/>
        <rect x="40" y="176" width="40" height="40" fill="black"/>
        <rect x="60" y="60" width="16" height="16" fill="white"/>
        <rect x="196" y="60" width="16" height="16" fill="white"/>
        <rect x="60" y="196" width="16" height="16" fill="white"/>
        <rect x="100" y="100" width="56" height="56" fill="black"/>
        <rect x="116" y="116" width="24" height="24" fill="white"/>
        <text x="128" y="140" text-anchor="middle" font-family="Arial" font-size="8" fill="black">WHALIX</text>
      </svg>
    `;
    
    const qrCodeDataUrl = `data:image/svg+xml;base64,${btoa(qrCodeSVG)}`;
    
    setSession({
      restaurantId,
      status: 'qr_pending',
      qrCode: qrCodeDataUrl
    });
    
    setIsConnecting(false);
    
    // Étape 3: Simuler la connexion après 15 secondes
    setTimeout(() => {
      setSession({
        restaurantId,
        status: 'connected',
        phoneNumber: '+225 07 00 00 00 01',
        lastConnected: new Date(),
        messageCount: 0
      });
      
      // Simuler des messages entrants
      startMessageSimulation();
    }, 15000);
  }, [restaurantId]);
  
  const startMessageSimulation = () => {
    const demoMessages = [
      { from: 'Kouamé', text: 'Bonjour, vous êtes ouverts ?' },
      { from: 'Aminata', text: 'Prix du menu du jour ?' },
      { from: 'Yao', text: 'Vous livrez à Cocody ?' },
      { from: 'Fatou', text: 'Je peux commander ?' }
    ];
    
    let messageIndex = 0;
    const interval = setInterval(() => {
      if (messageIndex >= demoMessages.length) {
        clearInterval(interval);
        return;
      }
      
      const msg = demoMessages[messageIndex];
      const newMessage = {
        id: `demo_msg_${Date.now()}`,
        at: new Date().toISOString(),
        customer: msg.from,
        customer_phone: `+22507000000${messageIndex + 1}`,
        last_message: msg.text,
        status: 'waiting' as const,
        confidence: 0
      };
      
      // Ajouter au feed local
      const existingMessages = JSON.parse(localStorage.getItem('whalix_live_messages') || '[]');
      const updatedMessages = [newMessage, ...existingMessages].slice(0, 20);
      localStorage.setItem('whalix_live_messages', JSON.stringify(updatedMessages));
      
      messageIndex++;
    }, 20000); // Un message toutes les 20 secondes
  };

  const connect = useCallback(async () => {
    await simulateGreenAPIConnection();
  }, [simulateGreenAPIConnection]);

  const disconnect = useCallback(async () => {
    setSession({
      restaurantId,
      status: 'disconnected'
    });
  }, [restaurantId]);

  // Initialiser la session
  useEffect(() => {
    setSession({
      restaurantId,
      status: 'idle'
    });
  }, [restaurantId]);

  const isConnected = session?.status === 'connected';
  const hasQR = session?.status === 'qr_pending' && !!session?.qrCode;
  const isLoading = isConnecting || session?.status === 'connecting';

  return {
    session,
    isConnected,
    hasQR,
    isLoading,
    error,
    connect,
    disconnect
  };
}