(() => {
    /**
     * Initialise la galerie média de la fiche produit.
     *
     * @param {HTMLElement} gallery - Élément racine de la galerie produit.
     * @returns {void}
     */
    const initGallery = (gallery) => {
        if (gallery.dataset.galleryReady === "true") return;

        const items = Array.from(gallery.querySelectorAll("[data-gallery-media]"));
        const thumbs = Array.from(gallery.querySelectorAll("[data-gallery-thumb]"));
        const dots = Array.from(gallery.querySelectorAll("[data-slider-dot]"));
        const thumbsList = gallery.querySelector(".product-main__thumbnails");
        const imageScroller = gallery.querySelector("[data-gallery-track]");
        const previousButton = gallery.querySelector("[data-gallery-previous]");
        const nextButton = gallery.querySelector("[data-gallery-next]");
        const section = gallery.closest("[data-section-id]");
        const mobileGalleryQuery = globalThis.matchMedia("(max-width: 768px)");

        /**
         * Centre un média dans le rail horizontal mobile.
         *
         * @param {string|number} mediaId - Identifiant du média à afficher.
         * @param {ScrollBehavior} behavior - Type d'animation du scroll.
         * @returns {void}
         */
        const scrollMediaIntoView = (mediaId, behavior = "smooth") => {
            if (!mobileGalleryQuery.matches) return;

            const item = items.find((mediaItem) => mediaItem.dataset.mediaId === String(mediaId));
            item?.scrollIntoView({ block: "nearest", inline: "center", behavior });
        };

        /**
         * Synchronise l'image active avec les vignettes et les bullets.
         *
         * @param {string|number} mediaId - Identifiant du média à activer.
         * @param {{ scroll?: boolean, behavior?: ScrollBehavior }} options - Options de synchronisation.
         * @returns {void}
         */
        const showMedia = (mediaId, options = {}) => {
            if (!mediaId) return;

            items.forEach((item) => {
                const isActive = item.dataset.mediaId === String(mediaId);
                item.classList.toggle("is-active", isActive);
            });

            const activeIndex = items.findIndex((item) => item.dataset.mediaId === String(mediaId));

            dots.forEach((dot, index) => {
                const isActive = index === activeIndex;
                dot.classList.toggle("is-active", isActive);
                dot.setAttribute("aria-current", String(isActive));
            });

            thumbs.forEach((thumb) => {
                const isActive = thumb.dataset.galleryThumb === String(mediaId);
                thumb.classList.toggle("is-active", isActive);
                thumb.setAttribute("aria-current", String(isActive));

                if (isActive && !mobileGalleryQuery.matches) {
                    thumb.scrollIntoView({ block: "nearest", inline: "nearest" });
                }
            });

            if (options.scroll !== false) {
                scrollMediaIntoView(mediaId, options.behavior);
            }
        };

        /**
         * Déduit l'image active à partir du média le plus proche du centre en mobile.
         *
         * @returns {void}
         */
        const updateActiveFromScroll = () => {
            if (!mobileGalleryQuery.matches || !items.length) return;

            const imageBounds = imageScroller?.getBoundingClientRect();
            if (!imageBounds) return;

            const imageCenter = imageBounds.left + imageBounds.width / 2;
            const closestItem = items.reduce((closest, item) => {
                const itemBounds = item.getBoundingClientRect();
                const itemCenter = itemBounds.left + itemBounds.width / 2;
                const distance = Math.abs(imageCenter - itemCenter);

                return distance < closest.distance ? { item, distance } : closest;
            }, { item: items[0], distance: Number.POSITIVE_INFINITY }).item;

            showMedia(closestItem.dataset.mediaId, { scroll: false });
        };

        /**
         * Met à jour l'état des chevrons de vignettes selon le débordement vertical.
         *
         * @returns {void}
         */
        const updateControls = () => {
            if (!thumbsList) return;

            const scrollTolerance = 1;
            const maxScrollTop = thumbsList.scrollHeight - thumbsList.clientHeight;
            const hasOverflow = maxScrollTop > scrollTolerance;
            const isAtStart = thumbsList.scrollTop <= scrollTolerance;
            const isAtEnd = thumbsList.scrollTop >= maxScrollTop - scrollTolerance;

            gallery.classList.toggle("has-thumbnail-overflow", hasOverflow);
            gallery.classList.toggle("is-at-start", !hasOverflow || isAtStart);
            gallery.classList.toggle("is-at-end", !hasOverflow || isAtEnd);
        };

        /**
         * Fait défiler uniquement la colonne de vignettes desktop.
         *
         * @param {number} direction - Direction du scroll, `-1` vers le haut et `1` vers le bas.
         * @returns {void}
         */
        const scrollThumbnails = (direction) => {
            if (!thumbsList) return;

            const firstThumb = thumbs[0];
            const scrollOffset = firstThumb ? firstThumb.offsetHeight + 8 : 90;
            thumbsList.scrollBy({
                top: scrollOffset * direction,
                behavior: "smooth",
            });
        };

        // Les vignettes changent l'image active, sans faire défiler la page.
        thumbs.forEach((thumb) => {
            thumb.addEventListener("click", () => showMedia(thumb.dataset.galleryThumb));
        });

        // Les bullets mobiles utilisent le même état actif que les vignettes desktop.
        dots.forEach((dot) => {
            dot.addEventListener("click", () => {
                const item = items[Number(dot.dataset.sliderDot)];
                showMedia(item?.dataset.mediaId);
            });
        });

        previousButton?.addEventListener("click", () => scrollThumbnails(-1));
        nextButton?.addEventListener("click", () => scrollThumbnails(1));

        if (thumbsList) {
            if ("ResizeObserver" in globalThis) {
                const resizeObserver = new ResizeObserver(updateControls);
                resizeObserver.observe(thumbsList);
            }

            thumbsList.addEventListener("scroll", updateControls, { passive: true });
            globalThis.addEventListener("resize", updateControls);
            requestAnimationFrame(updateControls);
        }

        // En mobile, le scroll manuel du rail met à jour les bullets.
        imageScroller?.addEventListener("scroll", updateActiveFromScroll, { passive: true });

        section?.addEventListener("product:variant-change", (event) => {
            const mediaId = event.detail?.variant?.featured_media?.id || event.detail?.variant?.featured_image?.id;
            showMedia(mediaId);
        });

        const activeItem = items.find((item) => item.classList.contains("is-active"));
        requestAnimationFrame(() => showMedia(activeItem?.dataset.mediaId, { behavior: "auto" }));

        gallery.dataset.galleryReady = "true";
    };

    /**
     * Initialise toutes les galeries produit sous une racine donnée.
     *
     * @param {ParentNode} root - Document ou section Shopify à scanner.
     * @returns {void}
     */
    const initAll = (root = document) => {
        if (root.matches?.("[data-product-gallery]")) {
            initGallery(root);
        }

        root.querySelectorAll("[data-product-gallery]").forEach(initGallery);

        globalThis.productMain?.initCart?.(root);
        globalThis.productMain?.initVariants?.(root);
    };

    // Exposé pour réinitialiser la fiche produit après réinjection AJAX d'un variant.
    globalThis.productMain = globalThis.productMain || {};
    globalThis.productMain.init = initAll;

    document.addEventListener("DOMContentLoaded", () => initAll());
    document.addEventListener("shopify:section:load", (event) => initAll(event.target));
})();
