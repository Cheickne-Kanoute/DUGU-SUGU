

<!-- Start of picture text -->
Ld |<br>a...<br><!-- End of picture text -->



<!-- Start of picture text -->
a...<br><!-- End of picture text -->



# Table des matières 

|Table des matières ....................................................................................................................... II|
|---|
|Remerciements...............................................................................................................................I|
|Liste des figures et tableaux..........................................................................................................II|
|Sigles et abréviations...................................................................................................................III|
|**Introduction**.............................................................................................................................1|
|Chapitre 1 : Généralités................................................................................................................. 3|
|1.1 Processus Actuel..................................................................................................................3|
|1.2 Vers une Solution Numérique.............................................................................................3|
|**1.3 Conclusion**..........................................................................................................................4|
|Chapitre 2 : Présentation du sujet..................................................................................................4|
|2.1 Contexte...............................................................................................................................4|
|2.2 Justification du Projet.......................................................................................................... 4|
|2.3 Objectif général...................................................................................................................5|
|2.4 Objectif spécifique...............................................................................................................5|
|2.5 Cadre du projet....................................................................................................................5|
|**2.6 Conclusion**..........................................................................................................................6|
|Chapitre 3 : Analyse et conception................................................................................................8|
|3.1 Les besoins fonctionnels......................................................................................................8|
|<br>Client...............................................................................................................................8|
|<br>Vendeur (producteur)......................................................................................................8|
|<br>Administrateur.................................................................................................................8|
|3.2.  Diagrammes.......................................................................................................................8|
|<br>Diagramme de cas d'utilisation................................................................................9|
|<br>Diagramme de classe.............................................................................................10|
|<br>Diagramme de séquence........................................................................................11|
|**3.3 Conclusion**........................................................................................................................11|
|Chapitre 4 : Réalisaton de la soluton<br>4.1 Introduction **:**.................................................................................................................... 12|



|~~4.2. Outils choisis pour l’analyse et conception......................................................................12~~|
|---|
|4.3 Présentation du système.....................................................................................................13|
|4.3.1 Technologies et outils utilisés.......................................................................................13|
|4.3.2Élaboration des modules fonctionnels...........................................................................16|
|I<br>**Conclusion générale et perspectives**.......................................................................................... i|
|**Bibliographie**.............................................................................................................................. ii|
|1.<br>Ouvrages et Documentation Technique ......................................................................... ii|
|2.<br>Ressources Complémentaires ........................................................................................ ii|



II 

## **Remerciements** 

Au terme de ce mémoire, nous tenons à exprimer notre profonde gratitude à toutes les personnes qui, de près ou de loin, ont contribué à sa réalisation. nous tenons à adresser nos sincères remerciements à **Dieu le Tout-Puissant** pour nous avoir accordé la santé, la force et la sagesse nécessaires tout au long de notre parcours académique et durant la réalisation de ce travail de fin de cycle. 

Nos remerciements s'adressent tout particulièrement à notre encadrant, **Monsieur CISSE Oumar B** , pour sa disponibilité, ses conseils avisés et le suivi rigoureux dont il a fait preuve tout au long de cette étape cruciale de notre formation. 

Nous adressons tout d'abord nos sincères remerciements à nos très chers parents pour leur amour, leurs sacrifices, leurs encouragements permanents ainsi que leur soutien moral et matériel tout au long de notre parcours académique. 

Nous exprimons également notre reconnaissance à l'ensemble de nos professeurs pour la qualité des enseignements qu'ils nous ont dispensés, leur disponibilité, leurs précieux conseils et leur accompagnement tout au long de notre formation. 

Nos remerciements s'adressent particulièrement à toute l'équipe pédagogique de **Technolab ISTA** pour son engagement, son professionnalisme et les connaissances qu'elle nous a transmises, contribuant ainsi à notre formation et à la réalisation de ce mémoire. 

Nous remercions également nos amis ainsi que nos camarades de promotion pour leur esprit de solidarité, leur collaboration, leurs échanges enrichissants et leur soutien durant notre cursus. 

Enfin, nous adressons nos remerciements à toutes les personnes qui, de près ou de loin, ont apporté leur contribution à la réussite de ce travail. Qu'elles trouvent ici l'expression de notre profonde reconnaissance. 

