const LEGAL_WHEEL_SCROLL_SPEED = 8;
const LEGAL_MOBILE_BREAKPOINT = 768;

let legalMain = null;

document.addEventListener("DOMContentLoaded", initLegalPageScrolling);

/** Initializes legal page scrolling behavior. */
function initLegalPageScrolling() {
  legalMain = document.querySelector("main.legalPage");
  if (!legalMain) return;

  bindWheelScrolling();
  bindAnchorScrolling("#legal-start", scrollToLegalStart);
  bindAnchorScrolling("#legal-end", scrollToLegalEnd);
}

/** Binds horizontal wheel scrolling. */
function bindWheelScrolling() {
  window.addEventListener("wheel", handleLegalWheel, { passive: false });
}

/** Handles wheel scrolling for the legal page. */
function handleLegalWheel(event) {
  if (shouldIgnoreWheel(event)) return;

  const delta = getMainWheelDelta(event);
  if (!delta) return;

  event.preventDefault();
  scrollMainHorizontally(delta);
}

/** Checks whether wheel scrolling should be ignored. */
function shouldIgnoreWheel(event) {
  if (isMobileViewport()) return true;
  if (event.ctrlKey || event.metaKey) return true;

  return legalMain.scrollWidth <= legalMain.clientWidth;
}

/** Returns the dominant wheel delta. */
function getMainWheelDelta(event) {
  const { deltaX, deltaY } = event;

  return Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
}

/** Scrolls the main legal container horizontally. */
function scrollMainHorizontally(delta) {
  legalMain.scrollBy({
    left: delta * LEGAL_WHEEL_SCROLL_SPEED,
    top: 0,
    behavior: "auto",
  });
}

/** Binds anchor clicks to a scroll handler. */
function bindAnchorScrolling(hash, scrollHandler) {
  document.querySelectorAll(`a[href="${hash}"]`).forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      scrollHandler("smooth");
      history.replaceState(null, "", hash);
    });
  });
}

/** Scrolls to the start of the legal page. */
function scrollToLegalStart(behavior = "smooth") {
  const target = document.querySelector("#legal-start");

  if (isMobileViewport()) {
    scrollWindowToTarget(target, behavior);
    return;
  }

  scrollMainToStart(behavior);
}

/** Scrolls to the end of the legal page. */
function scrollToLegalEnd(behavior = "smooth") {
  const target = document.querySelector("#legal-end");

  if (isMobileViewport()) {
    scrollWindowToTarget(target, behavior);
    return;
  }

  scrollMainToEnd(behavior);
}

/** Scrolls the window to a target element. */
function scrollWindowToTarget(target, behavior = "smooth") {
  if (!target) return;

  target.scrollIntoView({
    behavior,
    block: "start",
    inline: "nearest",
  });
}

/** Scrolls the legal main container to the start. */
function scrollMainToStart(behavior) {
  legalMain.scrollTo({
    left: 0,
    top: 0,
    behavior,
  });
}

/** Scrolls the legal main container to the end. */
function scrollMainToEnd(behavior) {
  const left = legalMain.scrollWidth - legalMain.clientWidth;

  legalMain.scrollTo({
    left,
    top: 0,
    behavior,
  });
}

/** Checks whether the viewport is mobile-sized. */
function isMobileViewport() {
  return window.innerWidth <= LEGAL_MOBILE_BREAKPOINT;
}