const mobileToggle = document.querySelector(".mobileBar__toggle");
const mobileMenu = document.querySelector("#mobileMenu");
const mobileMenuLinks = document.querySelectorAll(".mobileMenu__link");

const MOBILE_BREAKPOINT = 768;
const WHEEL_SCROLL_SPEED = 8;

let restoreMainSnapTimer = null;

/**
 * Checks if the mobile menu is open.
 * @returns {boolean}
 */
function isMenuOpen() {
  return document.body.classList.contains("menu-open");
}

/**
 * Sets the mobile menu state.
 * @param {boolean} open
 * @returns {void}
 */
function setMenuState(open) {
  document.body.classList.toggle("menu-open", open);

  if (mobileToggle) {
    mobileToggle.setAttribute("aria-expanded", String(open));
  }
}

/**
 * Closes the mobile menu.
 * @returns {void}
 */
function closeMenu() {
  setMenuState(false);
}

/**
 * Toggles the mobile menu.
 * @returns {void}
 */
function toggleMenu() {
  setMenuState(!isMenuOpen());
}

/**
 * Handles the mobile toggle click.
 * @param {MouseEvent} event
 * @returns {void}
 */
function handleToggleClick(event) {
  event.stopPropagation();
  toggleMenu();
}

/**
 * Handles clicks outside the menu.
 * @param {MouseEvent} event
 * @returns {void}
 */
function handleOutsideClick(event) {
  if (!shouldCloseMenuFromClick(event)) return;

  closeMenu();
}

/**
 * Checks if an outside click should close the menu.
 * @param {MouseEvent} event
 * @returns {boolean}
 */
function shouldCloseMenuFromClick(event) {
  if (!isMenuOpen()) return false;
  if (mobileMenu && mobileMenu.contains(event.target)) return false;
  if (mobileToggle && mobileToggle.contains(event.target)) return false;

  return true;
}

/**
 * Handles Escape key menu closing.
 * @param {KeyboardEvent} event
 * @returns {void}
 */
function handleEscapeKey(event) {
  if (event.key === "Escape") {
    closeMenu();
  }
}

/**
 * Initializes mobile menu behavior.
 * @returns {void}
 */
function initMobileMenu() {
  if (!mobileToggle || !mobileMenu) return;

  mobileToggle.addEventListener("click", handleToggleClick);
  mobileMenuLinks.forEach(bindMobileMenuLink);
  document.addEventListener("click", handleOutsideClick);
  document.addEventListener("keydown", handleEscapeKey);
}

/**
 * Binds one mobile menu link.
 * @param {Element} link
 * @returns {void}
 */
function bindMobileMenuLink(link) {
  link.addEventListener("click", closeMenu);
}

/**
 * Initializes desktop wheel scrolling.
 * @returns {void}
 */
function initDesktopWheelScroll() {
  const main = getMainScroller();
  if (!main) return;

  window.addEventListener("wheel", handleDesktopWheel, { passive: false });
}

/**
 * Handles desktop wheel scrolling.
 * @param {WheelEvent} event
 * @returns {void}
 */
function handleDesktopWheel(event) {
  const main = getMainScroller();
  if (shouldIgnoreDesktopWheel(event, main)) return;

  const delta = getWheelDelta(event);
  if (!delta) return;

  event.preventDefault();
  scrollMainByWheel(main, delta);
}

/**
 * Checks if wheel scrolling should be ignored.
 * @param {WheelEvent} event
 * @param {Element|null} main
 * @returns {boolean}
 */
function shouldIgnoreDesktopWheel(event, main) {
  if (isMobileViewport()) return true;
  if (event.ctrlKey || event.metaKey) return true;
  if (!main) return true;

  return main.scrollWidth <= main.clientWidth;
}

/**
 * Gets the dominant wheel delta.
 * @param {WheelEvent} event
 * @returns {number}
 */
function getWheelDelta(event) {
  return Math.abs(event.deltaX) > Math.abs(event.deltaY)
    ? event.deltaX
    : event.deltaY;
}

/**
 * Scrolls the main container horizontally.
 * @param {Element} main
 * @param {number} delta
 * @returns {void}
 */
function scrollMainByWheel(main, delta) {
  main.scrollBy({
    left: delta * WHEEL_SCROLL_SPEED,
    top: 0,
    behavior: "auto",
  });
}

