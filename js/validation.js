/**
 * Public contact form validation entry point.
 */

/**
 * Initializes validation for one form.
 * @param {string} formSelector
 * @param {string} checkboxSelector
 * @param {string} buttonSelector
 * @returns {void}
 */
function setupFormValidation(formSelector, checkboxSelector, buttonSelector) {
  const state = getValidationState(formSelector, checkboxSelector, buttonSelector);
  if (!state) return;

  prepareValidationState(state);
  bindValidationEvents(state);
  updateButtonState(state.fields, state.checkbox, state.button);
}

/**
 * Updates submit button state.
 * @param {Array<HTMLInputElement|HTMLTextAreaElement>} fields
 * @param {HTMLInputElement} checkbox
 * @param {HTMLButtonElement} button
 * @returns {void}
 */
function updateButtonState(fields, checkbox, button) {
  const isReady = areFieldsValid(fields) && isPolicyAccepted(checkbox);

  button.disabled = false;
  button.setAttribute("aria-disabled", String(!isReady));
}