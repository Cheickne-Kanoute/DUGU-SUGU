# 🌾 Guide d'Installation et de Configuration DUGU SUGU

Ce document explique en termes simples et accessibles comment fonctionne la plateforme **DUGU SUGU** et comment la configurer facilement.

---

## 📖 1. Qu'est-ce que DUGU SUGU ?

**DUGU SUGU** ("Le marché du village" en bambara) est une plateforme e-commerce agricole développée pour le Mali. Elle permet :
- **Aux Producteurs (Vendeurs)** : De publier et vendre directement leurs produits agricoles frais (légumes, fruits, céréales, tubercules, etc.).
- **Aux Consommateurs (Clients)** : De parcourir les produits locaux, les ajouter à leur panier et commander en toute simplicité.
- **À l'Administrateur** : De superviser l'ensemble des utilisateurs, valider les demandes de compte vendeur et suivre l'activité du marché.

---

## 🛠️ 2. Les Technologies Utilisées (Explication Simple)

L'application utilise l'écosystème **Firebase** de Google pour gérer les données et la sécurité en ligne :

| Composant Firebase | Rôle dans l'application | Explication simple |
|---|---|---|
| 🔐 **Firebase Authentication** | Gestion des comptes | C'est le gardien de l'application. Il gère l'inscription, la connexion et la sécurité des mots de passe. |
| 🗄️ **Cloud Firestore** | Base de données | C'est le grand classeur numérique. Il enregistre toutes les informations (membres, produits, commandes, paiements). |
| 📁 **Firebase Storage** | Stockage des images | C'est l'album photo. Il conserve les photos de produits téléversées par les vendeurs. |

---

## 📂 3. Les Collections (Tables de Données) Expliquées

Dans la base de données **Cloud Firestore**, les données sont organisées en **Collections** :

1. 👤 **`users` (Utilisateurs)** : Contient les informations des membres (Nom, Prénom, Email, Téléphone, Rôle : `client`, `seller`, ou `admin`).
2. 🌽 **`produits` (Produits)** : Le catalogue agricole avec les noms de produits, prix en FCFA, descriptions, photos et niveaux de stock.
3. 🏷️ **`categories` (Catégories)** : Le classement des produits (*Légumes*, *Fruits*, *Céréales*, *Tubercules*, *Épices*, *Élevage*...).
4. 🛒 **`commandes` (Commandes)** : Le registre de tous les achats effectués avec le détail des articles commandés.
5. 💳 **`paiements` (Paiements)** : Le suivi financier de chaque commande (*À la livraison*, *Mobile Money Orange/Moov*, ou *Virement bancaire*).
6. 🚚 **`livraisons` (Livraisons)** : Le suivi du colis depuis l'expédition par le vendeur jusqu'à la remise au client.
7. 🛍️ **`panierItems` (Panier)** : Les articles réservés par les clients avant de valider leur commande.
8. ⭐ **`avis` (Avis)** : Les notes et commentaires laissés par les clients sur les produits.
9. 🔔 **`notifications` (Notifications)** : Les alertes envoyées en temps réel (ex: alerte de stock bas pour le vendeur).
10. ❤️ **`favoris` (Favoris)** : Les produits sauvegardés par les clients.
11. 📝 **`demandesVendeur` (Demandes Vendeur)** : Les demandes envoyées par les clients qui souhaitent devenir producteurs.

> ⚡ **Information importante** : Dans Firebase, ces collections se créent **toutes seules** dès qu'une action est faite sur l'application. Vous n'avez pas besoin de les créer à la main !

---

## 🚀 4. Guide de Configuration Pas à Pas

### Étape 1 : Créer le projet sur la Console Firebase
1. Rendez-vous sur [console.firebase.google.com](https://console.firebase.google.com).
2. Cliquez sur **Ajouter un projet**, nommez-le **`DUGU-SUGU`** et suivez les étapes.

---

### Étape 2 : Activer l'Authentification (Connexion/Inscription)
1. Dans le menu de gauche ➔ **Construire** ➔ **Authentication**.
2. Cliquez sur **Commencer**.
3. Choisissez **Adresse e-mail/Mot de passe**, cochez **Activer** puis validez.

---

### Étape 3 : Créer la Base de Données (Firestore)
1. Dans le menu de gauche ➔ **Construire** ➔ **Firestore Database**.
2. Cliquez sur **Créer une base de données**.
3. Choisissez le mode **Démarrer en mode test** puis cliquez sur **Créer**.

---

### Étape 4 : Activer le Stockage d'Images (Storage)
1. Dans le menu de gauche ➔ **Construire** ➔ **Storage**.
2. Cliquez sur **Commencer** puis validez les étapes par défaut.

---

### Étape 5 : Lier Firebase au Fichier `.env` de l'Application
1. Sur la console Firebase, cliquez sur l'engrenage ⚙️ (en haut à gauche) ➔ **Paramètres du projet**.
2. En bas de la page, dans la rubrique **Vos applications**, cliquez sur l'icône Web `</>`.
3. Copiez les clés fournies et coller-les dans le fichier **`.env`** de votre projet VS Code :

```env
VITE_FIREBASE_API_KEY=votre_cle_api
VITE_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet_id
VITE_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
```

---

### Étape 6 : Nommer un Administrateur
1. Inscrivez un compte sur l'application Web (`http://localhost:5173/register`).
2. Dans la console Firebase ➔ **Firestore Database** ➔ Collection **`users`**.
3. Sélectionnez le document de votre compte, trouvez la ligne `role` et remplacez `"client"` par **`"admin"`**.
4. Reconnectez-vous sur l'application : vous avez désormais l'accès Administrateur complet !

---

## 🔄 5. Le Circuit d'une Commande

1. **Passage de commande (Client)** :
   Le client valide son panier ➔ La commande est créée, un **Paiement** et une **Livraison** sont générés automatiquement avec le statut `en_attente`.

2. **Expédition (Vendeur)** :
   Le vendeur consulte sa commande et clique sur **Expédier** ➔ Le statut de la livraison passe à `en_cours`.

3. **Réception & Confirmation (Client)** :
   À la livraison des produits, le client clique sur **Confirmer la réception** ➔ La commande passe à `Livrée`, la livraison à `Livré` et le paiement est automatiquement **Confirmé**.

---

## 💻 6. Démarrer l'Application en Local

Pour lancer le site Web sur votre ordinateur :

```bash
# 1. Installer les dépendances (à faire une seule fois)
npm install

# 2. Lancer le serveur de développement
npm run dev
```

Ouvrez ensuite votre navigateur sur `http://localhost:5173`.
