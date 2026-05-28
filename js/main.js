/** Initializes work card toggles. */
function initWorkCardToggles() {
  document.querySelectorAll(".workCard__toggle").forEach(bindWorkCardToggle);
}

/** Binds one work card toggle. */
function bindWorkCardToggle(button) {
  button.addEventListener("click", () => {
    toggleWorkCard(button);
  });
}

/** Toggles one work card open or closed. */
function toggleWorkCard(button) {
  const card = button.closest(".workCard");
  if (!card) return;

  const isOpen = card.classList.toggle("workCard--open");
  updateWorkCardToggle(button, isOpen);
}

/** Updates a work card toggle button. */
function updateWorkCardToggle(button, isOpen) {
  button.setAttribute("aria-expanded", String(isOpen));
  button.innerHTML = getWorkCardToggleMarkup(isOpen);
}

/** Gets work card toggle markup. */
function getWorkCardToggleMarkup(isOpen) {
  return isOpen
    ? 'Show less <span class="workCard__toggleIcon" aria-hidden="true">▼</span>'
    : 'Show me more <span class="workCard__toggleIcon" aria-hidden="true">▼</span>';
}

/** Initializes the mobile contact carousel. */
function setupMobileContactCarousel() {
  const state = getMobileCarouselState();
  if (!isValidCarouselState(state)) return;

  bindCarouselButtonEvents(state);
  bindCarouselScrollEvents(state);
  setActiveCarouselButton(state, 0);
}

/** Gets mobile carousel state. */
function getMobileCarouselState() {
  const carousel = document.querySelector(".contactMobile__track");

  return {
    carousel,
    slides: carousel ? [...carousel.querySelectorAll(".contactMobile__card")] : [],
    buttons: [...document.querySelectorAll(".contactMobile__dot")],
  };
}

/** Checks whether carousel state is usable. */
function isValidCarouselState(state) {
  if (!state.carousel) return false;
  if (!state.slides.length) return false;

  return state.slides.length === state.buttons.length;
}

/** Sets the active carousel button. */
function setActiveCarouselButton(state, activeIndex) {
  state.buttons.forEach((button, index) => {
    updateCarouselButton(button, index === activeIndex);
  });
}

/** Updates one carousel button. */
function updateCarouselButton(button, isActive) {
  button.classList.toggle("contactMobile__dot--active", isActive);
  button.setAttribute("aria-current", isActive ? "true" : "false");
}

/** Gets the slide step width. */
function getSlideStep(state) {
  if (state.slides.length === 1) {
    return state.slides[0].getBoundingClientRect().width;
  }

  return getDistanceBetweenFirstSlides(state.slides);
}

/** Gets the distance between the first two slides. */
function getDistanceBetweenFirstSlides(slides) {
  const first = slides[0].getBoundingClientRect();
  const second = slides[1].getBoundingClientRect();

  return second.left - first.left;
}

/** Gets the active slide index. */
function getActiveSlideIndex(state) {
  const step = getSlideStep(state);
  if (!step) return 0;

  const index = Math.round(state.carousel.scrollLeft / step);

  return clampCarouselIndex(index, 0, state.slides.length - 1);
}

/** Clamps a carousel index within a range. */
function clampCarouselIndex(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Scrolls to a carousel slide. */
function scrollToSlide(state, index) {
  const slide = state.slides[index];
  if (!slide) return;

  scrollSlideIntoView(slide);
  setActiveCarouselButton(state, index);
}

/** Scrolls a slide into view. */
function scrollSlideIntoView(slide) {
  slide.scrollIntoView({
    behavior: "smooth",
    inline: "start",
    block: "nearest",
  });
}

/** Binds carousel dot buttons. */
function bindCarouselButtonEvents(state) {
  state.buttons.forEach((button, index) => {
    button.addEventListener("click", () => scrollToSlide(state, index));
  });
}

/** Binds carousel scroll and resize events. */
function bindCarouselScrollEvents(state) {
  state.carousel.addEventListener("scroll", () => {
    requestAnimationFrame(() => updateActiveCarouselButton(state));
  });

  window.addEventListener("resize", () => updateActiveCarouselButton(state));
}

/** Updates the active carousel button. */
function updateActiveCarouselButton(state) {
  setActiveCarouselButton(state, getActiveSlideIndex(state));
}

/** Initializes AOS when available. */
function initAOS() {
  if (window.PortfolioAOS) {
    window.PortfolioAOS.init();
  }
}

/** Initializes form validation. */
function initFormValidation() {
  setupFormValidation(".contact__form", "#contactPolicy", ".contact__submit");
  setupFormValidation(
    "#contact-form-mobile",
    "#contactMobilePolicy",
    ".contactMobile__submit",
  );
}

/** Initializes the portfolio scripts. */
function initPortfolio() {
  window.PortfolioNavigation?.init();
  initWorkCardToggles();
  setupMobileContactCarousel();
  initAOS();
  initFormValidation();
}

document.addEventListener("DOMContentLoaded", initPortfolio);