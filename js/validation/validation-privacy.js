/**
 * Privacy checkbox validation helpers.
 */

/**
 * Prepares privacy checkbox state.
 * @param {HTMLInputElement} checkbox
 * @param {Element|null} privacyLabel
 * @returns {void}
 */
function preparePrivacy(checkbox, privacyLabel) {
  checkbox.setAttribute("aria-invalid", "false");

  if (privacyLabel) {
    privacyLabel.removeAttribute("data-error-message");
  }
}

/**
 * Checks privacy acceptance.
 * @param {HTMLInputElement} checkbox
 * @returns {boolean}
 */
function isPolicyAccepted(checkbox) {
  return checkbox.checked;
}

/**
 * Shows privacy error state.
 * @param {HTMLInputElement} checkbox
 * @param {Element|null} privacyLabel
 * @param {object} classes
 * @returns {void}
 */
function setPrivacyError(checkbox, privacyLabel, classes) {
  const messages = getMessages();

  checkbox.setAttribute("aria-invalid", "true");

  if (privacyLabel) {
    privacyLabel.classList.add(classes.privacyError);
    privacyLabel.dataset.errorMessage = messages.policyRequired;
  }
}

/**
 * Clears privacy error state.
 * @param {HTMLInputElement} checkbox
 * @param {Element|null} privacyLabel
 * @param {object} classes
 * @returns {void}
 */
function clearPrivacyError(checkbox, privacyLabel, classes) {
  checkbox.setAttribute("aria-invalid", "false");

  if (privacyLabel) {
    privacyLabel.classList.remove(classes.privacyError);
    privacyLabel.removeAttribute("data-error-message");
  }
}

/**
 * Validates privacy acceptance.
 * @param {HTMLInputElement} checkbox
 * @param {Element|null} privacyLabel
 * @param {object} classes
 * @returns {boolean}
 */
function validatePrivacy(checkbox, privacyLabel, classes) {
  if (!isPolicyAccepted(checkbox)) {
    setPrivacyError(checkbox, privacyLabel, classes);
    return false;
  }

  clearPrivacyError(checkbox, privacyLabel, classes);
  return true;
}

/**
 * Clears privacy state.
 * @param {object} state
 * @returns {void}
 */
function clearPrivacyForState(state) {
  clearPrivacyError(state.checkbox, state.privacyLabel, state.classes);
}

/**
 * Validates privacy state.
 * @param {object} state
 * @returns {boolean}
 */
function validatePrivacyForState(state) {
  return validatePrivacy(state.checkbox, state.privacyLabel, state.classes);
}