#### **À toutes et à tous, nous disons sincèrement : merci.** 

I 

|**Liste des figures et tableaux**|
|---|
|Figure 1 : Diagramme de cas d’utilisation................................................................................. 9|
|Figure 2 : Diagramme de classe.................................................................................................. 10|
|Figure 3 : Diagramme de séquence……………………............................................................. 11|
|Figure 4 : Tableau de bord.......................................................................................................... 17|
|Figure 5 : Page authentification client……................................................................................. 17|
|Figure 6 : Page d’authentification vendeur................................................................................. 18|
|Figure 7 : Page d’accueil ................................................................................................... 18|
|Figure 8 : Interface panier.......................................................................................................... 19|
|Figure 9 : Page des producteurs (vendeurs) ................................................................................ 19|
|Figure 10 : Page de notifications………………………............................................................. 20|
|Figure 11 : Page profil……………............................................................……………............. 20|



I I 

## **Sigles et abréviations** 

**API** : Application Programming Interface (Interface de Programmation d’Application). 

**HTML** : Langage de balisage pour la conception et structuration de nos pages web (HyperText Making Language). 

**CSS** : qui permet de styliser nos pages html (Cascading Style Sheet). 

**JS** : Langage de programmation qui permet de dynamiser et animer notre page (JavaScript). 

**React.JS** : Langage de programmation 

**Firebase** : Pour le stockage et la gestion de nos données. 

**SGBD** : Système de Gestion de Base de Données. 

**Draw.io** : Logiciel pour implémenter les différents diagrammes UML. 

**UML** : Langage de modélisation unifié (Unified Modeling Language). 

**WEB** : _World Wide Web_ — Système hypertexte fonctionnant sur Internet, permettant la consultation de contenus via un navigateur. 

I I I 

## **Introduction** 

L'agriculture constitue l'un des piliers essentiels de l'économie de nombreux pays, notamment au Mali, où elle représente une source importante de revenus et d'emplois pour une grande partie de la population. Toutefois, la commercialisation des produits agricoles reste confrontée à plusieurs difficultés, telles que le manque de visibilité des produits, les difficultés de mise en relation entre producteurs et acheteurs, ainsi que l'absence d'outils modernes de gestion des ventes. 

Avec l'évolution des technologies de l'information et de la communication, les applications web offrent des solutions efficaces pour améliorer la gestion et la commercialisation des produits agricoles. Elles permettent de simplifier les échanges, d'assurer une meilleure organisation des ventes et de faciliter l'accès aux informations en temps réel. 

C'est dans cette perspective que s'inscrit ce projet intitulé **« Conception et réalisation d'une application web de gestion de vente de produits agricoles »** . L'objectif principal est de concevoir et de développer une plateforme permettant aux vendeurs de publier leurs produits, aux clients de consulter les offres et de passer leurs commandes, tandis qu'un administrateur assure la gestion et le bon fonctionnement du système. 

Ce mémoire présente les différentes étapes de réalisation de cette application, depuis l'étude des besoins jusqu'à sa conception, son développement et sa mise en œuvre, en mettant en évidence les solutions apportées aux problèmes rencontrés dans la gestion des ventes de produits agricoles. 

1 

## **Cadre théorique** 

## **Chapitre 1 : Généralités** 

Dans ce chapitre, nous allons aborder le contexte général du projet, en décrivant le système actuel de gestion des ordures, ses limites, et les motivations ayant conduit à la mise en place d’une solution numérique. 

2 

### 1.1 Processus Actuel 

Au Mali, la gestion des produits agricoles est généralement réalisée de manière manuelle à l'aide de cahiers, registres papier ou simples feuilles de calcul. Les informations relatives aux stocks, aux achats, aux ventes et aux approvisionnements sont souvent enregistrées sans système centralisé. Cette méthode permet de conserver les données de base, mais elle présente plusieurs insuffisances. 

Parmi les principales limites observées, on peut citer : 

- La difficulté de suivre avec précision les quantités de produits disponibles ; 

- Les risques d'erreurs lors de l'enregistrement des données ; 

- La perte ou la détérioration des documents papier ; 

- La lenteur dans la recherche des informations ; 

- L'absence de statistiques fiables pour la prise de décision ; 

