#!/bin/bash

# Script de démarrage du serveur WhatsApp Baileys pour Whalix
echo "🚀 Démarrage du serveur WhatsApp Whalix..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Créer le dossier sessions s'il n'existe pas
mkdir -p sessions

# Démarrer le serveur
echo "🔌 Lancement du serveur WhatsApp sur le port 3001..."
echo "📱 Interface disponible sur http://localhost:5173"
echo "🛑 Appuyez sur Ctrl+C pour arrêter"

node start-whatsapp-server.js