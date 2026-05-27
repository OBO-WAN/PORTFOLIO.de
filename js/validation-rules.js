/**
 * Pure validation rules and messages.
 */
(function () {
  const VALIDATION_MESSAGES = {
    en: {
      nameRequired: "Your name is required",
      nameShort: "Name must have 2+ characters",
      nameInvalid: "Please use letters only",
      emailRequired: "Your e-mail is required",
      emailInvalid: "Please enter a valid e-mail",
      messageRequired: "Your message is required",
      messageShort: "Message must have 10+ characters",
      policyRequired: "Please accept the privacy policy.",
    },
    es: {
      nameRequired: "Tu nombre es obligatorio",
      nameShort: "El nombre debe tener al menos 2 caracteres",
      nameInvalid: "Por favor, usa solo letras",
      emailRequired: "Tu correo es obligatorio",
      emailInvalid: "Introduce un correo electrónico válido",
      messageRequired: "Tu mensaje es obligatorio",
      messageShort: "El mensaje debe tener al menos 10 caracteres",
      policyRequired: "Acepta la política de privacidad.",
    },
    de: {
      nameRequired: "Dein Name ist erforderlich",
      nameShort: "Der Name muss mindestens 2 Zeichen haben",
      nameInvalid: "Bitte verwende nur Buchstaben",
      emailRequired: "Deine E-Mail ist erforderlich",
      emailInvalid: "Bitte gib eine gültige E-Mail-Adresse ein",
      messageRequired: "Deine Nachricht ist erforderlich",
      messageShort: "Die Nachricht muss mindestens 10 Zeichen haben",
      policyRequired: "Bitte akzeptiere die Datenschutzerklärung.",
    },
  };

  const NAME_PATTERN = /^[a-zA-ZÀ-ÿ' -]+$/;
  const EMAIL_PATTERN =
    /^(?!.*\.\.)[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

  window.PortfolioValidationRules = {
    getMessages,
    getValidator,
    validateName,
    validateEmail,
    validateMessage,
  };

  /**
   * Gets the current page language key.
   * @returns {string}
   */
  function getLanguageKey() {
    const language = document.documentElement.lang || "en";

    return language.slice(0, 2).toLowerCase();
  }

  /**
   * Gets localized validation messages.
   * @returns {Record<string, string>}
   */
  function getMessages() {
    const language = getLanguageKey();

    return VALIDATION_MESSAGES[language] || VALIDATION_MESSAGES.en;
  }

  /**
   * Gets a validator by field name.
   * @param {string} name
   * @returns {Function|undefined}
   */
  function getValidator(name) {
    const validators = getValidators();

    return validators[name];
  }

  /**
   * Gets all field validators.
   * @returns {Record<string, Function>}
   */
  function getValidators() {
    return {
      name: validateName,
      email: validateEmail,
      message: validateMessage,
    };
  }

  /**
   * Validates a name value.
   * @param {string} value
   * @returns {string}
   */
  function validateName(value) {
    const text = value.trim();
    const messages = getMessages();

    if (!text) return messages.nameRequired;
    if (text.length < 2) return messages.nameShort;
    if (!NAME_PATTERN.test(text)) return messages.nameInvalid;

    return "";
  }

  /**
   * Validates an e-mail value.
   * @param {string} value
   * @returns {string}
   */
  function validateEmail(value) {
    const text = value.trim();
    const messages = getMessages();

    if (!text) return messages.emailRequired;
    if (!EMAIL_PATTERN.test(text)) return messages.emailInvalid;

    return "";
  }

  /**
   * Validates a message value.
   * @param {string} value
   * @returns {string}
   */
  function validateMessage(value) {
    const text = value.trim();
    const messages = getMessages();

    if (!text) return messages.messageRequired;
    if (text.length < 10) return messages.messageShort;

    return "";
  }
})();