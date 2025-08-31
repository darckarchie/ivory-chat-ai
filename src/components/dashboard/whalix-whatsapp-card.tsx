// src/components/dashboard/WhatsAppConnectionCard.tsx
import React, { useState, useEffect } from 'react';
import { MessageCircle, QrCode, Check, AlertCircle, TrendingUp, Users, Zap, ChevronRight } from 'lucide-react';
import { useBaileysConnection } from '@/lib/hooks/use-baileys-connection';

const WhatsAppConnectionCard = ({ tenantId = 'default' }) => {
  const { status, messages, connect, disconnect } = useBaileysConnection(tenantId);
  const [showQR, setShowQR] = useState(false);
  const [aiMode, setAiMode] = useState('balanced'); // soft, balanced, aggressive
  
  // Métriques en temps réel
  const [metrics, setMetrics] = useState({
    messagesDay: 47,
    conversions: 12,
    conversionRate: 25.5,
    avgResponseTime: 1.2,
    highIntentCount: 8
  });

  // Mise à jour des métriques basées sur les messages
  useEffect(() => {
    const highIntentMessages = messages.filter(m => m.intent === 'HIGH').length;
    setMetrics(prev => ({
      ...prev,
      messagesDay: messages.length,
      highIntentCount: highIntentMessages,
      conversionRate: highIntentMessages > 0 ? (prev.conversions / messages.length) * 100 : 0
    }));
  }, [messages]);

  const handleConnect = async () => {
    setShowQR(true);
    await connect();
  };

  const getModeColor = (mode) => {
    switch(mode) {
      case 'soft': return 'bg-blue-100 text-blue-700';
      case 'balanced': return 'bg-green-100 text-green-700';
      case 'aggressive': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getModeDescription = (mode) => {
    switch(mode) {
      case 'soft': return 'Suggestions subtiles, approche douce';
      case 'balanced': return 'Équilibre entre aide et vente';
      case 'aggressive': return 'Focus conversion, closing fort';
      default: return '';
    }
  };

  // État déconnecté
  if (!status.connected && !showQR) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Assistant IA WhatsApp</h3>
              <p className="text-sm text-gray-500">Répond 24/7 et convertit vos prospects</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Taux conversion moy.</span>
            </div>
            <p className="text-xl font-bold text-gray-900">+23%</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs">Temps réponse</span>
            </div>
            <p className="text-xl font-bold text-gray-900">~2s</p>
          </div>
        </div>

        <button
          onClick={handleConnect}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          Activer l'Assistant IA
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // État QR Code
  if (showQR && status.qrCode) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <h3 className="font-semibold text-gray-900 mb-4">Scannez pour connecter WhatsApp</h3>
          
          <div className="bg-white p-4 border-2 border-gray-200 rounded-lg inline-block mb-4">
            <img 
              src={status.qrCode} 
              alt="QR Code" 
              className="w-64 h-64"
            />
          </div>

          <div className="text-left bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 mb-2 font-medium">Instructions :</p>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Ouvrez WhatsApp sur votre téléphone</li>
              <li>2. Allez dans Paramètres → Appareils liés</li>
              <li>3. Cliquez sur "Lier un appareil"</li>
              <li>4. Scannez ce QR code</li>
            </ol>
          </div>

          <button
            onClick={() => setShowQR(false)}
            className="mt-4 text-gray-500 hover:text-gray-700 text-sm"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  // État connecté
  if (status.connected) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">IA Active 24/7</h3>
              <p className="text-sm text-gray-500">{status.number}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              En ligne
            </span>
          </div>
        </div>

        {/* Mode IA */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-700 mb-2 block">Mode de vente IA</label>
          <div className="grid grid-cols-3 gap-2">
            {['soft', 'balanced', 'aggressive'].map((mode) => (
              <button
                key={mode}
                onClick={() => setAiMode(mode)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  aiMode === mode 
                    ? getModeColor(mode) 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {mode === 'soft' ? '🕊️ Doux' : mode === 'balanced' ? '⚖️ Équilibré' : '🔥 Agressif'}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">{getModeDescription(aiMode)}</p>
        </div>

        {/* Métriques temps réel */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Messages aujourd'hui</span>
              <MessageCircle className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xl font-bold text-gray-900">{metrics.messagesDay}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-red-600">{metrics.highIntentCount} haute intention</span>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Conversions</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-xl font-bold text-gray-900">{metrics.conversions}</p>
            <p className="text-xs text-green-600">
              {metrics.conversionRate.toFixed(1)}% taux
            </p>
          </div>
        </div>

        {/* Messages récents avec intention */}
        {messages.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-xs font-medium text-gray-700 mb-2">Derniers messages</p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {messages.slice(0, 3).map((msg, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    msg.intent === 'HIGH' ? 'bg-red-100 text-red-700' :
                    msg.intent === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {msg.intent}
                  </span>
                  <div className="flex-1">
                    <span className="font-medium">{msg.name}:</span>
                    <span className="text-gray-600 ml-1">{msg.message.substring(0, 50)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={disconnect}
          className="w-full mt-4 text-red-600 hover:bg-red-50 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Déconnecter WhatsApp
        </button>
      </div>
    );
  }

  // État erreur
  if (status.error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Erreur de connexion</h3>
            <p className="text-sm">{status.error}</p>
          </div>
        </div>
        <button
          onClick={handleConnect}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return null;
};

export default WhatsAppConnectionCard;