# Mémoire et Rapport de Projet de Fin d'Études : DUGU SUGU

---

## 1. Introduction Générale

### 1.1. Contexte de l'Étude
Le commerce électronique est en pleine expansion mondiale, mais de nombreux marchés locaux et commerçants indépendants peinent encore à digitaliser leurs activités. La gestion manuelle des stocks, le manque de visibilité en ligne et l'absence d'outils d'analyse des ventes sont autant de freins à la croissance des petites et moyennes entreprises (PME). C'est pour répondre à ce besoin de digitalisation que le projet **Dugu Sugu** a été imaginé.

### 1.2. Problématique
Comment concevoir une plateforme E-commerce centralisée qui offre à la fois une vitrine attractive pour les clients finaux et un outil de gestion (Dashboard) puissant, sécurisé et intuitif pour les vendeurs locaux ?

### 1.3. Objectifs et Périmètre du Projet
L'application **Dugu Sugu** a pour but de fournir :
- Une **vitrine e-commerce** performante pour l'achat de produits.
- Un **Tableau de Bord Vendeur (Seller Dashboard)** permettant aux marchands de suivre leurs ventes, de mettre à jour leurs stocks en temps réel et d'analyser leurs performances.
- Une **console d'administration** pour la modération de la plateforme.

---

## 2. Analyse des Besoins et Cahier des Charges

### 2.1. Besoins Fonctionnels
L'application est divisée en plusieurs "Rôles" (Use Cases) avec des accès stricts :
- **Le Visiteur (Non connecté)** : Peut parcourir le catalogue et ajouter des produits dans un panier temporaire local.
- **L'Acheteur (Client)** : Seul rôle autorisé à passer des commandes, ajouter aux favoris et accéder au checkout. Son panier local est automatiquement synchronisé à la connexion.
- **Le Vendeur** : Dispose d'un espace privé (Dashboard) pour ajouter des produits, gérer son stock et visualiser ses statistiques. Il ne peut pas effectuer d'achats (boutons de panier et favoris masqués).
- **L'Administrateur** : Supervise l'ensemble de la plateforme et gère les utilisateurs. Comme le vendeur, il n'a pas accès aux actions d'achat.

