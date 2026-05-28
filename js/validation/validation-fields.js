/**
 * Field validation UI helpers.
 */

/**
 * Prepares all fields.
 * @param {Array<HTMLInputElement|HTMLTextAreaElement>} fields
 * @returns {void}
 */
function prepareFields(fields) {
  fields.forEach(prepareField);
}

/**
 * Prepares one field.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @returns {void}
 */
function prepareField(field) {
  field.dataset.defaultPlaceholder = field.getAttribute("placeholder") || "";
  field.setAttribute("aria-invalid", "false");
}

/**
 * Gets a field error class.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @param {object} classes
 * @returns {string}
 */
function getErrorClass(field, classes) {
  return field.tagName === "TEXTAREA"
    ? classes.textareaError
    : classes.inputError;
}

/**
 * Gets a field valid class.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @param {object} classes
 * @returns {string}
 */
function getValidClass(field, classes) {
  return field.tagName === "TEXTAREA"
    ? classes.textareaValid
    : classes.inputValid;
}

/**
 * Restores the default placeholder.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @returns {void}
 */
function restorePlaceholder(field) {
  field.setAttribute("placeholder", field.dataset.defaultPlaceholder || "");
}

/**
 * Gets the value to validate.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @returns {string}
 */
function getFieldValidationValue(field) {
  if (isShowingStoredError(field)) return field.dataset.userValue;

  return field.value;
}

/**
 * Checks if an error is shown as value.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @returns {boolean}
 */
function isShowingStoredError(field) {
  return (
    field.dataset.isShowingError === "true" &&
    typeof field.dataset.userValue === "string"
  );
}

/**
 * Removes field state classes.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @param {object} classes
 * @returns {void}
 */
function removeFieldStateClasses(field, classes) {
  field.classList.remove(
    classes.inputError,
    classes.textareaError,
    classes.inputValid,
    classes.textareaValid,
  );
}

/**
 * Shows a field error.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @param {string} message
 * @param {object} classes
 * @returns {void}
 */
function setFieldError(field, message, classes) {
  const currentValue = getFieldValidationValue(field);

  prepareErrorField(field, message, classes);

  if (currentValue.trim()) {
    showErrorAsFieldValue(field, message);
    return;
  }

  showErrorAsPlaceholder(field, message);
}

/**
 * Prepares field error state.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @param {string} message
 * @param {object} classes
 * @returns {void}
 */
function prepareErrorField(field, message, classes) {
  removeFieldStateClasses(field, classes);
  field.classList.add(getErrorClass(field, classes));
  field.dataset.errorMessage = message;
  field.setAttribute("aria-invalid", "true");
}

/**
 * Shows error as field value.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @param {string} message
 * @returns {void}
 */
function showErrorAsFieldValue(field, message) {
  if (field.dataset.isShowingError !== "true") {
    field.dataset.userValue = field.value;
  }

  field.dataset.isShowingError = "true";
  field.value = message;
  restorePlaceholder(field);
}

/**
 * Shows error as placeholder.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @param {string} message
 * @returns {void}
 */
function showErrorAsPlaceholder(field, message) {
  field.value = "";
  deleteFieldStoredError(field);
  field.setAttribute("placeholder", message);
}

/**
 * Clears stored error data.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @returns {void}
 */
function deleteFieldStoredError(field) {
  delete field.dataset.userValue;
  delete field.dataset.isShowingError;
}

/**
 * Clears field validation state.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @param {object} classes
 * @returns {void}
 */
function clearFieldState(field, classes) {
  removeFieldStateClasses(field, classes);
  clearFieldData(field);
  field.setAttribute("aria-invalid", "false");
  restorePlaceholder(field);
}

/**
 * Clears field data attributes.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @returns {void}
 */
function clearFieldData(field) {
  delete field.dataset.errorMessage;
  delete field.dataset.userValue;
  delete field.dataset.isShowingError;
}

/**
 * Marks a field valid.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @param {object} classes
 * @returns {void}
 */
function setFieldValid(field, classes) {
  removeFieldStateClasses(field, classes);
  field.classList.add(getValidClass(field, classes));
  field.setAttribute("aria-invalid", "false");
  restorePlaceholder(field);
}

/**
 * Validates one field.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @param {object} classes
 * @returns {boolean}
 */
function validateField(field, classes) {
  const message = getFieldValidationMessage(field);

  if (message) {
    setFieldError(field, message, classes);
    return false;
  }

  setValidOrClearField(field, classes);
  return true;
}

/**
 * Gets a field validation message.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @returns {string}
 */
function getFieldValidationMessage(field) {
  const validator = getValidator(field.name);
  const value = getFieldValidationValue(field);

  return validator ? validator(value) : "";
}

/**
 * Sets valid state or clears empty field.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @param {object} classes
 * @returns {void}
 */
function setValidOrClearField(field, classes) {
  const value = getFieldValidationValue(field);

  if (value.trim()) {
    setFieldValid(field, classes);
    return;
  }

  clearFieldState(field, classes);
}

/**
 * Validates all fields.
 * @param {Array<HTMLInputElement|HTMLTextAreaElement>} fields
 * @param {object} classes
 * @returns {boolean}
 */
function validateAllFields(fields, classes) {
  let allValid = true;

  fields.forEach((field) => {
    if (!validateField(field, classes)) allValid = false;
  });

  return allValid;
}

/**
 * Checks fields without UI updates.
 * @param {Array<HTMLInputElement|HTMLTextAreaElement>} fields
 * @returns {boolean}
 */
function areFieldsValid(fields) {
  return fields.every(isFieldValidWithoutUI);
}

/**
 * Checks one field without UI updates.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @returns {boolean}
 */
function isFieldValidWithoutUI(field) {
  const validator = getValidator(field.name);
  const value = getFieldValidationValue(field);

  return validator ? !validator(value) : true;
}

/**
 * Restores stored user input.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @returns {void}
 */
function restoreStoredUserValue(field) {
  if (isShowingStoredError(field)) {
    field.value = field.dataset.userValue;
  }
}