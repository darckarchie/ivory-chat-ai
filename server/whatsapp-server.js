import { Boom } from '@hapi/boom';
import makeWASocket, { 
    DisconnectReason, 
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const app = express();
const server = express().listen();
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:8080", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stocker les sessions WhatsApp par restaurant
const sessions = new Map();

// Créer le dossier sessions s'il n'existe pas
const sessionsDir = './sessions';
if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
}

class WhatsAppSession {
    constructor(restaurantId, webhookUrl) {
        this.restaurantId = restaurantId;
        this.webhookUrl = webhookUrl;
        this.sock = null;
        this.qr = null;
        this.isConnected = false;
        this.phoneNumber = null;
        this.lastConnected = null;
        this.messageCount = 0;
        this.lastMessageTime = 0;
    }
    
    async initialize() {
        try {
            console.log(`🔄 Initialisation session pour ${this.restaurantId}`);
            
            // Authentification multi-device
            const { state, saveCreds } = await useMultiFileAuthState(
                path.join(sessionsDir, this.restaurantId)
            );
            
            // Obtenir la dernière version de Baileys
            const { version, isLatest } = await fetchLatestBaileysVersion();
            console.log(`📱 Baileys version: ${version}, Latest: ${isLatest}`);
            
            this.sock = makeWASocket({
                version,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys),
                },
                printQRInTerminal: false,
                browser: ['Whalix', 'Chrome', '1.0.0'],
                generateHighQualityLinkPreview: true,
                markOnlineOnConnect: false,
            });
            
            // Gérer les mises à jour de connexion
            this.sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                
                if (qr) {
                    console.log(`📱 QR Code généré pour ${this.restaurantId}`);
                    
                    // Convertir en base64 pour le frontend
                    this.qr = await QRCode.toDataURL(qr);
                    
                    // Envoyer au frontend via WebSocket
                    io.emit(`session-${this.restaurantId}`, {
                        status: 'qr_pending',
                        qrCode: this.qr,
                        restaurantId: this.restaurantId
                    });
                }
                
                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                    console.log(`🔴 Connexion fermée pour ${this.restaurantId}:`, lastDisconnect?.error);
                    
                    this.isConnected = false;
                    
                    // Notifier le frontend
                    io.emit(`session-${this.restaurantId}`, {
                        status: 'disconnected',
                        restaurantId: this.restaurantId
                    });
                    
