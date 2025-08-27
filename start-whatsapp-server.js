#!/usr/bin/env node

// Script de démarrage du serveur WhatsApp Baileys
import('./server/whatsapp-server.js')
  .then(() => {
    console.log('✅ Serveur WhatsApp démarré avec succès');
  })
  .catch((error) => {
    console.error('❌ Erreur démarrage serveur WhatsApp:', error);
    process.exit(1);
  });