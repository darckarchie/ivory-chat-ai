# 🗄️ Configuration Base de Données Whalix

## 🚨 PROBLÈME RÉSOLU

Si vous voyez l'erreur `Could not find the table 'public.tenants'`, suivez ces étapes :

## 📋 ÉTAPES DE CONFIGURATION

### 1. Accéder à Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Ouvrez votre projet Whalix

### 2. Exécuter le Script SQL
1. Cliquez sur **"SQL Editor"** dans le menu de gauche
2. Cliquez sur **"New Query"**
3. Copiez TOUT le contenu du fichier `supabase/migrations/complete_whalix_schema.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **"Run"** (bouton vert)

### 3. Vérifier l'Installation
1. Allez dans **"Table Editor"**
2. Vérifiez que ces tables existent :
   - ✅ `tenants`
   - ✅ `users`
   - ✅ `whatsapp_sessions`
   - ✅ `conversations`
   - ✅ `messages`
   - ✅ `events`

### 4. Tester l'Application
1. Retournez sur votre site Whalix
2. Essayez de créer un compte
3. L'inscription devrait maintenant fonctionner ! 🎉

## 🔧 SI VOUS RENCONTREZ ENCORE DES DIFFICULTÉS

### Option 1 : Vérification Manuelle
```sql
-- Exécutez cette requête dans SQL Editor pour vérifier
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('tenants', 'users', 'whatsapp_sessions', 'conversations', 'messages', 'events');
```

### Option 2 : Réinitialisation Complète
Si les tables existent mais ne marchent pas :
```sql
-- ⚠️ ATTENTION : Ceci supprime TOUTES les données
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS whatsapp_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- Puis ré-exécutez complete_whalix_schema.sql
```

### Option 3 : Support Direct
📧 **Email** : support@whalix.ci
📱 **WhatsApp** : +225 XX XX XX XX XX

**Incluez dans votre message :**
- URL de votre projet Supabase
- Capture d'écran de l'erreur
- Liste des tables visibles dans Table Editor

## 🎯 RÉSULTAT ATTENDU

Après configuration, vous devriez pouvoir :
- ✅ Créer un compte sans erreur
- ✅ Se connecter normalement
- ✅ Accéder au dashboard
- ✅ Voir les métriques

## 🔒 SÉCURITÉ

Le script configure automatiquement :
- **RLS** (Row Level Security) sur toutes les tables
- **Politiques d'accès** par tenant
- **Isolation complète** des données entre entreprises
- **Triggers** pour la traçabilité

---

**🎉 Une fois configuré, Whalix sera 100% opérationnel !**