- Le manque de traçabilité des produits agricoles ; 

- Les difficultés à produire rapidement des rapports de gestion. 

Quelques structures utilisent des logiciels génériques tels que Microsoft Excel pour enregistrer certaines informations. Cependant, ces outils ne répondent pas toujours aux besoins spécifiques de la gestion agricole, notamment en matière de suivi des stocks, de gestion des ventes et de génération automatique de rapports. 

Face à ces insuffisances, la mise en place d'une application de gestion de produits agricoles apparaît comme une solution adaptée. Elle permettra d'automatiser les opérations de gestion, de sécuriser les données, d'améliorer le suivi des produits et de fournir des informations fiables pour une meilleure prise de décision 

### 1.2 Vers une Solution Numérique 

Pour répondre à cette problématique, nous proposons la **conception et la réalisation d'une application de gestion de produits agricoles** destinée à faciliter la commercialisation des produits agricoles au Mali. 

Cette application permettra de : 

- Ajouter, modifier et supprimer les produits agricoles. 

- Gérer les stocks en temps réel afin de connaître les quantités disponibles. 

- Permettre aux clients de consulter les produits, leurs prix et leurs disponibilités. 

- Enregistrer et suivre les commandes passées par les clients. 

- Générer un historique des ventes et des commandes. 

- Faciliter la communication entre les producteurs et les acheteurs. 

- Réduire les pertes de produits 

- Améliorer la visibilité des produits agricoles sur une plateforme numérique. 

3 

### **1.3 Conclusion** 

En somme, l’application de gestion de produits agricoles permet de rendre fluide le suivi des stocks et des ventes. Elle améliore l’organisation des activités agricoles, réduit les erreurs de gestions et aide les utilisateurs à prendre les bonnes décisions ; Cette solution contribue ainsi à rendre la gestion agricole plus pertinente, moderne et productive. 

## **Chapitre 2 : Présentation du sujet** 

Ce chapitre est consacré à la présentation globale du projet, en détaillant son origine, ses objectifs, sa justification, les résultats attendus ainsi que l’organisation prévue pour sa mise en œuvre. 

### 2.1 Contexte 

Au Mali, l'agriculture constitue l'un des principaux secteurs de l'économie et représente une source importante de revenus pour une grande partie de la population. Malgré son importance, la vente des produits agricoles reste confrontée à plusieurs difficultés, notamment la faible visibilité des produits, la gestion manuelle des stocks, le manque de suivi des ventes et les difficultés de mise en relation entre producteurs et acheteurs. Ces contraintes ralentissent les activités commerciales et entraînent parfois des pertes de produits et de revenus. 

### 2.2 Justification du Projet 

Face à ces difficultés, il apparaît nécessaire de mettre en place une solution informatique capable d'améliorer la gestion et la commercialisation des produits agricoles. C'est dans cette perspective que s'inscrit ce projet de **conception et réalisation d'une application de gestion de produits agricoles** . 

Cette application a pour objectif de faciliter la gestion des produits, des stocks et des commandes, tout en offrant une meilleure visibilité aux producteurs et un accès simplifié aux produits pour les acheteurs. Elle contribuera ainsi à moderniser les pratiques de commercialisation des produits agricoles au Mali et à améliorer l'efficacité des acteurs du secteur. 

### 2.3 Objectif général 

L’objectif général de ce projet est de concevoir et de mettre en œuvre une application de gestion des produits agricoles permettant d’optimiser le suivi, la gestion et la commercialisation des productions agricoles. Cette solution vise à moderniser les méthodes de gestion traditionnelles 

4 

en offrant une plateforme efficace, sécurisée et accessible pour les agriculteurs, les coopératives et les commerçants. 

L’application permettra d’améliorer la traçabilité des produits, la gestion des stocks, le suivi des ventes et des achats, ainsi que la prise de décision grâce à une centralisation fiable des informations agricoles. 

### 2.4 Objectif spécifique 

Ce projet a des but spécifique et précis dans le présent : 

- ❖ Assurer le suivi des stocks disponibles en temps. 

- ❖ Faciliter l’enregistrement des ventes et des achats de produits. 

- ❖ Permettre la consultation rapide des informations sur les produits. 

