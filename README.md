# DUGU SUGU — Application Web de Gestion de Vente de Produits Agricoles

Plateforme e-commerce pour la commercialisation et la distribution des produits agricoles au Mali.

## 🛠️ Stack Technologique

- **Frontend** : React.JS + HTML5 + CSS (TailwindCSS) + JavaScript (TypeScript)
- **Backend / SGBD** : Firebase (Authentication, Firestore, Storage)
- **Environnement & Outils** : Visual Studio Code, Vite

## 📐 Architecture & Fonctionnalités

1. **Modèle de Données & Entités** :
   - Entités `Paiement` (`mode_paiement`, `montant`, `statut_paiement`) et `Livraison` (`statut_livraison`, `date_livraison`).
   - Champs `Nom` et `Prénom` séparés à l'inscription et dans la gestion du profil.
2. **Gestion du Flux de Commande** :
   - Flux complet : Connexion → Passage de commande → Initiation du paiement → Expédition (Vendeur) → Confirmation de réception (Client) → Validation du paiement.
3. **Gestion des Rôles & Accès** :
   - Interfaces et tableaux de bord dédiés pour Clients, Vendeurs (Producteurs) et Administrateurs.

## 🚀 Lancement Rapide

```bash
npm install
npm run dev
```
