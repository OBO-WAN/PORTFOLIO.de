/**
 * Form validation event handlers.
 */

/**
 * Binds all validation events.
 * @param {object} state
 * @returns {void}
 */
function bindValidationEvents(state) {
  bindFieldEvents(state);
  bindCheckboxEvents(state);
  bindButtonEvent(state);
  bindSubmitEvent(state);
  bindResetEvent(state);
}

/**
 * Binds all field events.
 * @param {object} state
 * @returns {void}
 */
function bindFieldEvents(state) {
  state.fields.forEach((field) => {
    bindSingleFieldEvents(field, state);
  });
}

/**
 * Binds one field's events.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @param {object} state
 * @returns {void}
 */
function bindSingleFieldEvents(field, state) {
  field.addEventListener("focus", () => handleFieldFocus(field, state.classes));
  field.addEventListener("input", () => handleFieldInput(state));
  field.addEventListener("blur", () => handleFieldBlur(field, state));
}

/**
 * Handles field focus.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @param {object} classes
 * @returns {void}
 */
function handleFieldFocus(field, classes) {
  restoreStoredUserValue(field);
  clearFieldState(field, classes);
}

/**
 * Handles field input.
 * @param {object} state
 * @returns {void}
 */
function handleFieldInput(state) {
  updateButtonState(state.fields, state.checkbox, state.button);
}

/**
 * Handles field blur.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @param {object} state
 * @returns {void}
 */
function handleFieldBlur(field, state) {
  validateField(field, state.classes);
  updateButtonState(state.fields, state.checkbox, state.button);
}

/**
 * Binds checkbox events.
 * @param {object} state
 * @returns {void}
 */
function bindCheckboxEvents(state) {
  state.checkbox.addEventListener("change", () => handleCheckboxChange(state));
  state.checkbox.addEventListener("blur", () => handleCheckboxBlur(state));
}

/**
 * Handles checkbox change.
 * @param {object} state
 * @returns {void}
 */
function handleCheckboxChange(state) {
  if (state.checkbox.checked) clearPrivacyForState(state);
  else validatePrivacyForState(state);

  updateButtonState(state.fields, state.checkbox, state.button);
}

/**
 * Handles checkbox blur.
 * @param {object} state
 * @returns {void}
 */
function handleCheckboxBlur(state) {
  validatePrivacyForState(state);
  updateButtonState(state.fields, state.checkbox, state.button);
}

/**
 * Binds guarded button clicks.
 * @param {object} state
 * @returns {void}
 */
function bindButtonEvent(state) {
  state.button.addEventListener("click", (event) => {
    if (!isButtonAriaDisabled(state.button)) return;

    event.preventDefault();
    validateAllFields(state.fields, state.classes);
    validatePrivacyForState(state);
  });
}

/**
 * Checks aria-disabled state.
 * @param {HTMLButtonElement} button
 * @returns {boolean}
 */
function isButtonAriaDisabled(button) {
  return button.getAttribute("aria-disabled") === "true";
}

/**
 * Binds submit validation.
 * @param {object} state
 * @returns {void}
 */
function bindSubmitEvent(state) {
  state.form.addEventListener("submit", (event) => {
    if (isFormReadyToSubmit(state)) return;

    event.preventDefault();
    focusFirstInvalidControl(state);
    updateButtonState(state.fields, state.checkbox, state.button);
  });
}

/**
 * Checks if form can submit.
 * @param {object} state
 * @returns {boolean}
 */
function isFormReadyToSubmit(state) {
  const fieldsAreValid = validateAllFields(state.fields, state.classes);
  const policyAccepted = validatePrivacyForState(state);

  return fieldsAreValid && policyAccepted;
}

/**
 * Focuses the first invalid control.
 * @param {object} state
 * @returns {void}
 */
function focusFirstInvalidControl(state) {
  const firstInvalidField = findFirstInvalidField(state.fields);

  if (firstInvalidField) scrollToInvalidField(firstInvalidField);
  else if (!isPolicyAccepted(state.checkbox)) state.checkbox.focus();
}

/**
 * Finds the first invalid field.
 * @param {Array<HTMLInputElement|HTMLTextAreaElement>} fields
 * @returns {HTMLInputElement|HTMLTextAreaElement|undefined}
 */
function findFirstInvalidField(fields) {
  return fields.find((field) => Boolean(getFieldValidationMessage(field)));
}

/**
 * Scrolls to an invalid field.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @returns {void}
 */
function scrollToInvalidField(field) {
  field.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

/**
 * Binds form reset cleanup.
 * @param {object} state
 * @returns {void}
 */
function bindResetEvent(state) {
  state.form.addEventListener("reset", () => {
    window.setTimeout(() => resetValidationState(state), 0);
  });
}

/**
 * Resets validation UI state.
 * @param {object} state
 * @returns {void}
 */
function resetValidationState(state) {
  state.fields.forEach((field) => clearFieldState(field, state.classes));
  clearPrivacyForState(state);
  updateButtonState(state.fields, state.checkbox, state.button);
}