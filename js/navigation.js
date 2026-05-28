const mobileToggle = document.querySelector(".mobileBar__toggle");
const mobileMenu = document.querySelector("#mobileMenu");
const mobileMenuLinks = document.querySelectorAll(".mobileMenu__link");

const MOBILE_BREAKPOINT = 768;
const WHEEL_SCROLL_SPEED = 8;

let restoreMainSnapTimer = null;

window.PortfolioNavigation = {
  init: initPortfolioNavigation,
  closeMenu,
  scrollToAnchorTarget,
};

/** Initializes menu, wheel, anchor, and hash scrolling. */
function initPortfolioNavigation() {
  initMobileMenu();
  initDesktopWheelScroll();
  setupSectionAnchorScrolling();
  setupInitialHashScrolling();
  setupHashChangeScrolling();
}

/** Checks if the mobile menu is open. */
function isMenuOpen() {
  return document.body.classList.contains("menu-open");
}

/** Sets the mobile menu state. */
function setMenuState(open) {
  document.body.classList.toggle("menu-open", open);

  if (mobileToggle) {
    mobileToggle.setAttribute("aria-expanded", String(open));
  }
}

/** Closes the mobile menu. */
function closeMenu() {
  setMenuState(false);
}

/** Toggles the mobile menu. */
function toggleMenu() {
  setMenuState(!isMenuOpen());
}

/** Handles the mobile toggle click. */
function handleToggleClick(event) {
  event.stopPropagation();
  toggleMenu();
}

/** Handles clicks outside the menu. */
function handleOutsideClick(event) {
  if (!shouldCloseMenuFromClick(event)) return;

  closeMenu();
}

/** Checks whether an outside click should close the menu. */
function shouldCloseMenuFromClick(event) {
  if (!isMenuOpen()) return false;
  if (mobileMenu && mobileMenu.contains(event.target)) return false;
  if (mobileToggle && mobileToggle.contains(event.target)) return false;

  return true;
}

/** Handles Escape key menu closing. */
function handleEscapeKey(event) {
  if (event.key === "Escape") {
    closeMenu();
  }
}

/** Initializes mobile menu behavior. */
function initMobileMenu() {
  if (!mobileToggle || !mobileMenu) return;

  mobileToggle.addEventListener("click", handleToggleClick);
  mobileMenuLinks.forEach(bindMobileMenuLink);
  document.addEventListener("click", handleOutsideClick);
  document.addEventListener("keydown", handleEscapeKey);
}

/** Binds one mobile menu link. */
function bindMobileMenuLink(link) {
  link.addEventListener("click", closeMenu);
}

/** Initializes desktop wheel scrolling. */
function initDesktopWheelScroll() {
  const main = getMainScroller();
  if (!main) return;

  window.addEventListener("wheel", handleDesktopWheel, { passive: false });
}

/** Handles desktop wheel scrolling. */
function handleDesktopWheel(event) {
  const main = getMainScroller();
  if (shouldIgnoreDesktopWheel(event, main)) return;

  const delta = getWheelDelta(event);
  if (!delta) return;

  event.preventDefault();
  scrollMainByWheel(main, delta);
}

/** Checks whether desktop wheel scrolling should be ignored. */
function shouldIgnoreDesktopWheel(event, main) {
  if (isMobileViewport()) return true;
  if (event.ctrlKey || event.metaKey) return true;
  if (!main) return true;

  return main.scrollWidth <= main.clientWidth;
}

/** Gets the dominant wheel delta. */
function getWheelDelta(event) {
  return Math.abs(event.deltaX) > Math.abs(event.deltaY)
    ? event.deltaX
    : event.deltaY;
}

/** Scrolls the main container horizontally from wheel input. */
function scrollMainByWheel(main, delta) {
  main.scrollBy({
    left: delta * WHEEL_SCROLL_SPEED,
    top: 0,
    behavior: "auto",
  });
}

/** Gets the responsive contact form selector. */
function getContactFormSelector() {
  return isMobileViewport() ? "#contact-form-mobile" : "#contact-form-desktop";
}

/** Gets the target element for an anchor href. */
function getAnchorTarget(href) {
  if (isContactAnchor(href)) return getContactAnchorTarget();

  try {
    return document.querySelector(href);
  } catch (error) {
    return null;
  }
}

