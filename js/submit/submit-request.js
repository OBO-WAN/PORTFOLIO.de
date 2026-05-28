(() => {
  window.PortfolioSubmitRequest = {
    getSubmission,
    isReadyToSend,
    isValidSubmission,
    sendSubmission,
  };

  /** Builds submission data. */
  function getSubmission(form, source) {
    const formData = new FormData(form);

    return {
      name: getFormTextValue(formData, "name"),
      email: getFormTextValue(formData, "email"),
      message: getFormTextValue(formData, "message"),
      source,
    };
  }

  /** Gets trimmed form text. */
  function getFormTextValue(formData, name) {
    return String(formData.get(name) || "").trim();
  }

  /** Checks if submission can send. */
  function isReadyToSend(submission, checkbox) {
    return isValidSubmission(submission) && checkbox.checked;
  }

  /** Checks submission validity. */
  function isValidSubmission(submission) {
    return (
      isValidName(submission.name) &&
      isValidEmail(submission.email) &&
      isValidMessage(submission.message)
    );
  }

  /** Checks name validity. */
  function isValidName(name) {
    return name.length >= 2 && /^[a-zA-ZÀ-ÿ' -]+$/.test(name);
  }

  /** Checks e-mail validity. */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  /** Checks message validity. */
  function isValidMessage(message) {
    return message.length >= 10;
  }

  /** Sends contact form data. */
  async function sendSubmission(submission) {
    if (window.PortfolioSubmitConfig.isLocalDevelopment) {
      return simulateLocalSubmission(submission);
    }

    return sendRemoteSubmission(submission);
  }

  /** Simulates local form success. */
  async function simulateLocalSubmission(submission) {
    console.info("Local development mode: PHP mail request skipped.", submission);
    await new Promise((resolve) => window.setTimeout(resolve, 400));

    return {
      success: true,
      message: "Local development confirmation simulated.",
    };
  }

  /** Sends the remote form request. */
  async function sendRemoteSubmission(submission) {
    const endpoint = window.PortfolioSubmitConfig.contactEndpoint;
    const response = await fetch(endpoint, getFetchOptions(submission));
    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Contact form request failed");
    }

    return result;
  }

  /** Builds fetch options. */
  function getFetchOptions(submission) {
    return {
      method: "POST",
      headers: getJsonHeaders(),
      body: JSON.stringify(submission),
    };
  }

  /** Gets JSON request headers. */
  function getJsonHeaders() {
    return {
      "Content-Type": "application/json",
    };
  }
})();