- ❖ Réduire les erreurs liées à la gestions manuelles des données. 

- ❖ Améliorer la communication entre producteurs, commerçants et gestionnaires. 

### 2.5 Cadre du projet 

Notre projet s'inscrit dans le domaine de l'informatique appliquée à la gestion et a pour objectif de moderniser la vente des produits agricoles grâce à une application web. 

Les principaux points sont les suivants : 

- Concevoir une application web de gestion de vente de produits agricoles. 

- Faciliter la mise en relation entre les vendeurs et les clients. 

- Permettre la gestion des produits, des commandes et des utilisateurs. 

- Améliorer l'organisation et le suivi des ventes de produits agricoles. 

- Mettre en pratique les connaissances acquises durant notre formation en développement d'applications web. 

### **2.6 Conclusion** 

Dans ce chapitre, nous avons présenté de manière détaillée notre projet, en commençant par le contexte et la justification de sa mise en œuvre. Nous avons défini la visions et objectifs, le cahier des charges fonctionnelles ainsi que le cadre du projet prévu pour son bon fonctionnement. 

5 

**Cadre pratique** 

6 

## **Chapitre 3 : Analyse et conception** 

Dans ce chapitre, nous allons analyser les besoins fonctionnels des utilisateurs de la plateforme, puis présenter les différents modèles conceptuels réalisés lors de la phase de conception (cas d’utilisation, diagramme de classes, diagrammes de séquence). 

### 3.1 Les besoins fonctionnels 

### **3.2. Diagrammes :** 

Un **diagramme** est une représentation graphique qui permet de décrire de manière simple et claire le fonctionnement d’un système, ses acteurs et les relations entre eux. Il sert à visualiser les informations au lieu de les écrire uniquement sous forme de texte. 

7 



<!-- Start of picture text -->
APPLICATION DE VENTE CE PRODUITS AGRICCLES Gta<br>categories<br>eeSoe _<br>< —— sesamiae ae —$——_ i>~<br>Client =e cg SS S<br>—— Payer ia aS *<br>commande Sos 7<br>Rencyge>> ral. .,<br>Confirmer la wines Se, “Ng<br>Venda Router des os gezentt™ en eas! gel poten ante<br>ral af a re<br>Categories y<br>g Gererles ~<br>Kamin av<br><!-- End of picture text -->



<!-- Start of picture text -->
| idUtilisateur<br>‘nom<br>| prenom:<br>\email<br>-motDepasse<br>(telephone<br>| S'nserire()<br>| Se Connecter(}<br>; Client|<br>‘ NomBoutique<br>ConsulterCategories()<br>VoirProduits()<br>AjouterProduit{) : PasserCommande()<br>idPanier =<br>ModifierProduit() = Panier | |<br>VoirCommande(} “CommandeCommande _|<br>datecreation idcommande<br>= oi ajouterProduit() datecCommande :<br>Produit supprimerproduit() — J<br>idProduit calculerTotal{}) statut<br>nomProduuit<br>Georgie “: ValiderCommande(}‘CalculerTotali)<br>prix<br>quantteStock 7<br>=Paiement|<br>inl. Kt) idPaiement idLivraison. Livraison<int<br>“|i datePaiement dateLivraison :date<br>i/ meontant statutLivraison: String<br>| modeFsiement<br>statutPaiement<br>|<br>a eTSclerPaiement{] —<br>= Categorie GonfirmerPaiement()<br>idCategoria<br>nomCategarie<br><!-- End of picture text -->



<!-- Start of picture text -->
; 7 - Verde<br>“PT SeConnece( ; : ;<br>CalculerTotal()<br> elecuePaiement)<br>» LivrerCommande() : : ‘ : :<br>: —— GonfirmerReception() —« : ‘ :<br><!-- End of picture text -->

% 



### 4.3 Présentation du système 

Le système proposé est une **application de gestion de produits agricoles** conçue pour faciliter la commercialisation et la gestion des produits agricoles au Mali. Il s'agit d'une plateforme permettant aux producteurs d'enregistrer leurs produits, de gérer leurs stocks et de suivre leurs ventes, tandis que les clients peuvent consulter les produits disponibles et effectuer des commandes. 

Le système est composé de plusieurs modules principaux : 

- **Gestion des utilisateurs** : administration des comptes des producteurs, des clients et de l'administrateur. 

- **Gestion des produits** : ajout, modification, suppression et consultation des produits agricoles. 

- **Gestion des stocks** : suivi des quantités disponibles afin d'éviter les ruptures ou les pertes. 

- **Gestion des commandes** : enregistrement et suivi des commandes effectuées par les clients. 

- **Tableau de bord** : affichage des principales informations sur les produits, les stocks et les ventes. 

Grâce à ce système, les producteurs disposent d'un outil simple pour mieux gérer leurs activités commerciales, tandis que les acheteurs peuvent accéder facilement aux produits agricoles disponibles. Cette solution contribue ainsi à rendre la commercialisation des produits agricoles plus rapide, plus efficace et plus organisée 

### 4.3.1 Technologies et outils utilisés 

La réalisation de la plateforme DUGU SUGU repose sur un stack technologique moderne assurant performance et réactivité 

### **_Outils de développement_** _:_ 

#### • **<u>Visual Studio Code</u>** 

Visual Studio Code est l’environnement de développement intégré (IDE) utilisé pour la réalisation du projet. Il est open-source, léger, et offre de nombreuses extensions utiles (Live Server, flutter, Dart). Il prend en charge la coloration syntaxique, l’autocomplétion, le débogage, et la gestion de version avec Git. 

12 



<!-- Start of picture text -->
<q<br><!-- End of picture text -->

<q 5) 