/**
 * Initializes work card toggles.
 * @returns {void}
 */
function initWorkCardToggles() {
  document.querySelectorAll(".workCard__toggle").forEach(bindWorkCardToggle);
}

/**
 * Binds one work card toggle.
 * @param {HTMLButtonElement} button
 * @returns {void}
 */
function bindWorkCardToggle(button) {
  button.addEventListener("click", () => {
    toggleWorkCard(button);
  });
}

/**
 * Toggles one work card.
 * @param {HTMLButtonElement} button
 * @returns {void}
 */
function toggleWorkCard(button) {
  const card = button.closest(".workCard");
  if (!card) return;

  const isOpen = card.classList.toggle("workCard--open");
  updateWorkCardToggle(button, isOpen);
}

/**
 * Updates a work card toggle button.
 * @param {HTMLButtonElement} button
 * @param {boolean} isOpen
 * @returns {void}
 */
function updateWorkCardToggle(button, isOpen) {
  button.setAttribute("aria-expanded", String(isOpen));
  button.innerHTML = getWorkCardToggleMarkup(isOpen);
}

/**
 * Gets work card toggle markup.
 * @param {boolean} isOpen
 * @returns {string}
 */
function getWorkCardToggleMarkup(isOpen) {
  return isOpen
    ? 'Show less <span class="workCard__toggleIcon" aria-hidden="true">▼</span>'
    : 'Show me more <span class="workCard__toggleIcon" aria-hidden="true">▼</span>';
}

/**
 * Initializes the mobile contact carousel.
 * @returns {void}
 */
function setupMobileContactCarousel() {
  const state = getMobileCarouselState();
  if (!isValidCarouselState(state)) return;

  bindCarouselButtonEvents(state);
  bindCarouselScrollEvents(state);
  setActiveCarouselButton(state, 0);
}

/**
 * Gets mobile carousel state.
 * @returns {object}
 */
function getMobileCarouselState() {
  const carousel = document.querySelector(".contactMobile__track");

  return {
    carousel,
    slides: carousel ? [...carousel.querySelectorAll(".contactMobile__card")] : [],
    buttons: [...document.querySelectorAll(".contactMobile__dot")],
  };
}

/**
 * Checks if carousel state is usable.
 * @param {object} state
 * @returns {boolean}
 */
function isValidCarouselState(state) {
  if (!state.carousel) return false;
  if (!state.slides.length) return false;

  return state.slides.length === state.buttons.length;
}

/**
 * Sets the active carousel button.
 * @param {object} state
 * @param {number} activeIndex
 * @returns {void}
 */
function setActiveCarouselButton(state, activeIndex) {
  state.buttons.forEach((button, index) => {
    updateCarouselButton(button, index === activeIndex);
  });
}

/**
 * Updates one carousel button.
 * @param {HTMLButtonElement} button
 * @param {boolean} isActive
 * @returns {void}
 */
function updateCarouselButton(button, isActive) {
  button.classList.toggle("contactMobile__dot--active", isActive);
  button.setAttribute("aria-current", isActive ? "true" : "false");
}

/**
 * Gets the slide step width.
 * @param {object} state
 * @returns {number}
 */
function getSlideStep(state) {
  if (state.slides.length === 1) {
    return state.slides[0].getBoundingClientRect().width;
  }

  return getDistanceBetweenFirstSlides(state.slides);
}

/**
 * Gets distance between first two slides.
 * @param {Element[]} slides
 * @returns {number}
 */
function getDistanceBetweenFirstSlides(slides) {
  const first = slides[0].getBoundingClientRect();
  const second = slides[1].getBoundingClientRect();

  return second.left - first.left;
}

/**
 * Gets the active slide index.
 * @param {object} state
 * @returns {number}
 */
function getActiveSlideIndex(state) {
  const step = getSlideStep(state);
  if (!step) return 0;

  const index = Math.round(state.carousel.scrollLeft / step);

  return clamp(index, 0, state.slides.length - 1);
}

/**
 * Scrolls to a carousel slide.
 * @param {object} state
 * @param {number} index
 * @returns {void}
 */
function scrollToSlide(state, index) {
  const slide = state.slides[index];
  if (!slide) return;

  scrollSlideIntoView(slide);
  setActiveCarouselButton(state, index);
}

