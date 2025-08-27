# 🚀 Guide Green API - Connexion WhatsApp pour Whalix

## 📋 Configuration Green API

### 1. Créer un compte Green API
1. Allez sur [green-api.com](https://green-api.com)
2. Créez un compte gratuit
3. Créez une nouvelle instance WhatsApp
4. Notez votre `instanceId` et `apiTokenInstance`

### 2. Configuration dans Whalix
Modifiez le fichier `.env.local` :

```env
# Green API Configuration
VITE_GREEN_API_INSTANCE=votre_instance_id
VITE_GREEN_API_TOKEN=votre_api_token
VITE_GREEN_API_BASE_URL=https://api.green-api.com
```

## 🔧 Fonctionnalités Disponibles

### ✅ Connexion WhatsApp
- **QR Code automatique** : Généré via l'API Green API
- **Statut en temps réel** : Vérification automatique de la connexion
- **Reconnexion** : Gestion automatique des déconnexions

### ✅ Messages Automatiques
- **Réception** : Récupération automatique des messages entrants
- **IA intégrée** : Réponses automatiques basées sur votre base de connaissances
- **Délais humains** : Réponses avec délais aléatoires (1-3 secondes)

### ✅ Gestion Avancée
- **Test de messages** : Interface pour tester l'envoi
- **Monitoring** : Suivi des messages traités
- **Déconnexion propre** : Déconnexion sécurisée

## 📱 Comment Utiliser

### Étape 1: Activer WhatsApp IA
1. Ouvrez le **Dashboard Whalix**
2. Trouvez la carte **"Assistant WhatsApp IA"**
3. Cliquez sur **"Activer l'IA WhatsApp"**

### Étape 2: Scanner le QR Code
1. **Attendez** la génération du QR code (5-10 secondes)
2. **Ouvrez WhatsApp** sur votre téléphone
3. **Allez dans Paramètres** → **Appareils connectés**
4. **Scannez le QR code** affiché dans Whalix

### Étape 3: Vérification
- Le statut passe à **"Connecté"** ✅
- Votre numéro WhatsApp s'affiche
- L'IA est maintenant **active 24/7**

## 🤖 Test de l'IA

### Depuis le Dashboard
1. Dans la carte **"Aperçu IA"**, tapez un message test
2. Ou cliquez sur une **question d'exemple**
3. Voyez la **réponse générée** par l'IA

### Avec un vrai message WhatsApp
1. Envoyez un message au numéro connecté depuis un autre téléphone
2. L'IA répond automatiquement en **2-3 secondes**
3. Le message apparaît dans le feed **"Messages en direct"**

## 📊 Messages Supportés

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

## ⚙️ Configuration Avancée

### Variables d'Environnement
```env
# Instance Green API
VITE_GREEN_API_INSTANCE=1234567890
VITE_GREEN_API_TOKEN=abcdef123456789

# Configuration optionnelle
VITE_GREEN_API_BASE_URL=https://api.green-api.com
VITE_APP_URL=http://localhost:5173
```

### Personnalisation IA
1. **Base de connaissances** : Ajoutez vos produits/services
2. **Style de réponse** : Configurez dans les paramètres
3. **Questions fréquentes** : Ajoutez des réponses personnalisées

## 🚨 Résolution de Problèmes

### ❌ "Impossible de générer le QR code"
**Solution :**
1. Vérifiez vos identifiants Green API dans `.env.local`
2. Assurez-vous que votre instance est active
3. Vérifiez votre connexion internet

### ❌ QR Code ne s'affiche pas
**Solution :**
1. Attendez 10-15 secondes
2. Cliquez sur "Nouveau QR Code"
3. Vérifiez la console pour les erreurs

### ❌ WhatsApp se déconnecte
**Solution :**
1. Utilisez une connexion internet stable
2. Ne fermez pas WhatsApp sur votre téléphone
3. Évitez d'utiliser WhatsApp Web en parallèle

### ❌ L'IA ne répond pas
**Solution :**
1. Vérifiez que le statut est "Connecté"
2. Testez avec les questions d'exemple
3. Ajoutez des items dans votre base de connaissances

## 💡 Conseils d'Utilisation

### ✅ Bonnes Pratiques
- **Testez d'abord** avec votre propre numéro
- **Ajoutez progressivement** vos produits/services
- **Surveillez les messages** pour détecter les problèmes
- **Personnalisez les réponses** selon votre secteur

### ⚠️ Limitations Green API
- **Plan gratuit** : Limité en nombre de messages/jour
- **Délais API** : Quelques secondes de latence possible
- **Quota** : Respectez les limites de votre plan

## 🆘 Support

### Logs Utiles
- **Console navigateur** : F12 → Console pour voir les erreurs
- **Messages traités** : Compteur affiché dans l'interface
- **Statut connexion** : Badge en temps réel

### Contact Support
- **Green API** : [support@green-api.com](mailto:support@green-api.com)
- **Whalix** : [support@whalix.ci](mailto:support@whalix.ci)

---

**🎉 Félicitations ! Votre WhatsApp IA est maintenant opérationnel avec Green API !**

Vos clients peuvent maintenant recevoir des réponses instantanées 24/7 ! 🌙✨