<!-- Start of picture text -->
5)<br><!-- End of picture text -->



<!-- Start of picture text -->
B<br><!-- End of picture text -->





<!-- Start of picture text -->
Or<br><!-- End of picture text -->







<!-- Start of picture text -->
Activite des utilisateurs dans le temps (%) ~<br>10 @ 30 JOURS<br>dim. Q7 juin 8<br>—@ 30jours 0 M@ 7 JouRS<br>—m 7 jours 0 E 6<br>=—@ 1 jour 0<br>@ 1 JouR<br>-<br>2<br>31 07 14 21 0<br>mal juin<br><!-- End of picture text -->



<!-- Start of picture text -->
Client<br>Acces Consommateur<br>Connectez-vous pour commander des produits frais, suivre<br>vos livraisons et gérer vos offres préférées.<br>Votre adresse email<br>Votre mot de passe sécurisé<br><!-- End of picture text -->



<!-- Start of picture text -->
Vendeur<br>Acces\ Producteur<br>Connectez-vous pour gérer vos produits, recevoir des<br>commandes et développer votre clientéle locale.<br>Votre adresse email professionnelle<br>Votre mot de passe sécurisé<br>Accéder a Ma Boutique<br>» Connexion Rapide<br><!-- End of picture text -->



<!-- Start of picture text -->
a<br>a<br>Produits frais DUGU-SUGIdu producteur au consommateur Producteurs AJOUTER UN PRODUIT :0<br>Vendeurs de Toutes 4 vendeur(s) trouvé(s)<br>P P I D<br>Pankoro abdoulaye diarra Pankoro Abdoulaye Diarra Ibrahim Traoré Daouda Touré<br>% Mopti % SOTUBA * GAO % Sénou<br>Magnambougou Capichap Marseille Koulouba<br>Spécialiste toutes Spécialiste toutes Spécialiste toutes Spécialiste toutes<br>5 produit(s) de Toutes 2 produit(s) de Toutes 2 produit(s) de Toutes 4 produit(s) de Toutes<br>Tomate500 FCFA / piéce Tomate1 000 FCFA / kg Ananas1 000 FCFA / piéce Riz600 FCFA / kg<br>Aubergine1 000 FCFA ® i ed 2 @ BS 1500 FCFA / kg<br>Accueil Panier Vendeurs Notifications Profil<br>Piment 550 FCFA / sa 01000 FCFA / ka =<br><!-- End of picture text -->



<!-- Start of picture text -->
Mon panier<br>1000 FCFA/ piéce 1000 FCFA<br>| Ananas<br>eS:<br>/ kg 600 FCFA<br>fo | Ge: 600Orange FCFA<br>Total: 1600 FCFA<br>Ps eo E so © 2<br>Accueil Panier Vendeurs Notifications Profil<br><!-- End of picture text -->

