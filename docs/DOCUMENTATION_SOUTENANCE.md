# 🎓 Guide de Soutenance & Documentation Technique Accessible
## Projet : **DUGU SUGU** — Marketplace Agricole Locale

---

## 📌 Partie 1 : Explication Vulgarisée du Projet

### 1.1 Qu'est-ce que DUGU SUGU ?
**DUGU SUGU** (qui signifie *"Le Marché du Village"* en bambara) est une plateforme web e-commerce dédiée au secteur agricole malien. 

* **Le Problème** : Les producteurs agricoles (agriculteurs, maraîchers, coopératives) éprouvent des difficultés à vendre leurs récoltes au juste prix à cause d'une chaîne d'intermédiaires trop longue. Les consommateurs en ville ont du mal à trouver des produits locaux frais, bio et traçables.
* **La Solution** : DUGU SUGU offre un marché virtuel direct. Les producteurs créent leur boutique en ligne, gèrent leur stock, et vendent directement aux acheteurs (particuliers, restaurants, grossistes).

---

### 1.2 L'Architecture du Projet Expliquée Simplement
Imaginez DUGU SUGU comme un restaurant moderne :
1. **Le Frontend (La Salle de Restaurant)** : C'est ce que le client voit et touche sur son écran (les boutons, les images de mangues ou de riz, le panier). Réalisé avec **React** et **Tailwind CSS**.
2. **Le Backend (La Cuisine)** : C'est le moteur qui prépare les commandes, envoie les e-mails de confirmation et vérifie les accès. Réalisé avec **Node.js** et **Express.js**.
3. **La Base de Données Cloud (Le Garde-Manger / Le Magasin)** : C'est là où sont rangés en sécurité tous les produits, les utilisateurs et les commandes. Réalisé avec **Firebase (Google Cloud)**.

---

### 1.3 Pourquoi avoir choisi ces Technologies ?

| Technologie | Ce que c'est | Pourquoi ce choix ? (Argument Soutenance) | Comment ça marche ? |
| :--- | :--- | :--- | :--- |
| **React 19** | Bibliothèque JavaScript pour interfaces | Permet de créer une application **SPA (Single Page Application)** ultra-rapide sans rechargement de page. | L'écran se met à jour instantanément lorsqu'on clique sur un produit ou le panier. |
| **TypeScript** | Langage de programmation sécurisé | Évite 90% des bugs d'inattention en imposant des règles strictes sur le type des données. | Si on essaie de mettre du texte à la place d'un prix numérique, TypeScript signale une erreur avant même de lancer le code. |
| **Vite** | Outil d'assemblage (Bundler) | Offre un temps de démarrage et de rechargement instantané lors du développement. | Remplace les anciens outils lents comme Webpack. |
| **Tailwind CSS & Shadcn UI** | Framework de design | Permet de créer une interface moderne, propre, responsive (adaptée aux téléphones et ordinateurs). | Utilise des classes prédéfinies pour construire rapidement des boutons, cartes et formulaires. |
| **Firebase (Firestore, Auth, Storage)** | Service Cloud par Google | Évite d'avoir à gérer un serveur physique de base de données. Offre une sécurité maximale et une synchronisation en temps réel. | Gère les mots de passe de manière cryptée, stocke les images de produits et sauvegarde les données de manière fiable. |
| **Express.js (Node.js)** | Serveur d'API | Gère l'envoi automatisé d'emails transactionnels (confirmations de commandes, alertes). | Reçoit des requêtes HTTP du frontend et exécute les scripts de notification par e-mail. |

---

## ⚙️ Partie 2 : Le Découpage Fonctionnel (Pourquoi & Comment)

### 2.1 L'Authentification et la Gestion des Rôles
* **Pourquoi ?** Un client ne doit pas pouvoir modifier le stock d'un vendeur, et un vendeur ne doit pas pouvoir accéder aux configurations d'un administrateur.
* **Comment ?** Nous utilisons **Firebase Auth** combiné avec des rôles stockés dans les profils utilisateur (`client`, `seller`, `admin`). Des middlewares protègent les pages du dashboard.

### 2.2 Le Catalogue Produits & La Recherche
* **Pourquoi ?** Permettre aux acheteurs de trouver rapidement des produits agricoles locaux (fruits, légumes, céréales, tubercules, produits bio).
* **Comment ?** Recherche par mots-clés, filtrage par catégorie et tri dynamique. Les images sont hébergées sur le Cloud pour un chargement rapide.

### 2.3 Le Panier & Le Processus de Commande
* **Pourquoi ?** Permettre l'achat groupé ou individuel auprès des producteurs avec calcul automatique des totaux.
* **Comment ?** Le panier est conservé dans l'état local (`localStorage` + état React) et synchronisé avec Firestore lors de la validation.

### 2.4 L'Espace Vendeur / Producteur
* **Pourquoi ?** Donner l'autonomie aux producteurs locaux pour gérer leur activité agricole en ligne.
* **Comment ?** Un tableau de bord complet avec des indicateurs (KPIs) : total des ventes, produits en faible stock, commandes à expédier, gestion des ajout/modifications de produits.

### 2.5 L'Espace Administrateur
* **Pourquoi ?** Garantir la qualité des vendeurs sur la plateforme et superviser l'activité globale.
* **Comment ?** Un panneau d'administration dédié pour valider les demandes de compte vendeur, gérer les catégories et visualiser les métriques globales.

---

## ❓ Partie 3 : Les 100 Questions & Réponses Probables pour la Soutenance

### 📁 Thème 1 : Présentation & Vision du Projet (Q1 - Q15)

