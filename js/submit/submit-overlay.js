(() => {
  let formOverlayTimeoutId = null;

  window.PortfolioSubmitOverlay = {
    init: initSubmitOverlay,
    open: openFormOverlay,
    close: closeFormOverlay,
    updateLanguage: updateOverlayLanguage,
  };

  /** Initializes overlay language and events. */
  function initSubmitOverlay() {
    bindOverlayEvents();
    updateOverlayLanguage();
    document.addEventListener("keydown", handleEscapeKey);
  }

  /** Gets overlay DOM elements. */
  function getOverlayElements() {
    const overlay = document.getElementById("formOverlay");
    if (!overlay) return null;

    return {
      overlay,
      title: overlay.querySelector("#formOverlayTitle"),
      text: overlay.querySelector(".formOverlay__text"),
      closeButton: getOverlayCloseButton(overlay),
    };
  }

  /** Gets the overlay close button. */
  function getOverlayCloseButton(overlay) {
    return (
      overlay.querySelector("#formOverlayClose") ||
      overlay.querySelector(".formOverlay__close")
    );
  }

  /** Applies localized overlay text. */
  function updateOverlayLanguage() {
    const elements = getOverlayElements();
    if (!elements) return;

    const messages = window.PortfolioSubmitConfig.getMessages();

    setElementText(elements.title, messages.overlayTitle);
    setElementText(elements.text, messages.overlayText);
    setCloseButtonLabel(elements.closeButton, messages.overlayClose);
  }

  /** Updates text on an optional element. */
  function setElementText(element, text) {
    if (element) element.textContent = text;
  }

  /** Updates the overlay close label. */
  function setCloseButtonLabel(button, label) {
    if (button) button.setAttribute("aria-label", label);
  }

  /** Opens the success overlay. */
  function openFormOverlay() {
    const elements = getOverlayElements();

    if (!elements) {
      warnMissingOverlay();
      return;
    }

    updateOverlayLanguage();
    activateOverlay(elements.overlay);
    scheduleOverlayClose();
  }

  /** Logs a missing overlay warning. */
  function warnMissingOverlay() {
    console.warn("Form overlay markup was not found in the HTML.");
  }

  /** Activates the overlay. */
  function activateOverlay(overlay) {
    overlay.classList.add("formOverlay--active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("body--noScroll");
  }

  /** Schedules overlay auto-close. */
  function scheduleOverlayClose() {
    clearOverlayTimer();
    formOverlayTimeoutId = window.setTimeout(closeFormOverlay, 4000);
  }

  /** Clears the overlay timer. */
  function clearOverlayTimer() {
    if (!formOverlayTimeoutId) return;

    window.clearTimeout(formOverlayTimeoutId);
    formOverlayTimeoutId = null;
  }

  /** Closes the success overlay. */
  function closeFormOverlay() {
    const elements = getOverlayElements();
    if (!elements) return;

    clearOverlayTimer();
    deactivateOverlay(elements.overlay);
  }

  /** Deactivates the overlay. */
  function deactivateOverlay(overlay) {
    overlay.classList.remove("formOverlay--active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("body--noScroll");
  }

  /** Binds overlay close events once. */
  function bindOverlayEvents() {
    const elements = getOverlayElements();

    if (!elements || isOverlayBound(elements.overlay)) return;

    markOverlayBound(elements.overlay);
    elements.overlay.addEventListener("click", handleOverlayClick);
  }

  /** Checks if overlay events are bound. */
  function isOverlayBound(overlay) {
    return overlay.dataset.bound === "true";
  }

  /** Marks overlay events as bound. */
  function markOverlayBound(overlay) {
    overlay.dataset.bound = "true";
  }

  /** Handles overlay clicks. */
  function handleOverlayClick(event) {
    if (isOverlayCloseClick(event)) {
      closeFormOverlay();
    }
  }

  /** Checks if an overlay click should close. */
  function isOverlayCloseClick(event) {
    return isBackdropClick(event) || isCloseButtonClick(event);
  }

  /** Checks backdrop clicks. */
  function isBackdropClick(event) {
    return event.target === event.currentTarget;
  }

  /** Checks close button clicks. */
  function isCloseButtonClick(event) {
    return (
      event.target.closest("#formOverlayClose") ||
      event.target.closest(".formOverlay__close")
    );
  }

  /** Handles Escape key overlay closing. */
  function handleEscapeKey(event) {
    if (event.key === "Escape") {
      closeFormOverlay();
    }
  }
})();