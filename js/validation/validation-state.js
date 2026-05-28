/**
 * Form validation state helpers.
 */

/**
 * Gets the shared validation rules.
 * @returns {object}
 */
function getValidationRules() {
  return window.PortfolioValidationRules;
}

/**
 * Gets a field validator.
 * @param {string} name
 * @returns {Function|undefined}
 */
function getValidator(name) {
  return getValidationRules().getValidator(name);
}

/**
 * Gets localized validation messages.
 * @returns {Record<string, string>}
 */
function getMessages() {
  return getValidationRules().getMessages();
}

/**
 * Collects form validation state.
 * @param {string} formSelector
 * @param {string} checkboxSelector
 * @param {string} buttonSelector
 * @returns {object|null}
 */
function getValidationState(formSelector, checkboxSelector, buttonSelector) {
  const form = document.querySelector(formSelector);
  const checkbox = document.querySelector(checkboxSelector);
  const button = document.querySelector(buttonSelector);

  if (!form || !checkbox || !button) return null;

  return createValidationState(form, checkbox, button, formSelector);
}

/**
 * Builds a validation state object.
 * @param {HTMLFormElement} form
 * @param {HTMLInputElement} checkbox
 * @param {HTMLButtonElement} button
 * @param {string} formSelector
 * @returns {object}
 */
function createValidationState(form, checkbox, button, formSelector) {
  return {
    form,
    checkbox,
    button,
    fields: getFormFields(form),
    classes: getFormClasses(formSelector),
    privacyLabel: getPrivacyLabel(checkbox),
  };
}

/**
 * Prepares form validation state.
 * @param {object} state
 * @returns {void}
 */
function prepareValidationState(state) {
  state.form.setAttribute("novalidate", "");
  prepareFields(state.fields);
  preparePrivacy(state.checkbox, state.privacyLabel);
}

/**
 * Gets validatable form fields.
 * @param {HTMLFormElement} form
 * @returns {Array<HTMLInputElement|HTMLTextAreaElement>}
 */
function getFormFields(form) {
  return [...form.querySelectorAll("input[name], textarea[name]")];
}

/**
 * Gets validation class names.
 * @param {string} formSelector
 * @returns {object}
 */
function getFormClasses(formSelector) {
  const isDesktop = formSelector === ".contact__form";

  return {
    inputError: getFormClass(isDesktop, "input", "error"),
    textareaError: getFormClass(isDesktop, "textarea", "error"),
    inputValid: getFormClass(isDesktop, "input", "valid"),
    textareaValid: getFormClass(isDesktop, "textarea", "valid"),
    privacyError: getPrivacyClass(isDesktop),
  };
}

/**
 * Builds a field class name.
 * @param {boolean} isDesktop
 * @param {string} fieldType
 * @param {string} state
 * @returns {string}
 */
function getFormClass(isDesktop, fieldType, state) {
  const prefix = isDesktop ? "contact" : "contactMobile";

  return `${prefix}__${fieldType}--${state}`;
}

/**
 * Gets the privacy error class.
 * @param {boolean} isDesktop
 * @returns {string}
 */
function getPrivacyClass(isDesktop) {
  return isDesktop ? "contact__privacy--error" : "contactMobile__privacy--error";
}

/**
 * Gets the privacy label wrapper.
 * @param {HTMLInputElement} checkbox
 * @returns {Element|null}
 */
function getPrivacyLabel(checkbox) {
  return checkbox.closest(".contact__privacy, .contactMobile__privacy");
}