                    if (shouldReconnect) {
                        console.log('🔄 Reconnexion dans 5 secondes...');
                        setTimeout(() => this.initialize(), 5000);
                    } else {
                        console.log('🗑️ Session supprimée définitivement');
                        sessions.delete(this.restaurantId);
                    }
                } else if (connection === 'open') {
                    console.log(`✅ WhatsApp connecté pour ${this.restaurantId}!`);
                    
                    this.isConnected = true;
                    this.qr = null;
                    this.lastConnected = new Date();
                    this.phoneNumber = this.sock.user?.id?.split(':')[0] || 'Inconnu';
                    
                    // Notifier le frontend
                    io.emit(`session-${this.restaurantId}`, {
                        status: 'connected',
                        restaurantId: this.restaurantId,
                        phoneNumber: this.phoneNumber,
                        lastConnected: this.lastConnected
                    });
                    
                    console.log(`📞 Numéro connecté: ${this.phoneNumber}`);
                }
            });
            
            // Sauvegarder les credentials
            this.sock.ev.on('creds.update', saveCreds);
            
            // Gérer les messages entrants
            this.sock.ev.on('messages.upsert', async (m) => {
                const msg = m.messages[0];
                if (!msg.key.fromMe && m.type === 'notify') {
                    await this.handleIncomingMessage(msg);
                }
            });
            
        } catch (error) {
            console.error(`❌ Erreur initialisation ${this.restaurantId}:`, error);
            
            // Notifier l'erreur au frontend
            io.emit(`session-${this.restaurantId}`, {
                status: 'error',
                restaurantId: this.restaurantId,
                error: error.message
            });
        }
    }
    
    async handleIncomingMessage(message) {
        // Rate limiting simple
        const now = Date.now();
        if (now - this.lastMessageTime < 2000) {
            console.log('⏳ Rate limit - message ignoré');
            return;
        }
        this.lastMessageTime = now;
        this.messageCount++;
        
        console.log(`📨 Message #${this.messageCount} reçu pour ${this.restaurantId}`);
        
        const messageData = {
            id: `msg_${now}`,
            restaurantId: this.restaurantId,
            from: message.key.remoteJid,
            pushName: message.pushName || 'Client',
            text: message.message?.conversation || 
                  message.message?.extendedTextMessage?.text || '',
            timestamp: message.messageTimestamp || now,
            type: 'text'
        };
        
        // Envoyer au frontend pour le live feed
        io.emit(`message-${this.restaurantId}`, messageData);
        
        // Générer réponse IA
        try {
            const aiResponse = await this.generateAIResponse(messageData.text);
            
            if (aiResponse.shouldReply) {
                // Délai aléatoire pour paraître humain (1-3 secondes)
                const delay = Math.random() * 2000 + 1000;
                
                setTimeout(async () => {
                    await this.sendMessage(message.key.remoteJid, aiResponse.message);
                    
                    // Notifier le frontend que l'IA a répondu
                    io.emit(`ai-reply-${this.restaurantId}`, {
                        messageId: messageData.id,
                        reply: aiResponse.message,
                        confidence: aiResponse.confidence
                    });
                }, delay);
            }
        } catch (error) {
            console.error('❌ Erreur génération IA:', error);
        }
    }
    
    async generateAIResponse(text) {
        const lowerText = text.toLowerCase();
        
        // Logique IA simple mais efficace
        if (lowerText.includes('bonjour') || lowerText.includes('salut') || lowerText.includes('bsr')) {
            return {
                message: 'Bonjour ! 👋 Bienvenue chez nous. Comment puis-je vous aider aujourd\'hui ?',
                confidence: 0.95,
                shouldReply: true
            };
        }
        
        if (lowerText.includes('prix') || lowerText.includes('menu') || lowerText.includes('carte')) {
            // Récupérer les items depuis localStorage (simulation)
            const items = this.getKnowledgeBaseItems();
            if (items.length > 0) {
                let response = '📋 NOTRE MENU :\n\n';
                items.slice(0, 5).forEach((item, idx) => {
                    response += `${idx + 1}. ${item.name} - ${item.price.toLocaleString()} FCFA\n`;
                });
                response += '\nPour commander, envoyez le numéro du plat ! 😊';
                
                return {
                    message: response,
                    confidence: 0.90,
                    shouldReply: true
                };
            }
        }
        
        if (lowerText.includes('ouvert') || lowerText.includes('horaire') || lowerText.includes('fermé')) {
            return {
                message: '🕐 HORAIRES D\'OUVERTURE :\n\n📍 Lundi - Samedi : 8h - 22h\n📍 Dimanche : 10h - 20h\n\nNous sommes actuellement ouverts ! 😊',
                confidence: 0.95,
                shouldReply: true
            };
        }
        
        if (lowerText.includes('livr') || lowerText.includes('command')) {
            return {
                message: '🚗 LIVRAISON DISPONIBLE !\n\n✅ Zone : 5km autour du restaurant\n⏱️ Délai : 30-45 minutes\n💵 Frais : 1000 FCFA\n\nQue souhaitez-vous commander ?',
                confidence: 0.90,
                shouldReply: true
            };
        }
        
        if (lowerText.includes('dispo') || lowerText.includes('stock') || lowerText.includes('reste')) {
            return {
                message: '✅ Oui, nous avons tout en stock aujourd\'hui ! Que souhaitez-vous commander ?',
                confidence: 0.85,
                shouldReply: true
            };
        }
        
        // Réponse par défaut
        return {
            message: 'Merci pour votre message ! 😊 Un de nos agents va vous répondre rapidement. En attendant, vous pouvez consulter notre menu ou nos horaires.',
            confidence: 0.60,
            shouldReply: true
        };
    }
    
    getKnowledgeBaseItems() {
        // En mode démo, retourner des items par défaut
        return [
            { name: 'Attiéké poisson', price: 2500 },
            { name: 'Alloco poulet', price: 2000 },
            { name: 'Garba', price: 1000 },
            { name: 'Riz sauce', price: 1500 },
            { name: 'Foutou sauce claire', price: 2000 }
        ];
    }
    
    async sendMessage(to, text) {
        if (!this.sock || !this.isConnected) {
            throw new Error('WhatsApp non connecté');
        }
        
        try {
            await this.sock.sendMessage(to, { text });
            console.log(`📤 Message envoyé à ${to}: ${text.substring(0, 50)}...`);
        } catch (error) {
            console.error('❌ Erreur envoi message:', error);
            throw error;
        }
    }
    
    async disconnect() {
        if (this.sock) {
            try {
                await this.sock.logout();
                console.log(`🔴 Session ${this.restaurantId} déconnectée`);
            } catch (error) {
                console.error('Erreur déconnexion:', error);
            }
            this.sock = null;
            this.isConnected = false;
        }
    }
}