/**
 * Scrolls a slide into view.
 * @param {Element} slide
 * @returns {void}
 */
function scrollSlideIntoView(slide) {
  slide.scrollIntoView({
    behavior: "smooth",
    inline: "start",
    block: "nearest",
  });
}

/**
 * Binds carousel dot buttons.
 * @param {object} state
 * @returns {void}
 */
function bindCarouselButtonEvents(state) {
  state.buttons.forEach((button, index) => {
    button.addEventListener("click", () => scrollToSlide(state, index));
  });
}

/**
 * Binds carousel scroll and resize events.
 * @param {object} state
 * @returns {void}
 */
function bindCarouselScrollEvents(state) {
  state.carousel.addEventListener("scroll", () => {
    requestAnimationFrame(() => updateActiveCarouselButton(state));
  });

  window.addEventListener("resize", () => updateActiveCarouselButton(state));
}

/**
 * Updates the active carousel button.
 * @param {object} state
 * @returns {void}
 */
function updateActiveCarouselButton(state) {
  setActiveCarouselButton(state, getActiveSlideIndex(state));
}

/**
 * Gets the responsive contact form selector.
 * @returns {string}
 */
function getContactFormSelector() {
  return isMobileViewport() ? "#contact-form-mobile" : "#contact-form-desktop";
}

/**
 * Gets the target for an anchor href.
 * @param {string} href
 * @returns {Element|null}
 */
function getAnchorTarget(href) {
  if (isContactAnchor(href)) return getContactAnchorTarget();

  try {
    return document.querySelector(href);
  } catch (error) {
    return null;
  }
}

/**
 * Checks if href targets contact.
 * @param {string} href
 * @returns {boolean}
 */
function isContactAnchor(href) {
  return href === "#contact" || href === "#contact-form";
}

/**
 * Gets the contact anchor target.
 * @returns {Element|null}
 */
function getContactAnchorTarget() {
  return (
    document.querySelector(getContactFormSelector()) ||
    document.querySelector("#contact")
  );
}

/**
 * Gets the main scroller.
 * @returns {Element|null}
 */
function getMainScroller() {
  return document.querySelector("main");
}

/**
 * Checks if viewport is mobile.
 * @returns {boolean}
 */
function isMobileViewport() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

/**
 * Clamps a value to a range.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Gets scrollLeft for a target.
 * @param {Element} main
 * @param {Element} target
 * @returns {number}
 */
function getMainScrollLeftForTarget(main, target) {
  const mainRect = main.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const rawLeft = main.scrollLeft + targetRect.left - mainRect.left;
  const maxLeft = main.scrollWidth - main.clientWidth;

  return clamp(rawLeft, 0, maxLeft);
}

/**
 * Temporarily disables main scroll snap.
 * @param {Element} main
 * @param {ScrollBehavior} behavior
 * @returns {void}
 */
function temporarilyDisableMainSnap(main, behavior) {
  if (!main) return;

  window.clearTimeout(restoreMainSnapTimer);
  main.style.scrollSnapType = "none";
  scheduleMainSnapRestore(main, behavior);
}

/**
 * Restores main scroll snap later.
 * @param {Element} main
 * @param {ScrollBehavior} behavior
 * @returns {void}
 */
function scheduleMainSnapRestore(main, behavior) {
  const restoreDelay = behavior === "smooth" ? 700 : 0;

  restoreMainSnapTimer = window.setTimeout(() => {
    main.style.scrollSnapType = "";
  }, restoreDelay);
}

/**
 * Checks if target is a direct snap section.
 * @param {Element} main
 * @param {Element} target
 * @returns {boolean}
 */
function isMainSnapTarget(main, target) {
  return target.parentElement === main;
}

/**
 * Scrolls to a desktop anchor target.
 * @param {Element} target
 * @param {ScrollBehavior} behavior
 * @returns {boolean}
 */
function scrollToDesktopAnchorTarget(target, behavior) {
  const main = getMainScroller();
  if (!main) return false;

  maybeDisableSnapForTarget(main, target, behavior);
  scrollMainToTarget(main, target, behavior);

  return true;
}

/**
 * Disables snap when target is nested.
 * @param {Element} main
 * @param {Element} target
 * @param {ScrollBehavior} behavior
 * @returns {void}
 */
function maybeDisableSnapForTarget(main, target, behavior) {
  if (!isMainSnapTarget(main, target)) {
    temporarilyDisableMainSnap(main, behavior);
  }
}

