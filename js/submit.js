(() => {
  const scriptUrl = document.currentScript?.src || "";
  const contactEndpoint = getContactEndpoint(scriptUrl);
  const isLocalDevelopment = isLocalHost();

  let formOverlayTimeoutId = null;

  const forms = [
    {
      formSelector: ".contact__form",
      checkboxSelector: "#contactPolicy",
      buttonSelector: ".contact__submit",
      source: "desktop-contact-form",
    },
    {
      formSelector: "#contact-form-mobile",
      checkboxSelector: "#contactMobilePolicy",
      buttonSelector: ".contactMobile__submit",
      source: "mobile-contact-form",
    },
  ];

  const SUBMIT_MESSAGES = {
    en: {
      sending: "Sending...",
      sent: "Sent!",
      error: "Error",
      overlayTitle: "Message sent!",
      overlayText:
        "Thank you for your message. I will get back to you as soon as possible.",
      overlayClose: "Close confirmation",
    },
    de: {
      sending: "Wird gesendet...",
      sent: "Gesendet!",
      error: "Fehler",
      overlayTitle: "Nachricht gesendet!",
      overlayText:
        "Vielen Dank für deine Nachricht. Ich melde mich so schnell wie möglich zurück.",
      overlayClose: "Bestätigung schließen",
    },
    es: {
      sending: "Enviando...",
      sent: "¡Enviado!",
      error: "Error",
      overlayTitle: "¡Mensaje enviado!",
      overlayText:
        "Gracias por tu mensaje. Me pondré en contacto contigo lo antes posible.",
      overlayClose: "Cerrar confirmación",
    },
  };

  /**
   * Builds the contact endpoint URL.
   * @param {string} scriptUrl
   * @returns {string}
   */
  function getContactEndpoint(scriptUrl) {
    if (!scriptUrl) return "contact_form_mail.php";

    return new URL("../contact_form_mail.php", scriptUrl).href;
  }

  /**
   * Checks local development hostnames.
   * @returns {boolean}
   */
  function isLocalHost() {
    return (
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "localhost"
    );
  }

  /**
   * Gets the current language key.
   * @returns {string}
   */
  function getLanguageKey() {
    const language = document.documentElement.lang || "en";

    return language.slice(0, 2).toLowerCase();
  }

  /**
   * Gets localized submit messages.
   * @returns {Record<string, string>}
   */
  function getMessages() {
    const language = getLanguageKey();

    return SUBMIT_MESSAGES[language] || SUBMIT_MESSAGES.en;
  }

  /**
   * Gets overlay DOM elements.
   * @returns {object|null}
   */
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

  /**
   * Gets the overlay close button.
   * @param {HTMLElement} overlay
   * @returns {Element|null}
   */
  function getOverlayCloseButton(overlay) {
    return (
      overlay.querySelector("#formOverlayClose") ||
      overlay.querySelector(".formOverlay__close")
    );
  }

  /**
   * Applies localized overlay text.
   * @returns {void}
   */
  function updateOverlayLanguage() {
    const elements = getOverlayElements();
    if (!elements) return;

    const messages = getMessages();

    setElementText(elements.title, messages.overlayTitle);
    setElementText(elements.text, messages.overlayText);
    setCloseButtonLabel(elements.closeButton, messages.overlayClose);
  }

  /**
   * Updates text on an optional element.
   * @param {Element|null} element
   * @param {string} text
   * @returns {void}
   */
  function setElementText(element, text) {
    if (element) element.textContent = text;
  }

  /**
   * Updates the overlay close label.
   * @param {Element|null} button
   * @param {string} label
   * @returns {void}
   */
  function setCloseButtonLabel(button, label) {
    if (button) button.setAttribute("aria-label", label);
  }

  /**
   * Opens the success overlay.
   * @returns {void}
   */
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

  /**
   * Logs a missing overlay warning.
   * @returns {void}
   */
  function warnMissingOverlay() {
    console.warn("Form overlay markup was not found in the HTML.");
  }

  /**
   * Activates the overlay.
   * @param {HTMLElement} overlay
   * @returns {void}
   */
  function activateOverlay(overlay) {
    overlay.classList.add("formOverlay--active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("body--noScroll");
  }

  /**
   * Schedules overlay auto-close.
   * @returns {void}
   */
  function scheduleOverlayClose() {
    clearOverlayTimer();
    formOverlayTimeoutId = window.setTimeout(closeFormOverlay, 4000);
  }

  /**
   * Clears the overlay timer.
   * @returns {void}
   */
  function clearOverlayTimer() {
    if (!formOverlayTimeoutId) return;

    window.clearTimeout(formOverlayTimeoutId);
    formOverlayTimeoutId = null;
  }

  /**
   * Closes the success overlay.
   * @returns {void}
   */
  function closeFormOverlay() {
    const elements = getOverlayElements();
    if (!elements) return;

    clearOverlayTimer();
    deactivateOverlay(elements.overlay);
  }

  /**
   * Deactivates the overlay.
   * @param {HTMLElement} overlay
   * @returns {void}
   */
  function deactivateOverlay(overlay) {
    overlay.classList.remove("formOverlay--active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("body--noScroll");
  }

  /**
   * Binds overlay close events once.
   * @returns {void}
   */
  function bindOverlayEvents() {
    const elements = getOverlayElements();

    if (!elements || isOverlayBound(elements.overlay)) return;

    markOverlayBound(elements.overlay);
    elements.overlay.addEventListener("click", handleOverlayClick);
  }

  /**
   * Checks if overlay events are bound.
   * @param {HTMLElement} overlay
   * @returns {boolean}
   */
  function isOverlayBound(overlay) {
    return overlay.dataset.bound === "true";
  }

  /**
   * Marks overlay events as bound.
   * @param {HTMLElement} overlay
   * @returns {void}
   */
  function markOverlayBound(overlay) {
    overlay.dataset.bound = "true";
  }

  /**
   * Handles overlay clicks.
   * @param {MouseEvent} event
   * @returns {void}
   */
  function handleOverlayClick(event) {
    if (isOverlayCloseClick(event)) {
      closeFormOverlay();
    }
  }

  /**
   * Checks if an overlay click should close.
   * @param {MouseEvent} event
   * @returns {boolean}
   */
  function isOverlayCloseClick(event) {
    return isBackdropClick(event) || isCloseButtonClick(event);
  }

  /**
   * Checks backdrop clicks.
   * @param {MouseEvent} event
   * @returns {boolean}
   */
  function isBackdropClick(event) {
    return event.target === event.currentTarget;
  }

  /**
   * Checks close button clicks.
   * @param {MouseEvent} event
   * @returns {Element|null}
   */
  function isCloseButtonClick(event) {
    return (
      event.target.closest("#formOverlayClose") ||
      event.target.closest(".formOverlay__close")
    );
  }

  /**
   * Gets and stores default button text.
   * @param {HTMLButtonElement} button
   * @returns {string}
   */
  function getDefaultButtonText(button) {
    if (!button.dataset.defaultText) {
      button.dataset.defaultText = button.textContent.trim() || "Send";
    }

    return button.dataset.defaultText;
  }

  /**
   * Updates button text.
   * @param {HTMLButtonElement} button
   * @param {string} text
   * @returns {void}
   */
  function setButtonText(button, text) {
    button.textContent = text;
  }

  /**
   * Builds submission data.
   * @param {HTMLFormElement} form
   * @param {string} source
   * @returns {object}
   */
  function getSubmission(form, source) {
    const formData = new FormData(form);

    return {
      name: getFormTextValue(formData, "name"),
      email: getFormTextValue(formData, "email"),
      message: getFormTextValue(formData, "message"),
      source,
    };
  }

  /**
   * Gets trimmed form text.
   * @param {FormData} formData
   * @param {string} name
   * @returns {string}
   */
  function getFormTextValue(formData, name) {
    return String(formData.get(name) || "").trim();
  }

  /**
   * Checks submission validity.
   * @param {object} submission
   * @returns {boolean}
   */
  function isValidSubmission(submission) {
    return (
      isValidName(submission.name) &&
      isValidEmail(submission.email) &&
      isValidMessage(submission.message)
    );
  }

  /**
   * Checks name validity.
   * @param {string} name
   * @returns {boolean}
   */
  function isValidName(name) {
    return name.length >= 2 && /^[a-zA-ZÀ-ÿ' -]+$/.test(name);
  }

  /**
   * Checks e-mail validity.
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  /**
   * Checks message validity.
   * @param {string} message
   * @returns {boolean}
   */
  function isValidMessage(message) {
    return message.length >= 10;
  }

  /**
   * Updates the button after validation.
   * @param {object} state
   * @returns {void}
   */
  function updateButtonStateAfterSubmit(state) {
    const submission = getSubmission(state.form, state.source);
    const isReady = isValidSubmission(submission) && state.checkbox.checked;

    state.button.disabled = !isReady;
  }

  /**
   * Sends contact form data.
   * @param {object} submission
   * @returns {Promise<object>}
   */
  async function sendSubmission(submission) {
    if (isLocalDevelopment) {
      return simulateLocalSubmission(submission);
    }

    return sendRemoteSubmission(submission);
  }

  /**
   * Simulates local form success.
   * @param {object} submission
   * @returns {Promise<object>}
   */
  async function simulateLocalSubmission(submission) {
    console.info("Local development mode: PHP mail request skipped.", submission);
    await new Promise((resolve) => window.setTimeout(resolve, 400));

    return {
      success: true,
      message: "Local development confirmation simulated.",
    };
  }

  /**
   * Sends the remote form request.
   * @param {object} submission
   * @returns {Promise<object>}
   */
  async function sendRemoteSubmission(submission) {
    const response = await fetch(contactEndpoint, getFetchOptions(submission));
    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Contact form request failed");
    }

    return result;
  }

  /**
   * Builds fetch options.
   * @param {object} submission
   * @returns {object}
   */
  function getFetchOptions(submission) {
    return {
      method: "POST",
      headers: getJsonHeaders(),
      body: JSON.stringify(submission),
    };
  }

  /**
   * Gets JSON request headers.
   * @returns {object}
   */
  function getJsonHeaders() {
    return {
      "Content-Type": "application/json",
    };
  }

  /**
   * Sets up one contact form.
   * @param {object} config
   * @returns {void}
   */
  function setupContactForm(config) {
    const state = getContactFormState(config);
    if (!state) return;

    state.form.addEventListener("submit", (event) => {
      handleContactSubmit(event, state);
    });
  }

  /**
   * Gets contact form state.
   * @param {object} config
   * @returns {object|null}
   */
  function getContactFormState(config) {
    const form = document.querySelector(config.formSelector);
    const checkbox = document.querySelector(config.checkboxSelector);
    const button = document.querySelector(config.buttonSelector);

    if (!form || !checkbox || !button) return null;

    return createContactFormState(config, form, checkbox, button);
  }

  /**
   * Creates contact form state.
   * @param {object} config
   * @param {HTMLFormElement} form
   * @param {HTMLInputElement} checkbox
   * @param {HTMLButtonElement} button
   * @returns {object}
   */
  function createContactFormState(config, form, checkbox, button) {
    return {
      form,
      checkbox,
      button,
      source: config.source,
      messages: getMessages(),
      defaultButtonText: getDefaultButtonText(button),
    };
  }

  /**
   * Handles form submit.
   * @param {SubmitEvent} event
   * @param {object} state
   * @returns {Promise<void>}
   */
  async function handleContactSubmit(event, state) {
    event.preventDefault();

    const submission = getSubmission(state.form, state.source);

    if (!isReadyToSend(submission, state.checkbox)) {
      updateButtonStateAfterSubmit(state);
      return;
    }

    await submitReadyForm(submission, state);
  }

  /**
   * Checks if submission can send.
   * @param {object} submission
   * @param {HTMLInputElement} checkbox
   * @returns {boolean}
   */
  function isReadyToSend(submission, checkbox) {
    return isValidSubmission(submission) && checkbox.checked;
  }

  /**
   * Sends a valid form.
   * @param {object} submission
   * @param {object} state
   * @returns {Promise<void>}
   */
  async function submitReadyForm(submission, state) {
    let wasSuccessful = false;

    try {
      await runSuccessfulSubmission(submission, state);
      wasSuccessful = true;
    } catch (error) {
      handleSubmitError(error, state);
    } finally {
      scheduleButtonReset(state, wasSuccessful);
    }
  }

  /**
   * Runs successful submit flow.
   * @param {object} submission
   * @param {object} state
   * @returns {Promise<void>}
   */
  async function runSuccessfulSubmission(submission, state) {
    setSendingState(state);
    await sendSubmission(submission);
    resetSubmittedForm(state);
    showSuccessState(state);
  }

  /**
   * Applies sending state.
   * @param {object} state
   * @returns {void}
   */
  function setSendingState(state) {
    state.button.disabled = true;
    setButtonText(state.button, state.messages.sending);
  }

  /**
   * Resets a submitted form.
   * @param {object} state
   * @returns {void}
   */
  function resetSubmittedForm(state) {
    state.form.reset();
    state.checkbox.checked = false;
  }

  /**
   * Shows successful submit state.
   * @param {object} state
   * @returns {void}
   */
  function showSuccessState(state) {
    setButtonText(state.button, state.messages.sent);
    openFormOverlay();
  }

  /**
   * Handles submit errors.
   * @param {Error} error
   * @param {object} state
   * @returns {void}
   */
  function handleSubmitError(error, state) {
    console.error("Error sending message:", error);
    setButtonText(state.button, state.messages.error);
  }

  /**
   * Schedules submit button reset.
   * @param {object} state
   * @param {boolean} wasSuccessful
   * @returns {void}
   */
  function scheduleButtonReset(state, wasSuccessful) {
    window.setTimeout(() => {
      resetButtonAfterSubmit(state, wasSuccessful);
    }, 2000);
  }

  /**
   * Resets button after submit.
   * @param {object} state
   * @param {boolean} wasSuccessful
   * @returns {void}
   */
  function resetButtonAfterSubmit(state, wasSuccessful) {
    setButtonText(state.button, state.defaultButtonText);

    if (wasSuccessful) {
      state.button.disabled = true;
      return;
    }

    updateButtonStateAfterSubmit(state);
  }

  /**
   * Handles Escape key.
   * @param {KeyboardEvent} event
   * @returns {void}
   */
  function handleEscapeKey(event) {
    if (event.key === "Escape") {
      closeFormOverlay();
    }
  }

  /**
   * Initializes contact form submit logic.
   * @returns {void}
   */
  function initContactSubmit() {
    bindOverlayEvents();
    updateOverlayLanguage();
    forms.forEach(setupContactForm);
  }

  document.addEventListener("keydown", handleEscapeKey);
  document.addEventListener("DOMContentLoaded", initContactSubmit);
})();