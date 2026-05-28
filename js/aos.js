(function () {
  const AOS_ATTRIBUTE = "portfolio-fade";
  const MOBILE_QUERY = "(max-width: 768px)";
  const DESKTOP_QUERY = "(min-width: 769px)";
  const ARROW_SELECTOR = [
    ".hero__arrow",
    ".section__arrow",
    ".section__arrow_skills",
    ".myWork__arrow",
    ".contact__middleArrow",
    ".contact__backArrow",
    ".contact__footerArrow",
    ".legal__middleArrow",
    ".legal__backArrow",
  ].join(", ");

  let portfolioAOSObserver = null;
  let resizeAOSTimer = null;

  setupPortfolioAOSResizeRefresh();

  window.PortfolioAOS = {
    init: initPortfolioAOSAnimations,
    refresh: initPortfolioAOSAnimations,
  };

  /** Checks whether the user prefers reduced motion. */
  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /** Checks whether the viewport matches the mobile breakpoint. */
  function isMobileViewport() {
    return window.matchMedia(MOBILE_QUERY).matches;
  }

  /** Checks whether the viewport matches the desktop breakpoint. */
  function isDesktopViewport() {
    return window.matchMedia(DESKTOP_QUERY).matches;
  }

  /** Returns the main scroll container. */
  function getMainScroller() {
    return document.querySelector("main");
  }

  /** Returns a de-duplicated list of elements. */
  function uniqueElements(elements) {
    return [...new Set(elements)];
  }

  /** Checks whether an element is a navigation arrow. */
  function isNavigationArrow(element) {
    return element.matches(ARROW_SELECTOR);
  }

  /** Keeps navigation arrows visible outside AOS animations. */
  function keepNavigationArrowsVisible() {
    document.querySelectorAll(ARROW_SELECTOR).forEach(showArrow);
  }

  /** Resets and shows a navigation arrow. */
  function showArrow(arrow) {
    arrow.removeAttribute("data-aos");
    arrow.removeAttribute("data-aos-group-item");
    arrow.removeAttribute("data-aos-order");
    arrow.style.transitionDelay = "";
    arrow.classList.add("aos-init", "aos-animate");
  }

  /** Checks whether an element can be animated by AOS. */
  function isValidAOSItem(element) {
    if (!element) return false;
    if (isIgnoredAOSTag(element)) return false;
    if (element.hasAttribute("hidden")) return false;
    if (isNavigationArrow(element)) return false;

    return isVisibleElement(element);
  }

  /** Checks whether an element tag should be ignored by AOS. */
  function isIgnoredAOSTag(element) {
    return ["SCRIPT", "STYLE", "LINK", "META"].includes(element.tagName);
  }

  /** Checks whether an element is visible by computed styles. */
  function isVisibleElement(element) {
    const styles = window.getComputedStyle(element);

    return styles.display !== "none" && styles.visibility !== "hidden";
  }

  /** Returns valid direct child items for AOS. */
  function getDirectAOSItems(container) {
    return [...container.children].filter(isValidAOSItem);
  }

  /** Returns the best section child items to animate. */
  function getSectionAOSItems(container) {
    const directItems = getDirectAOSItems(container);
    if (directItems.length !== 1) return directItems;

    const innerItems = getDirectAOSItems(directItems[0]);
    return innerItems.length > 1 ? innerItems : directItems;
  }

  /** Returns all prepared AOS elements. */
  function getAOSElements() {
    keepNavigationArrowsVisible();

    return uniqueElements([
      ...getGroupedAOSElements(),
      ...getFooterAOSElements(),
      ...getStandaloneAOSElements(),
    ]);
  }

  /** Returns AOS elements from grouped containers. */
  function getGroupedAOSElements() {
    const containers = getAOSGroupContainers();
    const elements = [];

    containers.forEach((container) => {
      elements.push(...prepareAOSGroup(container));
    });

    return elements;
  }

  /** Returns containers configured for grouped AOS animations. */
  function getAOSGroupContainers() {
    return [
      ...document.querySelectorAll(
        `[data-aos-group="${AOS_ATTRIBUTE}"], section[data-aos="${AOS_ATTRIBUTE}"]`,
      ),
    ];
  }

  /** Prepares a container and its children for grouped AOS. */
  function prepareAOSGroup(container) {
    const items = getSectionAOSItems(container);

    if (!items.length) return [container];

    container.dataset.aosGroup = AOS_ATTRIBUTE;
    container.removeAttribute("data-aos");

    return items.map(prepareGroupedAOSItem);
  }

  /** Marks an item as part of a grouped AOS sequence. */
  function prepareGroupedAOSItem(item, index) {
    item.dataset.aos = AOS_ATTRIBUTE;
    item.dataset.aosGroupItem = "true";
    item.dataset.aosOrder = String(index);

    return item;
  }

  /** Returns footer elements prepared for AOS. */
  function getFooterAOSElements() {
    const selector = `footer[data-aos="${AOS_ATTRIBUTE}"]`;
    const footers = [...document.querySelectorAll(selector)];

    footers.forEach((footer) => {
      footer.dataset.aosOrder = "0";
    });

    return footers;
  }

  /** Returns standalone AOS elements outside groups. */
  function getStandaloneAOSElements() {
    const selector = `[data-aos="${AOS_ATTRIBUTE}"]:not([data-aos-group-item="true"])`;

    return [...document.querySelectorAll(selector)].filter(isStandaloneAOSItem);
  }

  /** Checks whether an element is a valid standalone AOS item. */
  function isStandaloneAOSItem(element) {
    return !element.matches("section") && isValidAOSItem(element);
  }

  /** Shows all provided AOS elements immediately. */
  function showAOSElements(elements) {
    elements.forEach(showAOSElement);
  }

  /** Shows one AOS element immediately. */
  function showAOSElement(element) {
    element.style.transitionDelay = "";
    element.classList.add("aos-init", "aos-animate");
  }

  /** Checks whether desktop horizontal AOS should be used. */
  function shouldUseDesktopHorizontalAOS(main) {
    if (!isDesktopViewport()) return false;
    if (!main) return false;

    return main.scrollWidth > main.clientWidth;
  }

  /** Returns the observer root for the current layout. */
  function getObserverRoot() {
    const main = getMainScroller();

    return shouldUseDesktopHorizontalAOS(main) ? main : null;
  }

  /** Returns the root bounds used for visibility checks. */
  function getRootRect(root) {
    if (root) return root.getBoundingClientRect();

    return getViewportRect();
  }

  /** Returns the current viewport rectangle. */
  function getViewportRect() {
    return {
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      left: 0,
    };
  }

  /** Checks whether an element overlaps the observer root. */
  function isElementInsideRoot(element, root) {
    const elementRect = element.getBoundingClientRect();
    const rootRect = getRootRect(root);

    return rectanglesOverlap(elementRect, rootRect);
  }

  /** Checks whether two rectangles overlap. */
  function rectanglesOverlap(elementRect, rootRect) {
    return (
      elementRect.bottom > rootRect.top &&
      elementRect.top < rootRect.bottom &&
      elementRect.right > rootRect.left &&
      elementRect.left < rootRect.right
    );
  }

  /** Marks elements already visible before observation starts. */
  function markInitiallyVisibleElements(elements, root) {
    elements.forEach((element) => {
      if (isElementInsideRoot(element, root)) showVisibleElement(element);
    });
  }

  /** Marks an element as animated. */
  function showVisibleElement(element) {
    element.classList.add("aos-animate");
  }

  /** Applies staggered transition delays to AOS elements. */
  function applyStaggeredAOSDelays(elements) {
    const settings = getStaggerSettings();

    elements.forEach((element) => {
      element.style.transitionDelay = getAOSDelay(element, settings);
    });
  }

  /** Returns stagger timing settings for the viewport. */
  function getStaggerSettings() {
    if (isMobileViewport()) return { step: 110, max: 440 };

    return { step: 140, max: 700 };
  }

  /** Returns the transition delay for an AOS element. */
  function getAOSDelay(element, settings) {
    const order = Number.parseInt(element.dataset.aosOrder || "0", 10);
    const delay = Math.min(order * settings.step, settings.max);

    return `${delay}ms`;
  }

  /** Disconnects the active portfolio AOS observer. */
  function disconnectPortfolioAOSObserver() {
    if (!portfolioAOSObserver) return;

    portfolioAOSObserver.disconnect();
    portfolioAOSObserver = null;
  }

  /** Returns IntersectionObserver options for the root. */
  function getAOSObserverOptions(root) {
    if (root) return getHorizontalObserverOptions(root);

    return getVerticalObserverOptions();
  }

  /** Returns observer options for horizontal scrolling. */
  function getHorizontalObserverOptions(root) {
    return {
      root,
      rootMargin: "0px -12% 0px -12%",
      threshold: 0.01,
    };
  }

  /** Returns observer options for vertical scrolling. */
  function getVerticalObserverOptions() {
    return {
      root: null,
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.01,
    };
  }

  /** Initializes observed AOS animations. */
  function initObservedAOS(elements, root) {
    if (!supportsIntersectionObserver()) {
      showAOSElements(elements);
      return;
    }

    prepareObservedAOSElements(elements, root);
    observeHiddenAOSElements(elements, root);
  }

  /** Checks whether IntersectionObserver is supported. */
  function supportsIntersectionObserver() {
    return "IntersectionObserver" in window;
  }

  /** Prepares elements before IntersectionObserver starts. */
  function prepareObservedAOSElements(elements, root) {
    elements.forEach(addAOSInitClass);
    markInitiallyVisibleElements(elements, root);
    document.body.classList.add("aos-ready");
  }

  /** Adds the AOS initialization class to an element. */
  function addAOSInitClass(element) {
    element.classList.add("aos-init");
  }

  /** Observes AOS elements that are not animated yet. */
  function observeHiddenAOSElements(elements, root) {
    createPortfolioAOSObserver(root);

    elements
      .filter(isNotAnimatedYet)
      .forEach((element) => portfolioAOSObserver.observe(element));
  }

  /** Creates the portfolio AOS IntersectionObserver. */
  function createPortfolioAOSObserver(root) {
    portfolioAOSObserver = new IntersectionObserver(
      handleAOSIntersection,
      getAOSObserverOptions(root),
    );
  }

  /** Handles IntersectionObserver entries for AOS elements. */
  function handleAOSIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) animateObservedElement(entry.target);
    });
  }

  /** Animates and unobserves an observed element. */
  function animateObservedElement(element) {
    element.classList.add("aos-animate");

    if (portfolioAOSObserver) {
      portfolioAOSObserver.unobserve(element);
    }
  }

  /** Checks whether an element has not animated yet. */
  function isNotAnimatedYet(element) {
    return !element.classList.contains("aos-animate");
  }

  /** Initializes portfolio AOS animations. */
  function initPortfolioAOSAnimations() {
    const elements = getAOSElements();
    if (!elements.length) return;

    disconnectPortfolioAOSObserver();

    if (prefersReducedMotion()) {
      showAOSElements(elements);
      return;
    }

    initAnimatedAOS(elements);
  }

  /** Initializes staggered, observed AOS animations. */
  function initAnimatedAOS(elements) {
    const root = getObserverRoot();

    applyStaggeredAOSDelays(elements);
    initObservedAOS(elements, root);
  }

  /** Sets up resize-based AOS refresh handling. */
  function setupPortfolioAOSResizeRefresh() {
    window.addEventListener("resize", scheduleAOSRefresh);
  }

  /** Debounces AOS refresh after a resize event. */
  function scheduleAOSRefresh() {
    window.clearTimeout(resizeAOSTimer);
    resizeAOSTimer = window.setTimeout(initPortfolioAOSAnimations, 250);
  }
})();