/**
 * Scrolls main to a target.
 * @param {Element} main
 * @param {Element} target
 * @param {ScrollBehavior} behavior
 * @returns {void}
 */
function scrollMainToTarget(main, target, behavior) {
  main.scrollTo({
    left: getMainScrollLeftForTarget(main, target),
    top: 0,
    behavior,
  });
}

/**
 * Scrolls to an anchor target.
 * @param {string} href
 * @param {ScrollBehavior} [behavior]
 * @returns {boolean}
 */
function scrollToAnchorTarget(href, behavior = "smooth") {
  if (!href || href === "#") return false;

  const target = getAnchorTarget(href);
  if (!target) return false;

  if (isMobileViewport()) {
    scrollMobileTargetIntoView(target, behavior);
    return true;
  }

  return scrollToDesktopAnchorTarget(target, behavior);
}

/**
 * Scrolls a mobile target into view.
 * @param {Element} target
 * @param {ScrollBehavior} behavior
 * @returns {void}
 */
function scrollMobileTargetIntoView(target, behavior) {
  target.scrollIntoView({
    behavior,
    block: "start",
    inline: "nearest",
  });
}

/**
 * Checks if native mobile anchor should run.
 * @param {HTMLAnchorElement} link
 * @param {string} href
 * @returns {boolean}
 */
function shouldUseNativeMobileAnchor(link, href) {
  return false;
}

/**
 * Sets up section anchor scrolling.
 * @returns {void}
 */
function setupSectionAnchorScrolling() {
  const main = getMainScroller();
  const sectionLinks = document.querySelectorAll('a[href^="#"]');

  if (!main || !sectionLinks.length) return;

  sectionLinks.forEach(bindSectionAnchorLink);
}

/**
 * Binds one section anchor link.
 * @param {HTMLAnchorElement} link
 * @returns {void}
 */
function bindSectionAnchorLink(link) {
  link.addEventListener("click", (event) => {
    handleSectionAnchorClick(event, link);
  });
}

/**
 * Handles section anchor clicks.
 * @param {MouseEvent} event
 * @param {HTMLAnchorElement} link
 * @returns {void}
 */
function handleSectionAnchorClick(event, link) {
  const href = link.getAttribute("href");

  if (shouldUseNativeMobileAnchor(link, href)) {
    closeMenu();
    return;
  }

  handleCustomAnchorClick(event, href);
}

/**
 * Handles custom anchor clicks.
 * @param {MouseEvent} event
 * @param {string} href
 * @returns {void}
 */
function handleCustomAnchorClick(event, href) {
  if (!scrollToAnchorTarget(href)) return;

  event.preventDefault();
  history.pushState(null, "", href);
  closeMenu();
}

/**
 * Sets up initial hash scrolling.
 * @returns {void}
 */
function setupInitialHashScrolling() {
  const href = window.location.hash;
  if (!href) return;

  requestAnimationFrame(() => scrollToAnchorTarget(href, "auto"));
  window.addEventListener("load", () => scrollToAnchorTarget(href, "auto"), {
    once: true,
  });
}

/**
 * Sets up hashchange scrolling.
 * @returns {void}
 */
function setupHashChangeScrolling() {
  window.addEventListener("hashchange", () => {
    scrollToAnchorTarget(window.location.hash, "smooth");
  });
}

/**
 * Initializes AOS when available.
 * @returns {void}
 */
function initAOS() {
  if (window.PortfolioAOS) {
    window.PortfolioAOS.init();
  }
}

/**
 * Initializes form validation.
 * @returns {void}
 */
function initFormValidation() {
  setupFormValidation(".contact__form", "#contactPolicy", ".contact__submit");
  setupFormValidation(
    "#contact-form-mobile",
    "#contactMobilePolicy",
    ".contactMobile__submit",
  );
}

/**
 * Initializes the portfolio scripts.
 * @returns {void}
 */
function initPortfolio() {
  initMobileMenu();
  initDesktopWheelScroll();
  initWorkCardToggles();
  setupMobileContactCarousel();
  setupSectionAnchorScrolling();
  setupInitialHashScrolling();
  setupHashChangeScrolling();
  initAOS();
  initFormValidation();
}

document.addEventListener("DOMContentLoaded", initPortfolio);