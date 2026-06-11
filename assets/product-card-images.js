(() => {
    /**
     * Récupère les sources disponibles pour une carte produit.
     *
     * @param {HTMLElement} gallery - Conteneur image de la carte produit.
     * @returns {Array<{src: string, srcset?: string, sizes?: string, alt?: string}>} Images utilisables par la carte.
     */
    const getProductCardImages = (gallery) => {
        const productCard = gallery.closest(".product-card");
        const imageButtons = Array.from(productCard?.querySelectorAll("[data-product-card-image-src]") || []);

        if (imageButtons.length) {
            // Les boutons de taille portent les sources responsives calculées côté Liquid.
            return imageButtons.map((button) => ({
                src: button.dataset.productCardImageSrc,
                srcset: button.dataset.productCardImageSrcset,
                sizes: button.dataset.productCardImageSizes,
                alt: button.dataset.productCardImageAlt,
            }));
        }

        try {
            // Garde un fallback pour les cartes rendues avec l'ancien format de données.
            return JSON.parse(gallery.dataset.productCardImages || "[]");
        } catch (error) {
            console.warn("Impossible de lire les images de la carte produit.", error);
            return [];
        }
    };

    /**
     * Remplace l'image principale d'une carte produit.
     *
     * @param {HTMLImageElement} imageElement - Image principale à mettre à jour.
     * @param {{src?: string, srcset?: string, sizes?: string, alt?: string}|string} imageData - Nouvelle image.
     * @returns {void}
     */
    const updateProductCardImage = (imageElement, imageData) => {
        if (!imageData) return;

        // Synchronise les sources responsive pour éviter de garder l'ancien srcset.
        if (imageData.srcset) {
            imageElement.srcset = imageData.srcset;
        } else {
            imageElement.removeAttribute("srcset");
        }

        if (imageData.sizes) {
            imageElement.sizes = imageData.sizes;
        } else {
            imageElement.removeAttribute("sizes");
        }

        imageElement.src = imageData.src || imageData;
        imageElement.alt = imageData.alt || imageElement.alt;
    };

    /**
     * Active les chevrons desktop de la galerie image d'une carte produit.
     *
     * @param {HTMLElement} gallery - Galerie image de la carte produit.
     * @returns {void}
     */
    const initProductCardImageGallery = (gallery) => {
        if (gallery.dataset.productCardImagesReady === "true") return;

        const imageElement = gallery.querySelector(".product-card__image");
        const images = getProductCardImages(gallery);
        let activeIndex = 0;

        if (!imageElement || images.length <= 1) {
            gallery.dataset.productCardImagesReady = "true";
            return;
        }

        /**
         * Affiche l'image correspondant à l'index demandé.
         *
         * @param {number} index - Index de l'image à afficher.
         * @returns {void}
         */
        const showImage = (index) => {
            activeIndex = (index + images.length) % images.length;
            updateProductCardImage(imageElement, images[activeIndex]);
        };

        gallery.querySelector(".product-card__images-previous")?.addEventListener("click", () => showImage(activeIndex - 1));
        gallery.querySelector(".product-card__images-next")?.addEventListener("click", () => showImage(activeIndex + 1));

        gallery.dataset.productCardImagesReady = "true";
    };

    /**
     * Initialise le sélecteur de tailles mobile d'une carte produit.
     *
     * @param {HTMLElement} sizes - Bloc de tailles de la carte produit.
     * @returns {void}
     */
    const initProductCardSizes = (sizes) => {
        if (sizes.dataset.productCardSizesReady === "true") return;

        const productCard = sizes.closest(".product-card");
        const gallery = productCard?.querySelector(".product-card__images");
        const imageElement = gallery?.querySelector(".product-card__image");
        const images = gallery ? getProductCardImages(gallery) : [];
        const list = sizes.querySelector("[data-product-card-sizes-list]");
        const previousButton = sizes.querySelector("[data-product-card-sizes-previous]");
        const nextButton = sizes.querySelector("[data-product-card-sizes-next]");
        const scrollTolerance = 1;

        if (!list) {
            sizes.dataset.productCardSizesReady = "true";
            return;
        }

        // Ajuste les chevrons en fonction de la position réelle du scroll horizontal.
        const updateScrollState = () => {
            const maxScrollLeft = list.scrollWidth - list.clientWidth;
            const isScrollable = maxScrollLeft > scrollTolerance;
            const isAtStart = list.scrollLeft <= scrollTolerance;
            const isAtEnd = list.scrollLeft >= maxScrollLeft - scrollTolerance;

            sizes.classList.toggle("is-scrollable", isScrollable);
            sizes.classList.toggle("is-at-start", !isScrollable || isAtStart);
            sizes.classList.toggle("is-at-end", !isScrollable || isAtEnd);
        };

        /**
         * Fait défiler la liste mobile des tailles.
         *
         * @param {number} direction - Direction du scroll, `-1` à gauche et `1` à droite.
         * @returns {void}
         */
        const scrollSizes = (direction) => {
            list.scrollBy({
                left: direction * list.clientWidth * 0.8,
                behavior: "smooth",
            });
        };

        previousButton?.addEventListener("click", () => scrollSizes(-1));
        nextButton?.addEventListener("click", () => scrollSizes(1));
        list.addEventListener("scroll", updateScrollState, { passive: true });
        window.addEventListener("resize", updateScrollState);

        sizes.querySelectorAll("[data-product-card-size-index]").forEach((button) => {
            button.addEventListener("click", () => {
                const imageIndex = Number(button.dataset.productCardSizeIndex);

                if (imageElement && images[imageIndex]) {
                    updateProductCardImage(imageElement, images[imageIndex]);
                }
            });
        });

        requestAnimationFrame(updateScrollState);
        sizes.dataset.productCardSizesReady = "true";
    };

    /**
     * Initialise toutes les cartes produit dans une racine donnée.
     *
     * @param {ParentNode} root - Document ou section Shopify à scanner.
     * @returns {void}
     */
    const initProductCardImages = (root = document) => {
        root.querySelectorAll(".product-card__images").forEach(initProductCardImageGallery);
        root.querySelectorAll("[data-product-card-sizes]").forEach(initProductCardSizes);
    };

    initProductCardImages();
    document.addEventListener("shopify:section:load", (event) => initProductCardImages(event.target));
})();