### 2.2. Besoins Non-Fonctionnels
- **Performance** : Le temps de chargement doit être minimal (utilisation d'une architecture SPA).
- **Sécurité** : Les données des vendeurs doivent être strictement cloisonnées (un vendeur A ne doit jamais pouvoir modifier les produits du vendeur B).
- **Responsive Design** : L'interface doit être parfaitement lisible sur smartphone, tablette et ordinateur de bureau (Approche *Mobile-First*).
- **Maintenabilité** : Le code doit être documenté, typé et facilement évolutif.

---

## 3. Conception et Modélisation Technique

### 3.1. Architecture Système Globale
L'application repose sur une architecture **Fullstack Hybride (Backend-For-Frontend)** :
1. **Client (React/Vite)** ➔ Exécute l'interface utilisateur.
2. **Serveur Intermédiaire (Node.js/Express)** ➔ Joue le rôle de proxy, traite les requêtes sensibles nécessitant des clés serveurs (ex: paiements, webhooks).
3. **BaaS (Supabase)** ➔ Gère la base de données PostgreSQL, l'Auth JWT, et les Buckets de stockage de fichiers.

### 3.2. Modélisation de la Base de Données (PostgreSQL)
La base de données est normalisée pour garantir l'intégrité référentielle. Voici la structure détaillée des tables principales :

* **Table `users`** (Gérée par Supabase Auth via `auth.users`)
  * `id` (UUID, PK)
  * `email` (String)
  * `role` (Enum: 'admin', 'seller', 'buyer')
  * `created_at` (Timestamp)

* **Table `categories`**
  * `id` (UUID, PK)
  * `name` (String, Unique)
  * `slug` (String, Unique)

* **Table `products`**
  * `id` (UUID, PK)
  * `seller_id` (UUID, FK -> users.id)
  * `category_id` (UUID, FK -> categories.id)
  * `title` (String)
  * `description` (Text)
  * `price` (Numeric)
  * `stock` (Integer)
  * `image_url` (String - URL pointant vers Supabase Storage)
  * `created_at` (Timestamp)

* **Table `orders`**
  * `id` (UUID, PK)
  * `buyer_id` (UUID, FK -> users.id)
  * `total_amount` (Numeric)
  * `status` (Enum: 'pending', 'paid', 'shipped', 'delivered')

---

## 4. Choix Technologiques et Implémentation Détaillée

### 4.1. Le Frontend (React 19, TypeScript, Vite)
* **TypeScript** : Crucial pour un projet e-commerce. Le typage statique prévient les bugs d'exécution. Exemple de typage pour un produit :
  ```typescript
  export interface Product {
    id: string;
    seller_id: string;
    title: string;
    price: number;
    stock: number;
    image_url: string;
  }
  ```
* **Tailwind CSS v4 & Shadcn UI** : Shadcn UI n'est pas une dépendance classique, il injecte les composants directement dans le dossier `src/components/ui`. Cela donne un contrôle total sur l'accessibilité (Radix UI) et le style.

### 4.2. Validation des Données (React Hook Form + Zod)
Pour garantir que la base de données ne reçoit jamais de données corrompues, nous utilisons `Zod`.
```typescript
import { z } from 'zod';

export const productSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
  price: z.coerce.number().positive("Le prix doit être positif"),
  stock: z.coerce.number().int().nonnegative("Le stock ne peut pas être négatif"),
});
// Ce schéma est ensuite lié à React Hook Form via @hookform/resolvers
```

### 4.3. Configuration du Proxy Vite (Solution au `ECONNREFUSED`)
Pour éviter les problèmes de requêtes inter-domaines (CORS) lors du développement entre React (port 5173) et Express (port 3000), le fichier `vite.config.ts` est configuré comme suit :
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Port du serveur Express local
        changeOrigin: true,
      },
    },
  },
});
```

---

## 5. Sécurité et Gestion des Données

La sécurité est implémentée en profondeur, particulièrement pour le tableau de bord vendeur.

### 5.1. Authentification JWT et RLS (Row Level Security)
Le véritable pare-feu de notre application se trouve au niveau de la base de données PostgreSQL via les politiques RLS de Supabase. Même si un hacker trouve l'URL de l'API, la base de données bloquera la modification.
*Exemple de politique SQL (RLS) sur la table `products` pour la mise à jour (UPDATE) :*
```sql
CREATE POLICY "Vendeurs peuvent modifier leurs propres produits" 
ON products FOR UPDATE 
USING ( auth.uid() = seller_id );
```
*Explication* : La fonction `auth.uid()` extrait l'ID de l'utilisateur depuis le token JWT de la requête HTTP. La modification n'est autorisée que si cet ID correspond au `seller_id` de la ligne ciblée.

### 5.2. Gestion des Médias (Supabase Storage)
Stocker des images en Base64 dans la BDD ruinerait les performances. Le cycle de vie d'une image dans Dugu Sugu est le suivant :
1. Le client sélectionne une image.
2. Le frontend l'envoie au Bucket Supabase via `supabase.storage.from('product-images').upload(...)`.
3. Supabase renvoie une URL publique CDN.
4. Cette URL textuelle est sauvegardée dans la colonne `image_url` de la table `products`.

### 5.3. Contrôle d'Accès Basé sur les Rôles (RBAC) et Expérience Client
Une stricte séparation des rôles a été implémentée sur le Frontend. Les vendeurs et administrateurs n'ont pas accès aux workflows d'achat (panier, favoris, commandes) pour éviter les conflits logiques.
Pour optimiser l'expérience utilisateur, un visiteur non connecté peut commencer ses achats : les produits sont sauvegardés dans le `localStorage` du navigateur. Lors de son inscription ou de sa connexion en tant que client, une fonction `syncCartToDb` est déclenchée pour fusionner instantanément son panier temporaire avec sa session sécurisée en base de données, sans aucune perte de données.

---

## 6. L'Architecture Backend (Express.js)

Bien que Supabase gère le CRUD standard, le dossier `/server` abrite un serveur Node.js/Express.
Ce serveur permet de :
- Créer des routes d'administration complexes (ex: `/api/admin/users`) nécessitant le `service_role_key` de Supabase, une clé absolue qui ne doit **jamais** être exposée côté client (React).
- Traiter les Webhooks (ex: notifications de paiement externe).
Le serveur utilise `morgan` pour le logging des requêtes et `cors` pour la sécurité inter-domaines.

---

## 7. Gestion de Projet, Outillage et CI/CD

- **npm-run-all** : Configuration du script `"dev:all": "npm-run-all --parallel dev server"` dans le `package.json` permettant de lancer simultanément l'environnement frontend (Vite) et backend (Express) avec une seule commande.
- **Linter (ESLint)** : Garantie du respect des normes de code (Code Style) tout au long du développement.
- **Contrôle de Version (Git/GitHub)** : Utilisation de branches (*Feature branches*) pour développer de nouvelles fonctionnalités sans casser la branche principale (`main`).
- **Déploiement** : Le frontend SPA (Single Page Application) est optimisé pour être déployé sur des CDN Edge comme Vercel, tandis que le serveur Express peut être hébergé sur Render ou Railway.

---

## 8. Perspectives et Évolutions Futures (Scalabilité)

1. **Migration vers Next.js (SSR)** : Pour optimiser le SEO (référencement sur Google) du catalogue public, un passage au rendu côté serveur (Server-Side Rendering) serait stratégique.
2. **Mise en cache (Redis)** : Pour soulager la base de données lors des pics d'audience (ex: périodes de soldes), en gardant en mémoire les listes de produits les plus consultés.
3. **Paiements Mobiles Locaux** : Intégration d'API de paiement (Orange Money, Moov Africa) pour finaliser les ventes directement sur la plateforme.

---

## 9. Conclusion Générale

La conception de **Dugu Sugu** a permis de mettre en pratique des concepts avancés d'ingénierie logicielle. En alliant des technologies modernes de rendu (React 19, Vite, Tailwind v4) à une architecture backend robuste et hautement sécurisée (Supabase RLS, Express.js), le projet démontre la capacité à créer des plateformes E-commerce performantes. Ce projet de fin d'études constitue une base solide, résiliente et parfaitement adaptée aux défis de la digitalisation commerciale moderne.

---
---

## 10. Annexe : Préparation à la Soutenance (Foire Aux Questions du Jury)

### Q1. Pourquoi avoir choisi TypeScript plutôt que JavaScript ?
**Réponse :** "JavaScript détecte les erreurs à l'exécution, ce qui peut causer des crashs en production. TypeScript introduit le typage statique. Pour Dugu Sugu, qui manipule des entités complexes comme des `Products` et `Orders`, définir des `Interfaces` claires nous a permis d'éliminer toute une classe de bugs (par exemple, appeler une propriété `prix` au lieu de `price`) et d'avoir un code auto-documenté via l'autocomplétion de l'IDE."

### Q2. Comment assurez-vous la sécurité des données des vendeurs ? Un vendeur peut-il voir les statistiques d'un autre ?
**Réponse :** "La sécurité absolue est assurée par le système de *Row Level Security* (RLS) de PostgreSQL. L'interface React cache certes les boutons, mais un attaquant pourrait contourner le front. Cependant, chaque requête vers Supabase inclut le jeton JWT du vendeur. Les règles SQL (RLS) interceptent la requête et vérifient que l'ID extrait du jeton correspond au `seller_id` de la ligne demandée. Si ce n'est pas le cas, la base de données rejette l'opération."

### Q3. Vous avez à la fois Supabase (BaaS) et un serveur Express (Node.js). N'est-ce pas redondant ?
**Réponse :** "Supabase est parfait pour les requêtes CRUD standards et l'Auth depuis le client. Cependant, un serveur Express (modèle *Backend-For-Frontend*) est indispensable pour des tâches sensibles. Par exemple : exécuter des routes d'administration `/api/admin` nécessitant la clé secrète de contournement (Service Role Key), appeler des API de paiement tierces en masquant nos clés, ou exécuter des tâches planifiées (cron jobs). Exposer ces logiques sur le client React serait une faille de sécurité majeure."

### Q4. Comment gérez-vous la validation des données entrantes (ajout d'un produit par exemple) ?
**Réponse :** "Nous appliquons une validation à deux niveaux. Côté Frontend, nous utilisons `React Hook Form` combiné à la librairie de schémas `Zod`. Zod vérifie que le prix est un nombre (`z.number()`) positif (`.positive()`) avant même d'envoyer la requête, offrant un retour visuel sans latence. Côté Backend, PostgreSQL rejette les données qui ne respectent pas les contraintes de types de colonnes."

### Q5. Expliquez-nous l'erreur "ECONNREFUSED" que vous avez rencontrée et sa résolution technique.
**Réponse :** "L'erreur `ECONNREFUSED` survenait en développement. Notre client React (sur le port 5173) faisait des requêtes API vers le proxy Vite configuré pour pointer vers notre serveur Express (port 3000), mais ce dernier n'était pas démarré. Nous avons résolu cela architecturalement via le package `npm-run-all` avec le script `dev:all`, garantissant le lancement simultané des deux serveurs. Le proxy Vite a également permis de contourner les restrictions CORS du navigateur en développement."

### Q6. Pourquoi Tailwind CSS et Shadcn UI plutôt que Bootstrap ou Material UI ?
**Réponse :** "Bootstrap et MUI imposent un design très lourd et difficile à surcharger. Tailwind CSS nous donne un contrôle stylistique total avec ses classes utilitaires. Shadcn UI complète cela de manière innovante : il ne s'installe pas via `npm install shadcn`. Il injecte le code brut des composants (basés sur la surcouche accessible Radix UI) directement dans notre dossier `src/components`. Nous avons donc la propriété totale du code des composants, sans dépendance externe bloquante."

### Q7. Comment avez-vous géré l'upload des images ?
**Réponse :** "Stocker des images en Base64 dans des colonnes TEXT de PostgreSQL ruinerait les performances d'indexation. Nous utilisons le service de *Buckets* de Supabase Storage. Le fichier binaire y est téléversé, et le service nous retourne une URL CDN publique optimisée. C'est uniquement cette URL textuelle que nous sauvegardons dans la table `products`. Le chargement des images pour les clients finaux est ainsi ultra-rapide."

### Q8. Si vous deviez refaire ce projet, que feriez-vous différemment pour passer à grande échelle ?
**Réponse :** "Dugu Sugu est actuellement une Single Page Application (SPA). Bien que la réactivité soit excellente pour le Dashboard Vendeur, le catalogue public souffre en termes de SEO car le HTML est généré côté client. La prochaine évolution architecturale serait de migrer le frontend public vers **Next.js** pour bénéficier du Server-Side Rendering (SSR). Cela permettrait aux robots de Google d'indexer parfaitement nos produits. Nous devrions aussi implémenter un cache Redis sur Express pour réduire la charge de la base de données."

### Q9. Comment gérez-vous le panier pour un visiteur qui n'a pas encore créé de compte ?
**Réponse :** "Pour ne pas frustrer l'utilisateur et encourager la conversion, le visiteur peut ajouter des articles au panier sans être connecté. Ces données sont stockées dans le navigateur via le `localStorage`. Cependant, la page de validation (`/checkout`) est bloquée par la vérification de l'authentification. Dès que le visiteur se connecte ou s'inscrit, le contexte d'authentification (`AuthContext`) détecte son rôle 'client' et exécute une fonction asynchrone `syncCartToDb` qui transfère automatiquement tous les articles locaux vers la base de données Supabase. Le panier local est ensuite purgé."