1. **Q : Pouvez-vous résumer votre projet en deux phrases ?**
   * **R** : DUGU SUGU est une marketplace agricole malienne reliant directement les producteurs locaux aux consommateurs. Elle permet aux agriculteurs de vendre leurs récoltes sans intermédiaire et offre aux acheteurs des produits locaux et bio de qualité.

2. **Q : Quel est le principal problème auquel répond DUGU SUGU ?**
   * **R** : La dépendance excessive aux intermédiaires qui réduisent la marge des agriculteurs et augmentent les prix pour les consommateurs urbains.

3. **Q : Qui sont les utilisateurs cibles de l'application ?**
   * **R** : Les producteurs agricoles (vendeurs), les acheteurs individuels/ménages, les restaurateurs/hôtels (acheteurs institutionnels) et l'équipe de gestion (administrateurs).

4. **Q : Pourquoi le nom "DUGU SUGU" ?**
   * **R** : DUGU SUGU signifie "Le Marché du Village" en bambara, symbolisant la proximité, le consommer local et l'authenticité.

5. **Q : Quelle est la valeur ajoutée par rapport à un marché traditionnel ?**
   * **R** : Accès H24, transparence des prix, gestion des stocks en temps réel, gain de temps pour les acheteurs et ouverture d'un marché plus vaste pour les producteurs.

6. **Q : Comment un agriculteur devient-il vendeur sur la plateforme ?**
   * **R** : Il crée un compte client, fait une demande de compte vendeur via un formulaire dédié, puis un administrateur valide sa demande après vérification.

7. **Q : Le site est-il adapté aux téléphones portables ?**
   * **R** : Oui, il est conçu selon l'approche *Mobile-First* avec Tailwind CSS, car la majorité des utilisateurs en Afrique accèdent à Internet via leur smartphone.

8. **Q : Quels types de produits trouve-t-on sur la plateforme ?**
   * **R** : Céréales, fruits, légumes, tubercules, oléagineux, produits de l'élevage et produits transformés locaux (beurre de karité, miel, etc.).

9. **Q : Comment assurez-vous la fraîcheur des produits ?**
   * **R** : La mise en relation directe fait que la commande est transmise immédiatement au producteur qui prépare la récolte ou l'envoi dès confirmation.

10. **Q : Y a-t-il une option pour les produits Bio ?**
    * **R** : Oui, chaque produit possède un badge "Bio" facultatif coché par le producteur si sa production respecte les normes agroécologiques.

11. **Q : Quelle est la monnaie utilisée sur la plateforme ?**
    * **R** : Le Franc CFA (FCFA), la monnaie locale.

