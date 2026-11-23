# Carryboo — thème Shopify sur mesure

> Thème Shopify développé from scratch en Liquid, CSS et JavaScript natif pour une boutique de couches écologiques : page d'accueil, page collection et fiche produit entièrement configurables depuis l'éditeur de thème.

![Shopify](https://img.shields.io/badge/Shopify-7AB55C?logo=shopify&logoColor=white)
![Liquid](https://img.shields.io/badge/Liquid-0B5394?logo=shopify&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![CSS](https://img.shields.io/badge/CSS-1572B6?logo=css3&logoColor=white)

**👉 Voir le site : [cyril-test-technique-gradiweb-ehgwgvux.myshopify.com](https://cyril-test-technique-gradiweb-ehgwgvux.myshopify.com/)**

**🔑 Mot de passe de la boutique :** `Graditest*`

## Sujet

Test technique réalisé en juin 2026 : intégrer les maquettes desktop et mobile d'une boutique (marque Carryboo) dans un thème Shopify, sans partir d'un thème existant, en rendant les contenus administrables par le marchand.

Les choix d'implémentation sont détaillés dans le **[compte rendu](COMPTE-RENDU.md)**.

## Fonctionnalités

**Page d'accueil**
- Slider hero multi-slides (image, titre, texte, bouton) avec pagination, en JavaScript natif
- Grille de produits sélectionnés depuis l'admin
- Bloc abonnement réutilisable sur plusieurs pages

**Page collection**
- Hero personnalisable par collection (image, sous-titre, lien) grâce aux metafields
- Grille de produits partagée avec la page d'accueil

**Fiche produit**
- Galerie média avec vignettes sur desktop et navigation adaptée au mobile
- Sélecteur de tailles basé sur les variantes, avec **calcul du prix par couche** en Liquid
- Changement de variante **sans rechargement** (Section Rendering API)
- **Ajout au panier en Ajax**
- Accordéons (composition, précautions, conseils) alimentés par des metafields

## Organisation du thème

```
templates/   index.json, collection.json, product.json : assemblage des pages
sections/    hero-slider, product-grid, subscription-banner, collection-hero, product-main, header, footer…
snippets/    product-card, accordion, pagination-bullets, icônes SVG
assets/      theme.css + un fichier CSS par section ; slider.js, product-gallery.js, variant-selector.js…
config/      réglages globaux du thème
layout/      theme.liquid
```

## Compétences acquises

- **Développement de thème Shopify** : templates JSON, sections avec `schema` et blocs, snippets réutilisables
- **Metafields** : définition d'une convention (namespace, clés, types) sur les collections, produits et variantes
- **Liquid** : objets `product`, `variant`, `media`, `collection`, calculs à partir des variantes et metafields
- **API Shopify côté front** : Ajax Cart API, Section Rendering API
- **JavaScript natif** sans dépendance, comportements découplés du HTML via des attributs `data-*`
- **Intégration responsive** fidèle aux maquettes, CSS découpé par composant

## Lancer le thème

Avec [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) et une boutique de développement :

```bash
shopify theme dev --store <votre-boutique>.myshopify.com
```

Les metafields listés dans le [compte rendu](COMPTE-RENDU.md#3-convention-metafields-adoptée) doivent être créés dans l'admin Shopify pour que tous les contenus s'affichent.