/** Checks whether an href targets the contact section. */
function isContactAnchor(href) {
  return href === "#contact" || href === "#contact-form";
}

/** Gets the active contact anchor target. */
function getContactAnchorTarget() {
  return (
    document.querySelector(getContactFormSelector()) ||
    document.querySelector("#contact")
  );
}

/** Gets the main scroll container. */
function getMainScroller() {
  return document.querySelector("main");
}

/** Checks whether the viewport is mobile-sized. */
function isMobileViewport() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

/** Clamps a value within a range. */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Gets the horizontal scroll position for a target. */
function getMainScrollLeftForTarget(main, target) {
  const mainRect = main.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const rawLeft = main.scrollLeft + targetRect.left - mainRect.left;
  const maxLeft = main.scrollWidth - main.clientWidth;

  return clamp(rawLeft, 0, maxLeft);
}

/** Temporarily disables main scroll snap. */
function temporarilyDisableMainSnap(main, behavior) {
  if (!main) return;

  window.clearTimeout(restoreMainSnapTimer);
  main.style.scrollSnapType = "none";
  scheduleMainSnapRestore(main, behavior);
}

/** Restores main scroll snap after scrolling. */
function scheduleMainSnapRestore(main, behavior) {
  const restoreDelay = behavior === "smooth" ? 700 : 0;

  restoreMainSnapTimer = window.setTimeout(() => {
    main.style.scrollSnapType = "";
  }, restoreDelay);
}

/** Checks whether a target is a direct snap section. */
function isMainSnapTarget(main, target) {
  return target.parentElement === main;
}

/** Scrolls to a desktop anchor target. */
function scrollToDesktopAnchorTarget(target, behavior) {
  const main = getMainScroller();
  if (!main) return false;

  maybeDisableSnapForTarget(main, target, behavior);
  scrollMainToTarget(main, target, behavior);

  return true;
}

/** Disables scroll snap when the target is nested. */
function maybeDisableSnapForTarget(main, target, behavior) {
  if (!isMainSnapTarget(main, target)) {
    temporarilyDisableMainSnap(main, behavior);
  }
}

/** Scrolls main to a target element. */
function scrollMainToTarget(main, target, behavior) {
  main.scrollTo({
    left: getMainScrollLeftForTarget(main, target),
    top: 0,
    behavior,
  });
}

/** Scrolls to an anchor target. */
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

/** Scrolls a mobile target into view. */
function scrollMobileTargetIntoView(target, behavior) {
  target.scrollIntoView({
    behavior,
    block: "start",
    inline: "nearest",
  });
}

/** Checks whether native mobile anchor behavior should run. */
function shouldUseNativeMobileAnchor(link, href) {
  return false;
}

/** Sets up custom section anchor scrolling. */
function setupSectionAnchorScrolling() {
  const main = getMainScroller();
  const sectionLinks = document.querySelectorAll('a[href^="#"]');

  if (!main || !sectionLinks.length) return;

  sectionLinks.forEach(bindSectionAnchorLink);
}

/** Binds one section anchor link. */
function bindSectionAnchorLink(link) {
  link.addEventListener("click", (event) => {
    handleSectionAnchorClick(event, link);
  });
}

/** Handles section anchor clicks. */
function handleSectionAnchorClick(event, link) {
  const href = link.getAttribute("href");

  if (shouldUseNativeMobileAnchor(link, href)) {
    closeMenu();
    return;
  }

  handleCustomAnchorClick(event, href);
}

/** Handles custom anchor scrolling and history updates. */
function handleCustomAnchorClick(event, href) {
  if (!scrollToAnchorTarget(href)) return;

  event.preventDefault();
  history.pushState(null, "", href);
  closeMenu();
}

/** Sets up initial hash scrolling. */
function setupInitialHashScrolling() {
  const href = window.location.hash;
  if (!href) return;

  requestAnimationFrame(() => scrollToAnchorTarget(href, "auto"));
  window.addEventListener("load", () => scrollToAnchorTarget(href, "auto"), {
    once: true,
  });
}

/** Sets up hashchange scrolling. */
function setupHashChangeScrolling() {
  window.addEventListener("hashchange", () => {
    scrollToAnchorTarget(window.location.hash, "smooth");
  });
}