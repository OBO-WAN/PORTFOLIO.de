(() => {
  /** Gets and stores default button text. */
  function getDefaultButtonText(button) {
    if (!button.dataset.defaultText) {
      button.dataset.defaultText = button.textContent.trim() || "Send";
    }

    return button.dataset.defaultText;
  }

  /** Updates button text. */
  function setButtonText(button, text) {
    button.textContent = text;
  }

  /** Updates the button after validation. */
  function updateButtonStateAfterSubmit(state) {
    const submission = PortfolioSubmitRequest.getSubmission(
      state.form,
      state.source,
    );

    state.button.disabled = !PortfolioSubmitRequest.isReadyToSend(
      submission,
      state.checkbox,
    );
  }

  /** Sets up one contact form. */
  function setupContactForm(config) {
    const state = getContactFormState(config);
    if (!state) return;

    state.form.addEventListener("submit", (event) => {
      handleContactSubmit(event, state);
    });
  }

  /** Gets contact form state. */
  function getContactFormState(config) {
    const form = document.querySelector(config.formSelector);
    const checkbox = document.querySelector(config.checkboxSelector);
    const button = document.querySelector(config.buttonSelector);

    if (!form || !checkbox || !button) return null;

    return createContactFormState(config, form, checkbox, button);
  }

  /** Creates contact form state. */
  function createContactFormState(config, form, checkbox, button) {
    return {
      form,
      checkbox,
      button,
      source: config.source,
      messages: PortfolioSubmitConfig.getMessages(),
      defaultButtonText: getDefaultButtonText(button),
    };
  }

  /** Handles form submit. */
  async function handleContactSubmit(event, state) {
    event.preventDefault();

    const submission = PortfolioSubmitRequest.getSubmission(
      state.form,
      state.source,
    );

    if (!PortfolioSubmitRequest.isReadyToSend(submission, state.checkbox)) {
      updateButtonStateAfterSubmit(state);
      return;
    }

    await submitReadyForm(submission, state);
  }

  /** Sends a valid form. */
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

  /** Runs successful submit flow. */
  async function runSuccessfulSubmission(submission, state) {
    setSendingState(state);
    await PortfolioSubmitRequest.sendSubmission(submission);
    resetSubmittedForm(state);
    showSuccessState(state);
  }

  /** Applies sending state. */
  function setSendingState(state) {
    state.button.disabled = true;
    setButtonText(state.button, state.messages.sending);
  }

  /** Resets a submitted form. */
  function resetSubmittedForm(state) {
    state.form.reset();
    state.checkbox.checked = false;
  }

  /** Shows successful submit state. */
  function showSuccessState(state) {
    setButtonText(state.button, state.messages.sent);
    PortfolioSubmitOverlay.open();
  }

  /** Handles submit errors. */
  function handleSubmitError(error, state) {
    console.error("Error sending message:", error);
    setButtonText(state.button, state.messages.error);
  }

  /** Schedules submit button reset. */
  function scheduleButtonReset(state, wasSuccessful) {
    window.setTimeout(() => {
      resetButtonAfterSubmit(state, wasSuccessful);
    }, 2000);
  }

  /** Resets button after submit. */
  function resetButtonAfterSubmit(state, wasSuccessful) {
    setButtonText(state.button, state.defaultButtonText);

    if (wasSuccessful) {
      state.button.disabled = true;
      return;
    }

    updateButtonStateAfterSubmit(state);
  }

  /** Initializes contact form submit logic. */
  function initContactSubmit() {
    PortfolioSubmitOverlay.init();
    PortfolioSubmitConfig.forms.forEach(setupContactForm);
  }

  document.addEventListener("DOMContentLoaded", initContactSubmit);
})();