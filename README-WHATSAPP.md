# 🚀 Guide de Démarrage WhatsApp IA - Whalix

## 📋 Prérequis

1. **Node.js** installé (version 16+)
2. **WhatsApp Business** sur votre téléphone
3. **Connexion internet stable**

## 🔧 Installation et Configuration

### 1. Installer les dépendances
```bash
npm install
```

### 2. Démarrer le serveur WhatsApp
```bash
# Option 1: Script automatique
chmod +x start-baileys.sh
./start-baileys.sh

# Option 2: Manuel
node start-whatsapp-server.js
```

### 3. Démarrer l'application frontend
```bash
# Dans un autre terminal
npm run dev
```

## 📱 Comment Connecter WhatsApp

### Étape 1: Accéder au Dashboard
1. Ouvrez l'app Whalix dans votre navigateur
2. Allez sur le Dashboard
3. Trouvez la carte "Assistant WhatsApp IA"

### Étape 2: Générer le QR Code
1. Cliquez sur "Activer l'IA WhatsApp"
2. Attendez la génération du QR code (5-10 secondes)
3. Le QR code s'affiche automatiquement

### Étape 3: Scanner avec WhatsApp
1. **Ouvrez WhatsApp** sur votre téléphone
2. **Allez dans Paramètres** → **Appareils connectés**
3. **Cliquez sur "Connecter un appareil"**
4. **Scannez le QR code** affiché dans Whalix
5. **Confirmez** la connexion sur votre téléphone

### Étape 4: Vérification
- Le statut passe à "Connecté" ✅
- Votre numéro WhatsApp s'affiche
- L'IA est maintenant active 24/7

## 🤖 Tester l'IA

### Test depuis le Dashboard
1. Dans la carte "Aperçu IA", tapez un message test
2. Ou cliquez sur une question d'exemple
3. Voyez la réponse générée par l'IA

### Test avec un vrai message WhatsApp
1. Envoyez un message au numéro connecté depuis un autre téléphone
2. L'IA répond automatiquement en 2-3 secondes
3. Le message apparaît dans le feed "Messages en direct"

## 📊 Messages Supportés par l'IA

### ✅ Questions Automatiques
- **Salutations** : "Bonjour", "Bonsoir", "Salut"
- **Prix** : "Prix du menu", "Combien coûte", "Tarifs"
- **Horaires** : "Vous êtes ouverts ?", "Horaires"
- **Livraison** : "Vous livrez ?", "Commande"
- **Disponibilité** : "C'est disponible ?", "En stock ?"

### 🎯 Réponses Intelligentes
- Utilise votre **base de connaissances**
- Adapte le **ton** selon vos paramètres
- Inclut les **prix** et **disponibilités** réels
- Propose des **actions** (commander, voir menu)

## 🔧 Configuration Avancée

### Variables d'Environnement (.env.local)
```env
# URL du serveur WhatsApp (par défaut: http://localhost:3001)
VITE_WHATSAPP_BACKEND_URL=http://localhost:3001

# Webhook pour intégration N8N (optionnel)
WHATSAPP_WEBHOOK_URL=https://your-n8n.cloud/webhook/restaurant
```

### Personnaliser l'IA
1. **Base de connaissances** : Ajoutez vos produits/services
2. **Style de réponse** : Configurez dans les paramètres
3. **Questions fréquentes** : Ajoutez des réponses personnalisées

## 🚨 Résolution de Problèmes

### ❌ "Erreur de connexion au service WhatsApp"
**Solution :**
1. Vérifiez que le serveur tourne sur le port 3001
2. Redémarrez le serveur : `node start-whatsapp-server.js`
3. Vérifiez les logs dans le terminal

### ❌ QR Code ne s'affiche pas
**Solution :**
1. Attendez 10-15 secondes
2. Cliquez sur "Nouveau QR Code"
3. Vérifiez la connexion internet

### ❌ WhatsApp se déconnecte souvent
**Solution :**
1. Utilisez une connexion internet stable
2. Ne fermez pas WhatsApp sur votre téléphone
3. Évitez d'utiliser WhatsApp Web en parallèle

### ❌ L'IA ne répond pas
**Solution :**
1. Vérifiez que le statut est "Connecté"
2. Testez avec les questions d'exemple
3. Ajoutez des items dans votre base de connaissances

## 📈 Optimisation

### Performance
- **Rate limiting** : Max 1 message/2 secondes par client
- **Reconnexion automatique** en cas de déconnexion
- **Sauvegarde des sessions** pour éviter de rescanner

### Sécurité
- Sessions isolées par restaurant
- Validation des messages entrants
- Logs détaillés pour monitoring

## 🌍 Déploiement Production

### Serveur VPS (Recommandé)
1. **DigitalOcean/Hetzner** : 5-10€/mois
2. **Installer Node.js** sur le serveur
3. **Cloner le projet** et installer les dépendances
4. **Configurer PM2** pour la persistance
5. **HTTPS obligatoire** pour la production

### Configuration Production
```bash
# Installer PM2
npm install -g pm2

# Démarrer le serveur WhatsApp
pm2 start start-whatsapp-server.js --name "whalix-whatsapp"

# Sauvegarder la config PM2
pm2 save
pm2 startup
```

## 💡 Conseils d'Utilisation

### ✅ Bonnes Pratiques
- **Testez d'abord** avec votre propre numéro
- **Ajoutez progressivement** vos produits/services
- **Surveillez les logs** pour détecter les problèmes
- **Sauvegardez** régulièrement vos sessions

### ⚠️ Limitations WhatsApp
- **Max 50-100 messages/jour** au début (pour éviter le ban)
- **Pas de spam** - respectez vos clients
- **Délais entre messages** - l'IA attend 2-3 secondes
- **Une session par numéro** - ne connectez pas le même numéro ailleurs

## 🆘 Support

### Logs Utiles
```bash
# Voir les logs du serveur WhatsApp
tail -f logs/whatsapp.log

# Voir les sessions actives
ls -la sessions/
```

### Contact Support Whalix
- **Email** : support@whalix.ci
- **WhatsApp** : +225 XX XX XX XX XX
- **Documentation** : https://docs.whalix.ci

---

**🎉 Félicitations ! Votre WhatsApp IA est maintenant opérationnel !**

Vos clients peuvent maintenant recevoir des réponses instantanées 24/7, même quand vous dormez ! 🌙✨