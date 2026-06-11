(() => {
    const header = document.querySelector("header");

    if (header) {
        /**
         * Ajoute l'état visuel du header une fois la page légèrement scrollée.
         *
         * @returns {void}
         */
        function handleScroll() {
            header.classList.toggle("header-down", window.scrollY > 10);
        }

        window.addEventListener("scroll", handleScroll);
        handleScroll();
    }

    document.addEventListener("click", (event) => {
        const toggle = event.target.closest("[data-menu-toggle]");
        if (!toggle) return;

        const header = toggle.closest("[data-site-header]");
        if (header) toggleMenu(header);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        document.querySelectorAll("[data-site-header]").forEach((header) => toggleMenu(header, false));
    });

    document.addEventListener("shopify:section:unload", () => {
        document.body.classList.remove("menu-open");
    });

    document.querySelectorAll(".subscription-banner__toggle").forEach((toggle) => {
        toggle.addEventListener("click", () => {
            const item = toggle.closest(".subscription-banner__arg");
            if (!item) return;

            // Les arguments d'abonnement restent fermés par défaut pour alléger la page.
            item.classList.toggle("is-open");
            toggle.textContent = item.classList.contains("is-open") ? "−" : "+";
        });
    });

    document.querySelectorAll(".accordion").forEach((accordion) => {
        accordion.querySelector(".accordion__summary")?.addEventListener("click", (event) => {
            if (!accordion.open) return;

            event.preventDefault();
            // L'attribut open reste présent le temps que l'animation de fermeture se termine.
            accordion.classList.add("is-closing");

            globalThis.setTimeout(() => {
                accordion.open = false;
                accordion.classList.remove("is-closing");
            }, 300);
        });
    });

    /**
     * Ajoute un variant Shopify au panier via l'API Ajax.
     *
     * @param {string} variantId - Identifiant Shopify du variant à ajouter.
     * @returns {Promise<object>} Réponse JSON de Shopify.
     */
    const addVariantToCart = async (variantId) => {
        const response = await fetch("/cart/add.js", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                items: [
                    {
                        id: Number(variantId),
                        quantity: 1,
                    },
                ],
            }),
        });

        if (!response.ok) {
            throw new Error("Impossible d'ajouter le produit au panier.");
        }

        return response.json();
    };

    /**
     * Bascule l'état de chargement du bouton d'ajout au panier.
     *
     * @param {HTMLButtonElement} button - Bouton d'ajout au panier.
     * @param {boolean} isLoading - Indique si une requête panier est en cours.
     * @returns {void}
     */
    const setAddToCartLoading = (button, isLoading) => {
        button.disabled = isLoading;
        button.classList.toggle("is-loading", isLoading);
        button.setAttribute("aria-busy", String(isLoading));
    };

    /**
     * Gère le clic sur un bouton d'ajout au panier.
     *
     * @param {HTMLButtonElement} button - Bouton cliqué.
     * @returns {Promise<void>}
     */
    const handleAddToCartClick = async (button) => {
        const variantId = button.dataset.variantId;

        if (!variantId || button.classList.contains("is-loading")) return;

        setAddToCartLoading(button, true);

        try {
            // Le panier est mis à jour sans rechargement pour conserver la fluidité de la fiche produit.
            await addVariantToCart(variantId);
        } catch (error) {
            console.warn("L'ajout au panier AJAX a échoué.", error);
        } finally {
            setAddToCartLoading(button, false);
        }
    };

    /**
     * Initialise les boutons panier d'une section Shopify.
     *
     * @param {HTMLElement} section - Section contenant potentiellement un bouton panier.
     * @returns {void}
     */
    const initAddToCartSection = (section) => {
        if (section.dataset.addToCartReady === "true") return;

        section.querySelectorAll("[data-add-to-cart]").forEach((button) => {
            button.addEventListener("click", () => handleAddToCartClick(button));
        });

        section.dataset.addToCartReady = "true";
    };

    /**
     * Initialise tous les boutons panier dans une racine donnée.
     *
     * @param {ParentNode} root - Document ou section Shopify à scanner.
     * @returns {void}
     */
    const initAddToCartButtons = (root = document) => {
        if (root.matches?.("[data-section-id]")) {
            initAddToCartSection(root);
        }

        root.querySelectorAll("[data-section-id]").forEach(initAddToCartSection);
    };

    // Utilisé par le remplacement AJAX de variant pour réattacher le panier à la nouvelle section.
    globalThis.productMain = globalThis.productMain || {};
    globalThis.productMain.initCart = initAddToCartButtons;

    initAddToCartButtons();
    document.addEventListener("shopify:section:load", (event) => initAddToCartButtons(event.target));
})();
