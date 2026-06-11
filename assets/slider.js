(() => {
  const activeClass = "is-active";
  const readyAttribute = "sliderReady";
  const sliderSelector = "[data-slider]";
  const slideSelector = "[data-slide]";
  const dotSelector = "[data-slider-dot]";

  /**
   * Retourne un index toujours compris dans les limites du slider.
   *
   * @param {number} index - Index demandé.
   * @param {number} total - Nombre total de slides.
   * @returns {number} Index normalisé.
   */
  const getSafeIndex = (index, total) => (index + total) % total;

  /**
   * Initialise un slider piloté par des boutons de pagination.
   *
   * @param {HTMLElement} slider - Élément racine du slider.
   * @returns {void}
   */
  const initSlider = (slider) => {
    if (slider.dataset[readyAttribute] === "true") return;

    const slides = Array.from(slider.querySelectorAll(slideSelector));
    const dots = Array.from(slider.querySelectorAll(dotSelector));
    const mediaQuery = slider.dataset.sliderMedia ? globalThis.matchMedia(slider.dataset.sliderMedia) : null;
    let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains(activeClass)));

    if (!slides.length) return;

    const isEnabled = () => !mediaQuery || mediaQuery.matches;

    /**
     * Synchronise la slide active, les bullets et les attributs d'accessibilité.
     *
     * @param {number} index - Index de la slide à afficher.
     * @returns {void}
     */
    const showSlide = (index) => {
      activeIndex = getSafeIndex(index, slides.length);

      slides.forEach((slide, slideIndex) => {
        const isActive = !isEnabled() || slideIndex === activeIndex;
        slide.classList.toggle(activeClass, isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });

      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === activeIndex;
        dot.classList.toggle(activeClass, isActive);
        dot.setAttribute("aria-current", String(isActive));
      });
    };

    /**
     * Permet de naviguer dans la pagination au clavier.
     *
     * @param {KeyboardEvent} event - Événement clavier du bouton de pagination.
     * @returns {void}
     */
    const handleDotKeydown = (event) => {
      const currentIndex = dots.indexOf(event.currentTarget);
      let nextIndex = currentIndex;

      if (event.key === "ArrowLeft") nextIndex = getSafeIndex(currentIndex - 1, dots.length);
      if (event.key === "ArrowRight") nextIndex = getSafeIndex(currentIndex + 1, dots.length);
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = dots.length - 1;

      if (nextIndex === currentIndex) return;

      event.preventDefault();
      dots[nextIndex].focus();
      showSlide(nextIndex);
    };

    dots.forEach((dot) => {
      dot.addEventListener("click", () => showSlide(Number(dot.dataset.sliderDot)));
      dot.addEventListener("keydown", handleDotKeydown);
    });

    // Recalcule l'affichage quand un slider n'est actif que sur certains breakpoints.
    mediaQuery?.addEventListener("change", () => showSlide(activeIndex));

    showSlide(activeIndex);
    slider.dataset[readyAttribute] = "true";
  };

  /**
   * Initialise tous les sliders présents dans un document ou une section Shopify.
   *
   * @param {ParentNode} root - Racine dans laquelle chercher les sliders.
   * @returns {void}
   */
  const initAllSliders = (root = document) => {
    if (root.matches?.(sliderSelector)) {
      initSlider(root);
    }

    root.querySelectorAll(sliderSelector).forEach(initSlider);
  };

  document.addEventListener("DOMContentLoaded", () => initAllSliders());
  document.addEventListener("shopify:section:load", (event) => initAllSliders(event.target));
})();