Rencontrez les artisans passionnés qui cultivent l'excellence 

##### agricole malienne 



<!-- Start of picture text -->
—<br>® oe i rN 2 &<br>Accueil Panier Vendeurs Notifications Profil FE<br><!-- End of picture text -->



<!-- Start of picture text -->
wita i n<br>Commande confirmée 25/06/2026<br>Votre commande #IlpXFCXV a été confirmée par le vendeur. Total 1300 FCFA.<br>Commande confirmée 25/06/2026<br>Votre commande #c23g92M0Oa été confirmée par le vendeur. Total 1250 FCFA.<br>Commande confirmée 19/06/2026<br>Votre commande #cUa8roZE a été confirmée par le vendeur. Total 1000 FCFA.<br>PN eo E 2 © 2<br>Accueil Panier Vendeurs Notifications Profil<br>ibt66293@gmail.com<br>Informations du compte<br>Type de compte Client<br>__ Statut Connecté<br>rN @ e rN 2<br>Accueil Panier Vendeurs Notifications Profil<br><!-- End of picture text -->

## **Conclusion générale et perspectives** 

Durant ce travail nous avons conçu et réalisé une application de gestion de produits agricoles, permettant d’améliorer l’organisation et le suivi des activités agricoles. Cette application intègre plusieurs fonctionnalités essentielles, notamment : 

- La gestion des produits agricoles ; 

- La gestion des stocks ; 

- Le suivi des entrées et sorties des produits ; 

- La consultation et la mise à jour des informations des 

produits Grâce à ces fonctionnalités, l’application facilité la 

gestion des produits agricoles, améliore la traçabilité des stocks et 

réduit les risques d’erreurs liés à la gestion manuelle. 

Elle constitue ainsi un outil efficace pour les producteurs, 

commerçants et gestionnaires du secteur agricole. 

Cette solution contribue à une meilleure organisation des activités 

agricoles et favorise une prise de décision plus rapide et plus 

fiable. 

#### ● **Perspectives :** 

Afin d'améliorer davantage l'application de gestion de produits agricoles dans les années à venir, plusieurs évolutions peuvent être envisagées : 

- **Intégration d'un système de prévision des stocks** permettant d'anticiper les ruptures et les surplus de produits agricoles. 

- **Mise en place d'un module d'analyse statistique avancée** pour suivre l'évolution des ventes, des récoltes et des bénéfices à travers des graphiques et tableaux de bord interactifs 

- **Créer une application mobile.** 

- **Ajout d'un système d'alertes automatiques** signalant les faibles niveaux de stock, les dates de péremption ou les besoins de réapprovisionnement. 

- **Utilisation de l'intelligence artificielle** pour aider à la prévision des rendements agricoles en fonction des données historiques et des conditions climatiques. 

- **Intégration d'un système de traçabilité complète** permettant de suivre le parcours d'un produit depuis sa récolte jusqu'à sa commercialisation. 

- **Mise en place d'un module de gestion financière** pour assurer le suivi des dépenses, des recettes, des bénéfices et des investissements agricoles. 

Ces perspectives permettront de transformer l'application en une plateforme agricole complète, moderne et performante, capable de répondre efficacement aux besoins futurs des acteurs du secteur agricole. 

i 

## **Bibliographie** 

### **Bibliographie** 

- UML, _Unified Modeling Language – Documentation et concepts de modélisation des systèmes logiciels_ . 

- React.JS, _Documentation officielle de React.JS – Développement d’interfaces utilisateur_ . 

- HTML, _Documentation officielle HTML – Structure des pages web_ . 

- CSS, _Documentation CSS – Mise en forme des pages web_ . 

## **Webographie** 

- <u>https://www.uml.org – Ressources et explications sur la modélisation UML.</u> 

- <u>https://react.dev – Documentation officielle de React.JS.</u> 

- <u>https://developer.mozilla.org/fr/docs/Web/HTML – Guide complet sur HTML.</u> 

- <u>https://developer.mozilla.org/fr/docs/Web/CSS – Documentation CSS.</u> 

- <u>https://www.drawio.com – Outil en ligne draw.io pour la création de diagrammes UML</u> et autres schémas. 

ii 

