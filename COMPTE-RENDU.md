# Compte Rendu

## Store URL

[https://cyril-test-technique-gradiweb-ehgwgvux.myshopify.com/](https://cyril-test-technique-gradiweb-ehgwgvux.myshopify.com/)

## 1. Résumé de l'approche

### Homepage

- Pour construire la homepage, j'ai découpé la page en sections Shopify configurables afin que les contenus puissent être modifiés depuis le customizer.
- Pour le hero, j'ai utilisé des blocs de section afin de permettre l'ajout de plusieurs slides, chacune avec son image, son titre, son texte et son CTA.
- Pour la navigation du slider, j'ai créé un système de bullets réutilisable et une logique JavaScript dédiée, sans dépendance externe.
- Pour la grille produits, j'ai utilisé des settings de type `product` afin de sélectionner les produits depuis l'admin Shopify.
- J'ai isolé le rendu d'une carte produit dans un snippet pour pouvoir le réutiliser sur la homepage et la page collection.
- Pour le bloc abonnement, j'ai créé une section indépendante afin de pouvoir l'insérer sur plusieurs templates sans dupliquer le code.

### Page collection

- Pour la page collection, j'ai utilisé les données natives de Shopify pour récupérer le titre et les produits de la collection.
- Pour les contenus spécifiques au hero, comme l'image de fond, le sous-titre et le lien, j'ai ajouté des metafields sur la ressource Collection.
- Cette approche permet de personnaliser chaque collection depuis l'admin sans créer plusieurs templates.
- Pour l'affichage des produits, j'ai réutilisé le snippet de carte produit déjà utilisé sur la homepage.
- J'ai ensuite assemblé la page via le template JSON avec le hero, la grille produits et le bloc abonnement.
- Le responsive a été géré dans les fichiers CSS de chaque section afin d'adapter la mise en page aux maquettes mobile.

### Fiche produit

- Pour la fiche produit, j'ai utilisé les objets natifs `product`, `variant` et `media` afin de construire la galerie, les informations produit et le choix des tailles.
- Pour la galerie, j'ai affiché les médias du produit avec des vignettes sur desktop et une navigation plus adaptée sur mobile.
- Pour le sélecteur de tailles, j'ai parcouru les variantes du produit et utilisé un metafield de variante pour afficher le nombre de couches.
- Le prix par couche est calculé directement en Liquid à partir du prix de la variante et du metafield `unit_count`.
- Pour éviter un rechargement complet lors du changement de variante, j'ai récupéré la section produit à jour en JavaScript puis remplacé le bloc dans la page.
- Pour l'ajout au panier, j'ai utilisé l'API Ajax Shopify afin d'ajouter la variante sélectionnée sans recharger la page.
- Pour les contenus complémentaires, j'ai utilisé des metafields produit affichés dans un snippet d'accordéon réutilisable.

## 2. Choix techniques

### Structure du thème

Le thème suit la structure standard Shopify : les templates JSON assemblent les pages, les sections portent les blocs configurables, les snippets regroupent les composants réutilisables, et les assets contiennent les styles et scripts associés.

### Découpage sections / snippets

Les sections ont été découpées selon les blocs fonctionnels des maquettes et du sujet : slider de homepage, grille produits, bloc abonnement réutilisable, hero de collection et contenu principal de fiche produit. Chaque section configurable expose uniquement les paramètres nécessaires dans son schema Shopify, afin de garder le customizer clair et adapté à l'usage attendu.

Les snippets sont utilisés pour les éléments qui reviennent à plusieurs endroits. La carte produit est isolée dans `product-card.liquid` pour être partagée entre la homepage et la page collection. Les accordéons sont centralisés dans `accordion.liquid` pour éviter de répéter la structure `details` / `summary` sur la fiche produit. Le snippet `pagination-bullets.liquid` permet aussi de réutiliser une même logique visuelle pour les paginations.

Ce découpage évite la duplication, facilite les ajustements visuels et permet de modifier un composant partagé sans devoir reprendre chaque page séparément.

### Gestion du CSS

Le CSS est séparé entre un fichier global et des fichiers spécifiques aux sections ou snippets. `theme.css` contient les variables de couleurs, typographies, largeurs, espacements, styles de boutons et règles communes. Les fichiers comme `section-product-main.css`, `section-product-grid.css` ou `snippet-product-card.css` ne contiennent que les styles liés à leur composant.

### Approche JavaScript

J'ai séparé les comportements par responsabilité : `slider.js` pour le hero slider, `product-card-images.js` pour les images des cartes produit, `product-gallery.js` pour la galerie produit, `variant-selector.js` pour le choix des variantes et `theme.js` pour les comportements globaux.

Les interactions entre Liquid et JavaScript passent principalement par des attributs `data-*`.

## 3. Convention metafields adoptée

| Ressource  | Namespace | Key                   | Type               | Usage                                           | Justification                                                                                    |
| ---------- | --------- | --------------------- | ------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Collection | `custom`  | `hero_image`          | `file_reference`   | Image hero de la page collection                | Ce type permet de récupérer directement un objet média exploitable en Liquid.                    |
| Collection | `custom`  | `hero_subtitle`       | `single_line_text` | Sous-titre du hero                              | Un texte court suffit pour accompagner le titre natif de la collection.                          |
| Collection | `custom`  | `hero_link_url`       | `url`              | URL du lien "Voir plus"                         | Le type URL sécurise la saisie du lien depuis l'admin Shopify.                                   |
| Collection | `custom`  | `hero_link_label`     | `single_line_text` | Texte du lien "Voir plus"                       | Le type `single_line_text` est adapté à un libellé court de CTA.                                 |
| Produit    | `custom`  | `rating_score`        | `number_decimal`   | Note affichée sur la fiche produit              | Le nombre décimal permet d'afficher une note statique précise.                                   |
| Produit    | `custom`  | `rating_count`        | `number_integer`   | Nombre d'avis affiché                           | Un entier correspond au format attendu pour un compteur d'avis.                                  |
| Produit    | `custom`  | `composition`         | `rich_text_field`  | Contenu accordéon Composition clean             | Le texte enrichi permet de structurer le contenu avec paragraphes, listes ou emphases.           |
| Produit    | `custom`  | `precaution`          | `rich_text_field`  | Contenu accordéon Précaution d'emploi           | Le texte enrichi est plus adapté aux consignes pouvant contenir plusieurs niveaux d'information. |
| Produit    | `custom`  | `conseil_utilisation` | `rich_text_field`  | Contenu accordéon Conseil d'utilisation         | Le texte enrichi permet de présenter les conseils de manière lisible dans l'accordéon.           |
| Variante   | `custom`  | `unit_count`          | `number_integer`   | Quantité (ex. 240 couches) + calcul prix/couche | Le type `number_integer` garantit une valeur exploitable pour le calcul du prix par couche.      |

## 4. Difficultés rencontrées

Je n'ai pas rencontré de difficulté majeure sur la partie Shopify. J'avais déjà travaillé sur des thèmes Shopify, donc je connaissais la structure générale d'un thème, le fonctionnement des sections, des snippets, des templates JSON et des assets.

Les principales difficultés ont plutôt été liées à l'intégration CSS. Cela faisait un moment que je n'avais pas intégré une maquette complète, j'ai donc dû me remettre à jour sur certains réflexes d'intégration responsive, d'alignement et de gestion des espacements. Cette remise à niveau a surtout demandé quelques ajustements au départ, puis les réflexes sont revenus progressivement au fil de l'intégration.

## 5. Ce que j'aurais amélioré

Sur la fiche produit, j'aurais enrichi l'expérience d'ajout au panier. Aujourd'hui, l'ajout AJAX évite le rechargement de page et affiche un loader, mais on pourrait aller plus loin avec un message de succès, une mise à jour visible du compteur panier ou l'ouverture automatique d'un mini-panier.

J'aurais également pris plus de temps pour renforcer l'accessibilité : améliorer les états `aria-expanded` sur les blocs accordéon mobiles, vérifier tous les focus clavier, ajouter des styles de focus plus visibles et tester les interactions au lecteur d'écran.

Enfin, j'aurais fait une passe de QA plus complète sur plusieurs tailles d'écran et plusieurs jeux de données Shopify : produits avec beaucoup de médias, variantes nombreuses, metafields vides, textes longs ou images absentes.

## 6. Journal d'usage de l'IA

### 1. Schéma de configuration de la grille produit

Outil : Composer via Cursor

Tâche : générer le schéma Shopify de la section `product-grid` avec un titre, un sous-titre, un texte d'accroche, quatre produits sélectionnables et un CTA, sans ajouter de HTML ni de CSS.

Output : schéma fonctionnel pour `sections/product-grid.liquid`, limité au bloc `{% schema %}` avec les settings demandés.

Valeur : environ 15 minutes économisées sur la syntaxe du schéma.

### 2. Hero slider accessible

Outil : Composer via Cursor

Tâche : rendre le hero slider pilotable en JavaScript avec des bullets cliquables, des transitions fluides, des attributs ARIA.

Output : Output : implémentation du slider avec la structure de la section Shopify, le snippet `pagination-bullets`, les styles de transition et une nouvelle logique dans `assets/slider.js`.

Valeur : environ 45 minutes économisées sur la structuration du carousel, l'accessibilité et la synchronisation JS/bullets.

### 3. Bloc tailles et variantes sur la fiche produit

Outil : Composer via Cursor

Tâche : ajouter un bloc de tailles/variantes sur la fiche produit, avec une carte par variante, le prix par couche et le nombre de couches venant du metafield de la variante.

Output : proposition de structure dans `sections/product-main.liquid` et de styles dédiés dans `assets/section-product-main.css`.

Delta : j'ai adapté le style pour rester cohérent avec la maquette.

Valeur : environ 30 minutes économisées sur l'ajout du bloc tailles/variantes.

### 4. Ajout de bullets mobiles sur la galerie produit

Outil : Composer via Cursor

Tâche : remplacer les vignettes verticales par des bullets sur mobile, placés au centre de l'image produit à 13px du bas, tout en gardant les vignettes sur desktop.

Output : rendu du snippet `pagination-bullets` dans la galerie produit, synchronisation des bullets dans `product-gallery.js` et styles mobiles associés.

Valeur : environ 25 minutes économisées sur la logique responsive et la synchronisation entre miniature, image active et bullet actif.

### 5. Galerie produit mobile en scroll horizontal

Outil : Composer via Cursor

Tâche : transformer la galerie produit mobile en carousel horizontal scrollable et un aperçu des images voisines.

Output : adaptation de la structure produit pour ne plus masquer les médias via `hidden`, CSS mobile en `scroll-snap` et mise à jour de `product-gallery.js` pour synchroniser le scroll avec l'image active.

Delta : j'ai séparé le comportement desktop et mobile en CSS.

Valeur : environ 35 minutes économisées sur la mise en place du scroll-snap.

### 6. Ajout au panier AJAX

Outil : Composer via Cursor

Tâche : implémenter l'ajout au panier AJAX depuis la fiche produit sans rechargement de page, avec un loader sur le bouton pendant la requête.

Output : bouton enrichi avec un libellé et un loader, appel `POST /cart/add.js`, et styles d'état loading dans le CSS de la fiche produit.

Valeur : environ 20 minutes économisées sur l'appel Ajax Shopify et la gestion d'état du bouton.

### 7. Optimisation LCP des images

Outil : Composer via Cursor

Tâche : optimiser le LCP des images sur la page d’accueil, les pages collection et les fiches produit en rendant les images prioritaires, responsives et facilement détectables par le navigateur.

Output : recommandations de mise en œuvre pour convertir les images prioritaires en balises Liquid, ajout de `loading`, `fetchpriority`, `preload`, `widths` et `sizes` selon le contexte.

Valeur : environ 50 minutes économisées sur l'analyse LCP, les attributs d'images Shopify et la vérification des effets de bord CSS.