12. **Q : Quel a été votre rôle dans l'équipe projet ?**
    * **R** : *(Réponse personnalisée selon l'étudiant : ex. Développement Fullstack, Conception UI/UX, Intégration Firebase, etc.)*.

13. **Q : Combien de temps a pris la réalisation du projet ?**
    * **R** : Le projet a été conçu et développé sur plusieurs semaines selon une méthodologie agile par itérations.

14. **Q : Avez-vous réalisé une étude de marché au préalable ?**
    * **R** : Oui, basée sur l'observation des circuits de distribution agricole au Mali et de la montée en puissance du e-commerce en Afrique de l'Ouest.

15. **Q : Quel est le modèle économique (Business Model) envisagé ?**
    * **R** : Une commission minime sur les ventes réalisées ou un abonnement mensuel pour les vendeurs professionnels.

---

### 💻 Thème 2 : Choix Techniques & Architecture (Q16 - Q35)

16. **Q : Pourquoi avoir choisi React plutôt que du HTML/JS classique ou PHP ?**
    * **R** : React permet de créer une application dynamique par composants réutilisables avec un rendu rapide grâce au Virtual DOM.

17. **Q : Qu'est-ce qu'une SPA (Single Page Application) ?**
    * **R** : C'est une application web qui charge une seule page HTML. Lorsque l'utilisateur navigue, seul le contenu nécessaire est mis à jour sans recharger toute la page.

18. **Q : Pourquoi utiliser TypeScript au lieu de JavaScript pur ?**
    * **R** : TypeScript ajoute le typage statique. Il permet de détecter les erreurs à la compilation et facilite la maintenance à plusieurs développeurs.

19. **Q : Quel est le rôle de Vite.js dans votre projet ?**
    * **R** : Vite est le serveur de développement et le bundler de production. Il offre un démarrage instantané et un rechargement à chaud (HMR) très rapide.

20. **Q : Qu'est-ce que Tailwind CSS et quel est son avantage ?**
    * **R** : C'est un framework CSS utilitaire qui permet de styliser les éléments directement dans le code sans écrire de gros fichiers CSS séparés.

21. **Q : Pourquoi utiliser Shadcn UI ?**
    * **R** : Shadcn UI fournit des composants d'interface pré-conçus (boutons, modales, dialogues), accessibles et personnalisables.

22. **Q : À quoi sert le fichier `vite.config.ts` ?**
    * **R** : Il configure le serveur de développement Vite, les alias de dossiers (`@/`) et le proxy HTTP pour l'API backend.

23. **Q : Pourquoi avoir un serveur backend Express à côté de Firebase ?**
    * **R** : Le serveur Express s'occupe des tâches côté serveur sécurisées comme l'envoi d'e-mails transactionnels ou la logique métier administrative.

24. **Q : Qu'est-ce qu'une API REST ?**
    * **R** : C'est une architecture logicielle permettant au frontend et au backend de communiquer en s'échangeant des données au format JSON via des requêtes HTTP (GET, POST, PUT, DELETE).

25. **Q : Qu'est-ce que CORS et pourquoi l'avoir configuré sur votre serveur ?**
    * **R** : CORS (Cross-Origin Resource Sharing) est une sécurité du navigateur. Nous l'avons configuré pour autoriser notre frontend (`localhost:3000`) à faire des requêtes vers notre serveur backend (`localhost:5001`).

26. **Q : À quoi sert le dossier `src/components` ?**
    * **R** : Il rassemble tous les composants graphiques réutilisables (boutons, cartes de produits, barres de navigation, pieds de page).

27. **Q : À quoi sert le dossier `src/pages` ?**
    * **R** : Il contient les vues principales de l'application (Accueil, Produits, Connexion, Dashboard Vendeur, Dashboard Admin).

28. **Q : Comment gérez-vous la navigation dans l'application ?**
    * **R** : Avec `react-router-dom`, qui associe chaque URL (ex: `/dashboard/seller`) à un composant React spécifique.

29. **Q : Qu'est-ce qu'un "Hook" React ? En utilisez-vous ?**
    * **R** : Un Hook est une fonction spéciale qui permet d'utiliser le state et les fonctionnalités de React (ex: `useState`, `useEffect`, `useMemo`).

30. **Q : À quoi sert `useState` ?**
    * **R** : À déclarer une variable d'état qui, lorsqu'elle change, provoque le rafraîchissement automatique du composant graphique.

31. **Q : À quoi sert `useEffect` ?**
    * **R** : À exécuter des effets secondaires, comme charger des données depuis Firebase au chargement d'un composant.

32. **Q : Comment sont organisées les icônes sur le site ?**
    * **R** : Nous utilisons la bibliothèque `lucide-react` qui fournit des icônes vectorielles légères et personnalisables.

33. **Q : Pourquoi avoir choisi d'utiliser Lucide Icons ?**
    * **R** : Pour leur cohérence visuelle, leur légèreté en termes de taille de fichier et leur compatibilité parfaite avec React.

34. **Q : Qu'est-ce que `npm` et à quoi sert `package.json` ?**
    * **R** : `npm` est le gestionnaire de paquets Node.js. `package.json` est le fichier qui liste toutes les dépendances et scripts du projet.

35. **Q : Quelle est la différence entre `dependencies` et `devDependencies` ?**
    * **R** : `dependencies` sont nécessaires à l'exécution de l'application en production, tandis que `devDependencies` ne servent que pendant le développement (ex: TypeScript, ESLint).

---

### ☁️ Thème 3 : Base de données, Cloud & Firebase (Q36 - Q50)

36. **Q : Pourquoi avoir choisi Firebase au lieu d'une base SQL comme MySQL ou PostgreSQL ?**
    * **R** : Firebase est une plateforme Cloud NoSQL qui s'adapte très rapidement aux besoins des projets web modernes, gère l'authentification et offre une grande évolutivité (scalabilité).

37. **Q : Qu'est-ce que Cloud Firestore ?**
    * **R** : C'est la base de données orientée documents de Firebase. Les données sont organisées en **Collections** et **Documents** au lieu de tables et lignes.

38. **Q : Quelles sont les principales collections Firestore de votre projet ?**
    * **R** : `users` (profils), `products` (catalogue), `categories` (catégories), `orders` (commandes), `demandesVendeur` (demandes d'habilitation) et `notifications`.

39. **Q : Comment Firebase gère-t-il la sécurité de l'authentification ?**
    * **R** : Firebase Auth gère le hachage et le stockage sécurisé des mots de passe sur les serveurs Google. Aucun mot de passe n'est stocké en clair.

40. **Q : Comment sont stockées les images des produits ?**
    * **R** : Dans **Firebase Storage** (stockage de fichiers cloud), ou sous forme d'URL optimisées.

41. **Q : Que se passe-t-il si un utilisateur essaie d'accéder à une page sans être connecté ?**
    * **R** : Les routes sont protégées. Si l'utilisateur n'a pas de session active dans Firebase Auth, il est automatiquement redirigé vers la page de connexion.

42. **Q : Comment gérez-vous le rôle des utilisateurs dans Firebase ?**
    * **R** : Chaque document utilisateur dans la collection `users` possède un champ `role` qui vaut soit `'client'`, `'seller'`, ou `'admin'`.

43. **Q : Qu'est-ce que Firebase Storage ?**
    * **R** : C'est le service de stockage de fichiers binaires (images, documents) de Firebase.

44. **Q : Est-il possible d'utiliser DUGU SUGU hors-ligne ?**
    * **R** : Firestore possède un système de mise en cache locale qui permet d'afficher les dernières données consultées même en cas de coupure internet temporaire.

45. **Q : Comment faites-vous pour récupérer les produits d'un vendeur spécifique ?**
    * **R** : En faisant une requête Firestore filtrée avec `query(collection(db, 'products'), where('seller_id', '==', userId))`.

46. **Q : Comment calculez-vous le chiffre d'affaires d'un vendeur ?**
    * **R** : En faisant la somme des totaux des commandes livrées associées au `seller_id` du vendeur.

47. **Q : Quelle est la différence entre une base de données SQL et NoSQL ?**
    * **R** : SQL utilise des tables rigides avec des clés étrangères. NoSQL (Firestore) utilise des documents flexible au format JSON, idéal pour le développement rapide.

48. **Q : Comment sont gérées les notifications dans l'application ?**
    * **R** : Elles sont enregistrées dans la collection `notifications` et affichées en temps réel sur l'interface du destinataire.

49. **Q : Les règles de sécurité Firestore (Security Rules) ont-elles été configurées ?**
    * **R** : Oui, elles définissent qui a le droit de lire et d'écrire dans chaque collection (ex: seul l'admin peut modifier le rôle d'un utilisateur).

50. **Q : Que contient le fichier `.env` ?**
    * **R** : Les clés de configuration de l'API Firebase (API Key, Auth Domain, Project ID, etc.) et les variables du serveur.

---

### 🎨 Thème 4 : Interface Utilisateur, UX/UI & Responsive (Q51 - Q65)

51. **Q : Qu'entend-on par "UX" et "UI" ?**
    * **R** : **UI (User Interface)** désigne le design visuel (couleurs, typographie). **UX (User Experience)** désigne la facilité d'utilisation et le sentiment de fluidité pour l'utilisateur.

52. **Q : Quelles sont les couleurs principales de DUGU SUGU et pourquoi ce choix ?**
    * **R** : Des teintes de vert agricole et de terre/ambre, évoquant la nature, l'agriculture malienne, la fraîcheur et la confiance.

53. **Q : Comment garantissez-vous que le site soit lisible sur un smartphone ?**
    * **R** : Grâce aux classes réactives de Tailwind CSS (ex: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) qui adaptent automatiquement la mise en page.

54. **Q : À quoi sert le composant "Navbar" (barre de navigation) ?**
    * **R** : À naviguer rapidement vers le catalogue, le panier, les favoris et l'espace profil/dashboard.

55. **Q : Comment l'utilisateur sait-il qu'une action a réussi (ex: produit ajouté au panier) ?**
    * **R** : Nous affichons des notifications visuelles instantanées (toasts) grâce à la bibliothèque **Sonner**.

56. **Q : Comment gérez-vous les états de chargement (loading states) ?**
    * **R** : En affichant des indicateurs visuels (spinners ou squelettes de chargement "skeletons") pendant le téléchargement des données.

57. **Q : Qu'est-ce qu'un composant "Modal" ou "Dialog" ?**
    * **R** : Une fenêtre superposée qui s'ouvre par-dessus l'écran principal sans quitter la page (ex: pour confirmer la suppression d'un produit).

58. **Q : Comment affichez-vous les badges de statut de commande (En attente, Expédiée, Deliverée) ?**
    * **R** : Avec le composant `OrderStatusBadge` qui applique une couleur distincte selon le statut (orange pour en attente, bleu pour expédiée, vert pour livrée).

59. **Q : Comment est géré le formulaire d'ajout de produit ?**
    * **R** : Avec des champs contrôlés pour valider les saisies (nom, prix positif, stock, catégorie, description, images).

60. **Q : Qu'est-ce que le "Dark Mode" (mode sombre) ? Est-il supporté ?**
    * **R** : C'est une variante visuelle sombre pour le confort des yeux la nuit. Il est géré via Tailwind CSS et `next-themes`.

61. **Q : Comment l'acheteur choisit-il la quantité d'un produit ?**
    * **R** : Via un sélecteur de quantité numérique (+ / -) qui met à jour instantanément le prix sous-total.

62. **Q : À quoi sert la page d'accueil (Home) ?**
    * **R** : À captiver l'utilisateur avec une bannière Hero attractive, mettre en avant les catégories phares, les produits populaires et expliquer la mission de DUGU SUGU.

63. **Q : Comment gérez-vous l'accessibilité (A11y) ?**
    * **R** : En utilisant des contrastes de couleurs suffisants, des balises HTML5 sémantiques et les composants accessibles de Radix/Shadcn.

64. **Q : Qu'est-ce qu'un fil d'Ariane (Breadcrumb) ?**
    * **R** : Un chemin de navigation texte permettant à l'utilisateur de savoir où il se trouve dans l'arborescence du site (ex: Accueil > Légumes > Oignons).

65. **Q : Comment sont présentées les fiches produits ?**
    * **R** : Sous forme de cartes (Cards) élégantes comprenant l'image du produit, son prix, son unité (kg, sac), le nom du producteur et un bouton d'ajout rapide au panier.

---

### 🛒 Thème 5 : Fonctionnalités Métier & Rôles (Q66 - Q80)

66. **Q : Quelles sont les étapes d'un achat sur DUGU SUGU ?**
    * **R** : 1. Exploration du catalogue -> 2. Ajout au panier -> 3. Validation de la commande -> 4. Saisie de l'adresse de livraison -> 5. Confirmation et notification au vendeur.

67. **Q : Que se passe-t-il lorsqu'un produit est en rupture de stock ?**
    * **R** : Un badge "Rupture de stock" s'affiche, le bouton d'ajout au panier est désactivé et le vendeur reçoit une alerte dans son tableau de bord.

68. **Q : Comment un client suit-il l'avancement de sa commande ?**
    * **R** : Dans son espace "Mes Commandes", où il peut voir le statut en temps réel (En attente, En cours de préparation, Expédiée, Livrée).

69. **Q : Qu'est-ce que le système de Favoris ?**
    * **R** : Il permet à un acheteur de cliquer sur un cœur pour sauvegarder ses produits préférés et les retrouver facilement plus tard.

70. **Q : Comment fonctionne la demande pour devenir vendeur ?**
    * **R** : Le client remplit un formulaire expliquant son activité agricole. La demande passe au statut `pending` jusqu'à ce qu'un admin l'approuve ou la refuse.

71. **Q : Que se passe-t-il lorsqu'un administrateur valide une demande vendeur ?**
    * **R** : Le rôle du profil utilisateur passe à `'seller'`, une notification est enregistrée et un e-mail de félicitations est envoyé au nouveau vendeur.

72. **Q : Un vendeur peut-il modifier le prix de ses produits à tout moment ?**
    * **R** : Oui, depuis son dashboard dans la section "Gestion des Produits".

73. **Q : Comment l'administrateur gère-t-il les catégories de produits ?**
    * **R** : Il peut ajouter de nouvelles catégories (ex: Fruits, Céréales), les modifier ou les supprimer (si aucun produit ne leur est rattaché).

74. **Q : Qu'advient-il d'une commande refusée ou annulée ?**
    * **R** : Son statut passe à "Annulée", le stock du produit est recrédité et le client est notifié.

75. **Q : Comment les avis et notes (Reviews) sont-ils attribués ?**
    * **R** : Les clients ayant acheté un produit peuvent lui attribuer une note sur 5 étoiles et laisser un commentaire pour guider les futurs acheteurs.

76. **Q : Comment est calculée la note moyenne d'un produit ?**
    * **R** : En faisant la moyenne arithmétique de l'ensemble des notes publiées pour ce produit dans Firestore.

77. **Q : Est-il possible de filtrer les produits par ville ou région du Mali ?**
    * **R** : Oui, la localisation du producteur est associée à chaque fiche produit pour favoriser le circuit court local.

78. **Q : Comment le système gère-t-il les différentes unités de vente (kg, sac, carton, pièce) ?**
    * **R** : Chaque produit possède un champ `unit` prédéfini sélectionné par le vendeur lors de la création de la fiche.

79. **Q : Comment un vendeur sait-il qu'il a reçu une nouvelle commande ?**
    * **R** : Une notification apparaît dans son dashboard vendeur et un e-mail automatique lui est envoyé par le serveur.

80. **Q : L'administrateur peut-il bloquer un utilisateur malveillant ?**
    * **R** : Oui, depuis le panneau "Gestion des Utilisateurs", l'administrateur peut suspendre ou bloquer un compte.

---

### 🛡️ Thème 6 : Sécurité, Performance & Maintenance (Q81 - Q90)

81. **Q : Comment la sécurité des données est-elle assurée sur le frontend ?**
    * **R** : Aucune donnée sensible n'est stockée dans le navigateur. Les tokens d'authentification sont gérés de manière sécurisée par Firebase Auth.

82. **Q : Comment évitez-vous l'injection de code malveillant (XSS) dans React ?**
    * **R** : React échappe automatiquement tout le contenu inséré dans le JSX par défaut, empêchant l'exécution de scripts malveillants.

83. **Q : Quel est le rôle du fichier `.gitignore` ?**
    * **R** : Il indique à Git les fichiers à ne pas envoyer sur le serveur distant (ex: `node_modules/`, `.env`, clés privées).

84. **Q : Comment optimisez-vous le temps de chargement des pages ?**
    * **R** : En utilisant le découpage de code (Code Splitting), la compression des images et la mise en cache de Vite.

85. **Q : Que faites-vous en cas d'erreur inattendue sur une page React ?**
    * **R** : Nous capturons les erreurs dans des blocs `try/catch` et affichons des messages d'erreur clairs sans faire crasher l'application.

86. **Q : Qu'est-ce qu'un "Build" de production ?**
    * **R** : C'est l'étape où le code TypeScript et JSX est minifié et compilé en fichiers HTML/CSS/JS ultra-optimisés pour les serveurs Web (`npm run build`).

87. **Q : À quoi sert ESLint dans votre projet ?**
    * **R** : C'est un linter qui analyse le code pour détecter les erreurs de syntaxe, les variables inutilisées et faire respecter les normes de codage.

88. **Q : Comment les clés d'API sont-elles protégées ?**
    * **R** : Elles sont stockées dans les variables d'environnement (`.env`) et non écrites en dur dans le code source.

89. **Q : Pourquoi le backend écoute-t-il sur le port 5001 ?**
    * **R** : Pour ne pas entrer en conflit avec le serveur frontend Vite qui tourne sur le port 3000.

90. **Q : Qu'est-ce qu'un Log et à quoi sert `morgan` sur le serveur Express ?**
    * **R** : `morgan` est un middleware qui enregistre dans la console toutes les requêtes HTTP arrivant sur le serveur (méthode, URL, statut, temps de réponse) pour faciliter le débogage.

---

### 🚀 Thème 7 : Perspectives d'Évolution & Scalabilité (Q91 - Q100)

91. **Q : Quelles sont les futures améliorations prévues pour DUGU SUGU ?**
    * **R** : L'intégration du paiement mobile local (Orange Money, Moov Money, Wave), une application mobile native (React Native) et un système de géolocalisation des livraisons.

92. **Q : Comment comptez-vous gérer l'intégration des paiements mobiles locaux ?**
    * **R** : Via les API officielles d'Orange Money ou Wave en créant un Webhook sécurisé sur notre serveur Express.

93. **Q : L'architecture actuelle peut-elle supporter 100 000 utilisateurs ?**
    * **R** : Oui, car Firebase s'adapte automatiquement à la charge (Auto-scaling) et l'application React est hébergée sur des réseaux CDN mondiaux.

94. **Q : Comment pourriez-vous aider les producteurs ne sachant ni lire ni écrire ?**
    * **R** : En ajoutant une interface vocale en Bambara ou un système d'icônes simplifiées.

95. **Q : Envisagez-vous d'ajouter un chat en direct entre acheteurs et vendeurs ?**
    * **R** : Oui, grâce aux fonctionnalités en temps réel de Cloud Firestore, l'ajout d'une messagerie instantanée est très facile à implémenter.

96. **Q : Comment comptez-vous gérer le suivi des livraisons sur le terrain ?**
    * **R** : En créant un rôle "Livreur" avec une vue dédiée permettant de scanner des QR codes à la remise des colis.

97. **Q : Qu'avez-vous appris de plus important en réalisant ce projet ?**
    * **R** : La maîtrise de l'écosystème React moderne, l'architecture Cloud NoSQL, et la conception d'un produit répondant à un vrai besoin socio-économique.

98. **Q : Si vous deviez refaire le projet aujourd'hui, que changeriez-vous ?**
    * **R** : Nous mettrions en place une couverture de tests automatisés (Jest/Vitest) dès le début du projet.

99. **Q : Comment assurez-vous la conformité de l'application avec la protection des données ?**
    * **R** : En ne collectant que les informations strictement nécessaires et en permettant la suppression du compte sur demande.

100. **Q : Quel est le mot de la fin pour conclure votre soutenance ?**
     * **R** : DUGU SUGU est bien plus qu'une plateforme e-commerce : c'est un outil de souveraineté alimentaire et de digitalisation du monde agricole malien, alliant technologie moderne et impact social fort. Merci pour votre attention !

---

## 🔬 Partie 4 : 50 Questions Techniques Approfondies (Q101 - Q150)
### *(Pour répondre avec précision aux examinateurs et jurys techniques)*

101. **Q : Quelle est la différence entre `import.meta.env` et `process.env` dans ce projet ?**
     * **R** : `import.meta.env` est la syntaxe standard exposée par **Vite.js** côté frontend (ex: `import.meta.env.VITE_FIREBASE_API_KEY`), tandis que `process.env` est l'objet natif **Node.js** utilisé dans le serveur Express (`server/index.ts`).

102. **Q : Pourquoi le préfixe `VITE_` est-il obligatoire pour les variables d'environnement frontend ?**
     * **R** : Pour des raisons de sécurité, Vite n'expose au code navigateur que les variables d'environnement dont le nom commence par `VITE_`, évitant de fuiter par erreur des secrets serveur.

103. **Q : Qu'est-ce que le Virtual DOM et comment React l'utilise-t-il pour maximiser les performances ?**
     * **R** : Le Virtual DOM est une copie légère en mémoire du DOM réel. Lors d'un changement d'état, React compare l'ancien et le nouveau Virtual DOM (processus de *Reconciliation* ou d'invalidation avec l'algorithme *Fiber*) et n'applique dans le vrai navigateur que les modifications strictement nécessaires.

104. **Q : Pourquoi utiliser des clés (`key`) uniques dans les boucles `.map()` de React ?**
     * **R** : La clé permet à React d'identifier de manière unique chaque élément d'une liste afin de savoir lesquels ont été ajoutés, modifiés ou supprimés, évitant ainsi le re-rendu inutile de tous les éléments de la liste.

105. **Q : Qu'est-ce qu'une transaction atomique dans Firestore (`runTransaction`) et quand faut-il l'utiliser ?**
     * **R** : Une transaction atomique garantit qu'une série d'opérations de lecture/écriture réussissent TOUTES ou échouent TOUTES ensemble (principe ACID). C'est indispensable lors de la décrémentation du stock à l'achat pour éviter qu'un produit soit vendu deux fois en même temps (race condition).

106. **Q : Qu'est-ce qu'un lot d'écritures (`writeBatch`) dans Firestore ?**
     * **R** : Un `writeBatch` permet d'exécuter jusqu'à 500 opérations d'écriture (création, mise à jour, suppression) en une seule requête réseau vers Firebase, optimisant ainsi la bande passante et le temps d'exécution.

107. **Q : Comment sont gérés les index composés dans Cloud Firestore ?**
     * **R** : Lorsque nous faisons des requêtes complexes combinant des filtres `where()` et des tri `orderBy()` sur plusieurs champs différents, Firestore exige la création d'un index composé dans la console Firebase pour exécuter la requête en $O(\log N)$.

108. **Q : Comment fonctionne la pagination par curseur dans Firestore ?**
     * **R** : Au lieu d'utiliser un décalage (offset) coûteux, Firestore utilise la fonction `startAfter(dernierDocument)` pour récupérer la page suivante à partir de la clé du dernier document affiché, offrant un temps de réponse constant peu importe le nombre de pages.

109. **Q : Quelle est la différence entre `useEffect` et `useLayoutEffect` ?**
     * **R** : `useEffect` s'exécute de manière asynchrone après le rendu visuel du composant, tandis que `useLayoutEffect` s'exécute de manière synchrone juste après les mutations du DOM mais avant la peinture à l'écran (utile pour mesurer la taille d'éléments graphiques sans clignotement).

110. **Q : Qu'est-ce qu'un Custom Hook et en avez-vous créé dans le projet ?**
     * **R** : Un Custom Hook est une fonction JavaScript réutilisable dont le nom commence par `use` et qui encapsule de la logique réactive (ex: `useAuth`, `useCart`, `useFavorites`), séparant la logique métier du composant d'affichage.

111. **Q : Comment la mise en cache dynamique des composants Shadcn UI est-elle réalisée ?**
     * **R** : Shadcn UI n'est pas installé comme une dépendance `node_modules` externe globale, mais copie directement le code source des composants dans `src/components/ui/`, ce qui permet un contrôle total du code et un Tree-Shaking maximal.

112. **Q : Qu'est-ce que le Tree-Shaking et comment Vite l'exploite-t-il ?**
     * **R** : Le Tree-Shaking élimine le code mort (inutilisé) lors du build de production en analysant les imports/exports ES Modules (`import/export`), réduisant considérablement la taille des fichiers JS téléchargés par l'utilisateur.

113. **Q : À quoi sert l'outil `@tailwindcss/vite` utilisé dans votre `vite.config.ts` ?**
     * **R** : C'est le plugin officiel Tailwind CSS v4 pour Vite qui compile les styles CSS à la volée directement dans le pipeline de Vite sans nécessiter de fichier de configuration `tailwind.config.js` lourd.

114. **Q : Qu'est-ce que la prop `asChild` présente dans les composants Radix UI / Shadcn ?**
     * **R** : Elle permet de transmettre les styles et comportements d'un composant parent (ex: un bouton Shadcn) directement à l'élément enfant immédiat (ex: un composant `<Link>` de React Router) sans ajouter une balise HTML `<div>` ou `<button>` inutile dans le DOM.

115. **Q : Comment sécuriser un formulaire côté client et serveur ?**
     * **R** : Côté client, nous utilisons des schémas de validation avec la bibliothèque **Zod** pour contrôler le format des champs (email valide, prix > 0). Côté serveur ou règles Firestore, nous ré-effectuons systématiquement la validation pour empêcher le contournement du frontend.

116. **Q : Qu'est-ce qu'un middleware Express et comment s'exécute la chaîne d'exécution ?**
     * **R** : Un middleware est une fonction qui a accès aux objets requête (`req`), réponse (`res`) et à la fonction suivante (`next`). Les middlewares s'exécutent en chaîne de manière séquentielle (ex: CORS -> JSON Parser -> `adminOnly` -> Gestionnaire de route).

117. **Q : Comment l'upload d'images de produits fonctionne-t-il techniquement dans `src/lib/api/upload.ts` ?**
     * **R** : L'image sélectionnée par le vendeur est d'abord envoyée sur **Firebase Storage** via `uploadBytes()`, puis la méthode `getDownloadURL()` renvoie l'URL publique HTTPS du fichier qui est ensuite sauvegardée dans le document du produit dans Firestore. Si Firebase Storage n'est pas configuré, un fallback convertit l'image en `DataURL` (base64) pour le test.

118. **Q : Pourquoi utiliser `express.json({ limit: '10mb' })` sur le serveur backend ?**
     * **R** : Ce middleware permet à Express d'analyser le corps des requêtes POST/PUT transmises au format JSON jusqu'à une limite de 10 Mo (nécessaire si de grandes chaînes de caractères ou des images encodées sont envoyées).

119. **Q : À quoi sert le polyfill `globalThis.WebSocket` dans `server/index.ts` ?**
     * **R** : Node.js (dans ses versions antérieures à la v22) n'intégrait pas l'API `WebSocket` globale nativement requise par certains SDKs client Cloud. Le polyfill garantit l'exécution fluide du serveur sans planter sur les connexions réseau.

120. **Q : Quelle est la différence entre les requêtes HTTP `PUT` et `PATCH` ?**
     * **R** : `PUT` remplace l'intégralité de la ressource existante par les nouvelles données, alors que `PATCH` ne modifie que les champs spécifiés dans le corps de la requête (mise à jour partielle).

121. **Q : Qu'est-ce que l'invalidation d'état (State Invalidation) et comment l'utilisez-vous ?**
     * **R** : Lorsqu'un utilisateur effectue une mutation (ex: ajout d'un produit), l'application rafraîchit l'état local ou relance une requête Firestore pour que l'interface reflète immédiatement la nouvelle réalité de la base de données.

122. **Q : Comment gérez-vous la désynchronisation possible entre le panier local et les stocks réels ?**
     * **R** : Lors de la validation finale du Checkout, l'application effectue une vérification ultime de la disponibilité du stock dans Firestore avant de créer la commande.

123. **Q : Qu'est-ce qu'un jeton JWT (JSON Web Token) et à quoi sert-il ?**
     * **R** : Un JWT est un jeton chiffré contenant des informations d'identité (claims) signé par le serveur. Il est transmis dans le header `Authorization: Bearer <token>` pour prouver l'identité de l'utilisateur sans repasser le mot de passe.

124. **Q : Comment Firebase Auth rafraîchit-il les tokens d'accès expirés ?**
     * **R** : Firebase SDK utilise un `RefreshToken` conservé de façon sécurisée par le navigateur pour obtenir automatiquement un nouveau `IDToken` (valide 1 heure) en arrière-plan sans déconnecter l'utilisateur.

125. **Q : Pourquoi avoir configuré un alias de chemin `@/` dans `tsconfig.json` et `vite.config.ts` ?**
     * **R** : Pour éviter les chemins d'importation relatifs illisibles comme `../../../../components/Button` et les remplacer par des chemins absolus propres comme `@/components/Button`.

126. **Q : À quoi sert l'option `"moduleResolution": "bundler"` dans `tsconfig.json` ?**
     * **R** : Elle informe le compilateur TypeScript d'adopter les règles de résolution des modules utilisées par les bundlers modernes comme Vite (support des extensions, sous-chemins `package.json`, etc.).

127. **Q : Comment fonctionne la réinitialisation de mot de passe dans Firebase Auth ?**
     * **R** : Via la méthode `sendPasswordResetEmail(auth, email)`. Firebase génère un lien sécurisé à durée limitée envoyé directement sur la boîte mail de l'utilisateur.

128. **Q : Quel est le principe de moindre privilège appliqué dans l'application ?**
     * **R** : Un utilisateur acheteur ne dispose que des droits stricts nécessaires (consulter, commander). Les droits d'administration ou d'édition de stock sont rigoureusement réservés et vérifiés par les rôles et règles de sécurité.

129. **Q : Qu'est-ce que le composant `React.StrictMode` entourait l'application dans `main.tsx` ?**
     * **R** : C'est un outil de développement qui exécute intentionnellement les effets secondaires deux fois pour détecter les fuites de mémoire, les effets obsolètes et les mauvaises pratiques dans le code.

130. **Q : Qu'est-ce que la déstructuration ES6 et l'opérateur Spread (`...`) ?**
     * **R** : La déstructuration extrait des propriétés d'un objet (`const { name, price } = product`), tandis que l'opérateur Spread recopie les propriétés (`const newProduct = { ...product, stock: 50 }`) de manière immuable.

131. **Q : Pourquoi l'immuabilité de l'état est-elle capitale dans React ?**
     * **R** : React compare les références d'objets en mémoire (égalité superficielle). Si on mutait un objet directement (`product.stock = 5`), React ne détecterait pas le changement et ne mettrait pas à jour l'écran.

132. **Q : Comment gérez-vous le responsive design avec les grilles CSS de Tailwind ?**
     * **R** : En utilisant des classes comme `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`, qui adaptent automatiquement le nombre de colonnes selon la largeur de l'écran.

133. **Q : Qu'est-ce que la fonction `clsx` ou `cn()` utilisée dans les composants UI ?**
     * **R** : `cn()` combine `clsx` et `tailwind-merge`. Elle permet de fusionner dynamiquement des classes Tailwind conditionnelles tout en éliminant les conflits de style (ex: si `bg-red-500` et `bg-blue-500` sont passés simultanément).

134. **Q : Pourquoi avoir un composant `OrderStatusBadge` dédié au lieu de répétitions de code ?**
     * **R** : Pour respecter le principe DRY (*Don't Repeat Yourself*). Toute modification de couleur ou de libellé de statut se fait à un seul endroit dans tout le projet.

135. **Q : Quelle est la différence entre `localStorage` et `sessionStorage` ?**
     * **R** : `localStorage` conserve les données même après la fermeture du navigateur, alors que `sessionStorage` supprime les données dès que l'onglet ou le navigateur est fermé.

136. **Q : Comment fonctionne la recherche textuelle dynamique dans `Products.tsx` ?**
     * **R** : Le texte saisi par l'utilisateur est converti en minuscules et comparé avec le nom et la description de chaque produit filtré en temps réel via un Hook `useMemo()`.

137. **Q : À quoi sert `useMemo` ?**
     * **R** : À mémoriser le résultat d'un calcul lourd (ex: filtrer 500 produits) pour éviter de le réexécuter inutilement à chaque re-rendu du composant si les dépendances n'ont pas changé.

138. **Q : À quoi sert `useCallback` ?**
     * **R** : À mémoriser la référence d'une fonction transmise à des composants enfants pour éviter que ces derniers ne se réaffichent inutilement.

139. **Q : Qu'est-ce que l'optimisme UI (Optimistic UI updates) ?**
     * **R** : C'est le fait de mettre à jour l'interface utilisateur immédiatement (ex: afficher le cœur de favori comme rempli) avant même de recevoir la confirmation de succès de la base de données Cloud.

140. **Q : Que se passe-t-il en cas d'échec de la requête dans un schéma d'Optimistic UI ?**
     * **R** : L'application annule la modification graphique (rollback) et informe l'utilisateur via une alerte visuelle qu'une erreur réseau est survenue.

141. **Q : Qu'est-ce qu'une promesse (`Promise`) et `async/await` en JavaScript ?**
     * **R** : Une promesse représente une valeur future issue d'une opération asynchrone. `async/await` est une syntaxe moderne qui permet d'écrire du code asynchrone lisible de manière séquentielle comme du code synchrone.

142. **Q : Comment fonctionne l'envoi d'emails transactionnels avec Nodemailer / Resend ?**
     * **R** : Le serveur Express utilise un transporteur SMTP authentifié qui prend le modèle HTML du mail et le transmet au serveur de messagerie du destinataire.

143. **Q : Comment le serveur Express sait-il sur quel port écouter ?**
     * **R** : Il lit la variable d'environnement `process.env.SERVER_PORT` ou utilise la valeur par défaut `5001` via la ligne `const PORT = process.env.SERVER_PORT || 5001;`.

144. **Q : À quoi sert le package `dotenv` ?**
     * **R** : À charger automatiquement les variables définies dans le fichier texte local `.env` directement dans l'objet global `process.env` de Node.js lors du lancement du serveur.

145. **Q : Pourquoi nettoyer les effets dans `useEffect` avec une fonction de nettoyage (cleanup function) ?**
     * **R** : Pour annuler les abonnements en temps réel (listeners Firestore), les minuteurs ou les événements réseau lorsque le composant est démonté de l'écran, évitant ainsi les fuites de mémoire.

146. **Q : Comment Firestore gère-t-il les écoutes en temps réel (`onSnapshot`) ?**
     * **R** : `onSnapshot` établit une connexion bidirectionnelle persistante (via WebSockets/gRPC). Chaque fois qu'un document change en BDD, Firebase pousse automatiquement la mise à jour vers le client.

147. **Q : Qu'est-ce qu'un composant de haute ordre (HOC) ou un layout de route ?**
     * **R** : Un composant d'enveloppement (ex: `DashboardLayout`) qui fournit une structure commune (barre latérale, en-tête) à plusieurs sous-pages enfants grâce à la prop `children` ou l'élément `<Outlet />` de React Router.

148. **Q : Comment le projet est-il structuré pour permettre une montée en charge rapide des équipes de dév ?**
     * **R** : Grâce à une séparation nette des responsabilités : les types dans `src/types/`, la couche API dans `src/lib/api/`, l'UI réutilisable dans `src/components/ui/` et les pages dans `src/pages/`.

149. **Q : À quoi sert l'inspection visuelle des composants avec `kimi-plugin-inspect-react` dans `vite.config.ts` ?**
     * **R** : C'est un plugin de développement permettant de cliquer sur un composant dans le navigateur pour ouvrir directement son fichier source dans l'éditeur de code (IDE).

150. **Q : En conclusion technique, quelles ont été les principales contraintes résolues sur ce projet ?**
     * **R** : La synchronisation entre le state local et le Cloud NoSQL, l'harmonisation complète sur l'écosystème Firebase, l'optimisation des performances mobiles et la mise en place d'une interface utilisateur élégante et accessible.