// API Endpoints
app.post('/api/whatsapp/connect/:restaurantId', async (req, res) => {
    const { restaurantId } = req.params;
    const { webhookUrl } = req.body;
    
    console.log(`🔗 Demande de connexion pour ${restaurantId}`);
    
    try {
        // Vérifier si déjà connecté
        if (sessions.has(restaurantId)) {
            const session = sessions.get(restaurantId);
            if (session.isConnected) {
                return res.json({ 
                    status: 'already_connected',
                    message: 'WhatsApp déjà connecté',
                    phoneNumber: session.phoneNumber
                });
            }
            if (session.qr) {
                return res.json({ 
                    status: 'qr_pending',
                    qr: session.qr 
                });
            }
        }
        
        // Créer nouvelle session
        const session = new WhatsAppSession(restaurantId, webhookUrl);
        sessions.set(restaurantId, session);
        
        // Initialiser la connexion
        await session.initialize();
        
        // Attendre le QR code ou la connexion (max 30 secondes)
        let attempts = 0;
        while (!session.qr && !session.isConnected && attempts < 30) {
            await new Promise(r => setTimeout(r, 1000));
            attempts++;
        }
        
        if (session.qr) {
            res.json({ 
                status: 'qr_generated',
                qr: session.qr,
                message: 'Scannez le QR code avec WhatsApp'
            });
        } else if (session.isConnected) {
            res.json({ 
                status: 'connected',
                phoneNumber: session.phoneNumber
            });
        } else {
            res.status(500).json({ 
                status: 'error',
                message: 'Timeout - impossible de générer le QR code'
            });
        }
    } catch (error) {
        console.error(`❌ Erreur connexion ${restaurantId}:`, error);
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

app.post('/api/whatsapp/disconnect/:restaurantId', async (req, res) => {
    const { restaurantId } = req.params;
    
    try {
        const session = sessions.get(restaurantId);
        
        if (session) {
            await session.disconnect();
            sessions.delete(restaurantId);
            
            // Supprimer le dossier de session
            const sessionPath = path.join(sessionsDir, restaurantId);
            if (fs.existsSync(sessionPath)) {
                fs.rmSync(sessionPath, { recursive: true, force: true });
            }
            
            // Notifier le frontend
            io.emit(`session-${restaurantId}`, {
                status: 'disconnected',
                restaurantId: restaurantId
            });
            
            res.json({ status: 'disconnected' });
        } else {
            res.status(404).json({ error: 'Session non trouvée' });
        }
    } catch (error) {
        console.error('❌ Erreur déconnexion:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/whatsapp/status/:restaurantId', (req, res) => {
    const { restaurantId } = req.params;
    const session = sessions.get(restaurantId);
    
    if (!session) {
        return res.json({ 
            status: 'not_initialized',
            restaurantId 
        });
    }
    
    res.json({
        status: session.isConnected ? 'connected' : 
                session.qr ? 'qr_pending' : 'disconnected',
        restaurantId,
        hasQR: !!session.qr,
        qr: session.qr,
        phoneNumber: session.phoneNumber,
        lastConnected: session.lastConnected,
        messageCount: session.messageCount
    });
});

// Endpoint pour envoyer un message (pour tests)
app.post('/api/whatsapp/send/:restaurantId', async (req, res) => {
    const { restaurantId } = req.params;
    const { to, message } = req.body;
    
    try {
        const session = sessions.get(restaurantId);
        if (!session || !session.isConnected) {
            return res.status(400).json({ error: 'WhatsApp non connecté' });
        }
        
        await session.sendMessage(to, message);
        res.json({ status: 'sent' });
    } catch (error) {
        console.error('❌ Erreur envoi:', error);
        res.status(500).json({ error: error.message });
    }
});

// WebSocket pour communication temps réel
io.on('connection', (socket) => {
    console.log('🔌 Client connecté:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('🔌 Client déconnecté:', socket.id);
    });
    
    // Permettre au client de s'abonner aux événements d'un restaurant
    socket.on('subscribe', (restaurantId) => {
        socket.join(`restaurant-${restaurantId}`);
        console.log(`📡 Client abonné aux événements de ${restaurantId}`);
        
        // Envoyer le statut actuel
        const session = sessions.get(restaurantId);
        if (session) {
            socket.emit(`session-${restaurantId}`, {
                status: session.isConnected ? 'connected' : 
                        session.qr ? 'qr_pending' : 'disconnected',
                restaurantId,
                qrCode: session.qr,
                phoneNumber: session.phoneNumber,
                lastConnected: session.lastConnected
            });
        }
    });
});

// Simuler des messages entrants pour la démo
function startDemoMessageSimulation() {
    const demoMessages = [
        { from: 'Kouamé', text: 'Bonjour, vous êtes ouverts ?' },
        { from: 'Aminata', text: 'Prix du menu du jour ?' },
        { from: 'Yao', text: 'Vous livrez à Cocody ?' },
        { from: 'Fatou', text: 'Je peux commander ?' },
        { from: 'Ibrahim', text: 'Disponible ce soir ?' }
    ];
    
    setInterval(() => {
        // Simuler un message pour les sessions démo connectées
        sessions.forEach((session, restaurantId) => {
            if (session.isConnected && restaurantId === 'demo' && Math.random() > 0.7) {
                const msg = demoMessages[Math.floor(Math.random() * demoMessages.length)];
                const messageData = {
                    id: `demo_msg_${Date.now()}`,
                    restaurantId,
                    from: `+22507000000${Math.floor(Math.random() * 100)}`,
                    pushName: msg.from,
                    text: msg.text,
                    timestamp: Date.now(),
                    type: 'text'
                };
                
                io.emit(`message-${restaurantId}`, messageData);
                console.log(`🤖 Message démo simulé: ${msg.text}`);
            }
        });
    }, 15000); // Toutes les 15 secondes
}

// Démarrer le serveur
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Serveur WhatsApp Whalix démarré sur le port ${PORT}`);
    console.log(`📱 WebSocket disponible pour les connexions temps réel`);
    
    // Démarrer la simulation de messages démo
    startDemoMessageSimulation();
});

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
    console.log('🛑 Arrêt du serveur...');
    
    // Déconnecter toutes les sessions
    for (const [restaurantId, session] of sessions) {
        console.log(`🔴 Déconnexion ${restaurantId}...`);
        await session.disconnect();
    }
    
    process.exit(0);
});

export default app;