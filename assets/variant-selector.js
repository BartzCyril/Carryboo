(() => {
    /**
     * Extrait la section produit depuis une réponse HTML Shopify.
     *
     * @param {string} html - Le HTML retourné par l'URL de variant avec `section_id`.
     * @returns {HTMLElement|null} La prochaine section produit à injecter dans la page.
     */
    const getSectionFromResponse = (html) => {
        const parsedHtml = new DOMParser().parseFromString(html, "text/html");
        return parsedHtml.querySelector(".product-main");
    };

    /**
     * Récupère uniquement le HTML de la section produit pour le variant demandé.
     *
     * @param {HTMLElement} section - La section produit actuellement affichée.
     * @param {string} variantUrl - L'URL du variant sélectionné.
     * @returns {Promise<HTMLElement|null>} La section produit mise à jour.
     */
    const fetchVariantSection = async (section, variantUrl) => {
        const sectionId = section.dataset.sectionId;
        const url = new URL(variantUrl, globalThis.location.origin);
        url.searchParams.set("section_id", sectionId);

        const response = await fetch(url.toString(), {
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
        });

        if (!response.ok) {
            throw new Error("Impossible de charger la section produit.");
        }

        return getSectionFromResponse(await response.text());
    };

    /**
     * Active les liens de variants sans rechargement complet de la page.
     *
     * @param {HTMLElement} section - La section produit à initialiser.
     * @returns {void}
     */
    const initVariantLinks = (section) => {
        if (section.dataset.variantLinksReady === "true") return;

        section.querySelectorAll("[data-product-variant-link]").forEach((link) => {
            link.addEventListener("click", async (event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

                event.preventDefault();

                if (link.classList.contains("is-active")) return;

                const variantUrl = link.href;
                section.setAttribute("aria-busy", "true");
                section.classList.add("is-loading");

                try {
                    // Shopify renvoie seulement la section demandée, ce qui évite un rechargement complet.
                    const nextSection = await fetchVariantSection(section, variantUrl);

                    if (!nextSection) {
                        throw new Error("La section produit est introuvable dans la réponse.");
                    }

                    section.replaceWith(nextSection);
                    globalThis.history.pushState({}, "", variantUrl);

                    // La nouvelle section remplace le DOM, il faut donc réattacher les comportements JS.
                    globalThis.productMain?.init?.(nextSection);
                } catch (error) {
                    console.warn("Le chargement dynamique du variant a échoué.", error);
                    globalThis.location.href = variantUrl;
                } finally {
                    section.removeAttribute("aria-busy");
                    section.classList.remove("is-loading");
                }
            });
        });

        section.dataset.variantLinksReady = "true";
    };

    /**
     * Active les flèches de défilement horizontal du sélecteur de tailles mobile.
     *
     * @param {HTMLElement} section - Section produit à initialiser.
     * @returns {void}
     */
    const initSizeScroller = (section) => {
        if (section.dataset.sizeScrollerReady === "true") return;

        const list = section.querySelector("[data-product-size-list]");
        if (!list) return;

        const buttons = section.querySelectorAll("[data-product-size-scroll]");

        /**
         * Affiche les flèches seulement lorsqu'il reste du contenu à faire défiler.
         *
         * @returns {void}
         */
        const updateScrollButtons = () => {
            const maxScrollLeft = list.scrollWidth - list.clientWidth;
            const hasOverflow = maxScrollLeft > 1;
            const isAtStart = list.scrollLeft <= 1;
            const isAtEnd = list.scrollLeft >= maxScrollLeft - 1;

            buttons.forEach((button) => {
                const isPrevious = button.dataset.productSizeScroll === "previous";
                button.classList.toggle("is-hidden", !hasOverflow || (isPrevious ? isAtStart : isAtEnd));
            });
        };

        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                const direction = button.dataset.productSizeScroll === "previous" ? -1 : 1;

                // La distance suit la largeur visible pour garder un déplacement naturel sur mobile.
                list.scrollBy({
                    left: direction * list.clientWidth * 0.75,
                    behavior: "smooth",
                });
            });
        });

        list.addEventListener("scroll", updateScrollButtons);
        globalThis.addEventListener("resize", updateScrollButtons);
        updateScrollButtons();

        section.dataset.sizeScrollerReady = "true";
    };

    const initAll = (root = document) => {
        if (root.matches?.("[data-section-id]")) {
            initVariantLinks(root);
            initSizeScroller(root);
        }

        root.querySelectorAll("[data-section-id]").forEach((section) => {
            initVariantLinks(section);
            initSizeScroller(section);
        });
    };

    globalThis.productMain = globalThis.productMain || {};
    globalThis.productMain.initVariants = initAll;

    document.addEventListener("DOMContentLoaded", () => initAll());
    document.addEventListener("shopify:section:load", (event) => initAll(event.target));
})();
