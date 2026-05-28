const LANGUAGE_MOBILE_WIDTH = 768;
const MOBILE_SECTION_OFFSET = 104;
const MOBILE_CONTACT_VISIBILITY = 0.65;

/** Returns the current visible section anchor for language switching. */
function getVisibleAnchorForLanguageSwitch() {
  return isMobileLanguageViewport()
    ? getMobileLanguageAnchor()
    : getDesktopLanguageAnchor();
}

/** Checks whether the language switch is running on mobile width. */
function isMobileLanguageViewport() {
  return window.innerWidth <= LANGUAGE_MOBILE_WIDTH;
}

/** Returns the best language anchor for the mobile layout. */
function getMobileLanguageAnchor() {
  const contactAnchor = getVisibleMobileContactAnchor();
  if (contactAnchor) return contactAnchor;

  return getClosestMobileSectionAnchor();
}

/** Returns the mobile contact anchor when it is currently visible. */
function getVisibleMobileContactAnchor() {
  const mobileContact = document.querySelector("#contact-mobile-start");
  if (!mobileContact) return "";

  return isMobileContactVisible(mobileContact) ? "#contact-mobile-start" : "";
}

/** Checks whether the mobile contact marker is visible enough. */
function isMobileContactVisible(element) {
  const rect = element.getBoundingClientRect();

  return rect.top < window.innerHeight * MOBILE_CONTACT_VISIBILITY && rect.bottom > 0;
}

/** Returns the closest mobile section anchor. */
function getClosestMobileSectionAnchor() {
  const section = getClosestSectionByDistance((rect) =>
    Math.abs(rect.top - MOBILE_SECTION_OFFSET),
  );

  return getSectionAnchor(section);
}

/** Returns the best language anchor for the desktop layout. */
function getDesktopLanguageAnchor() {
  const mainLeft = getMainLeftPosition();
  const section = getClosestDesktopSection(mainLeft);

  return getDesktopContactAnchor(section, mainLeft) || getSectionAnchor(section);
}

/** Returns the left edge of the main scroll container. */
function getMainLeftPosition() {
  const main = document.querySelector("main");

  return main ? main.getBoundingClientRect().left : 0;
}

/** Returns the closest desktop section to the main container. */
function getClosestDesktopSection(mainLeft) {
  return getClosestSectionByDistance((rect) => Math.abs(rect.left - mainLeft));
}

/** Returns the desktop contact anchor when its form is closest. */
function getDesktopContactAnchor(section, mainLeft) {
  if (!isContactSection(section)) return "";
  if (!isDesktopFormCloserThanSection(section, mainLeft)) return "";

  return "#contact";
}

/** Checks whether a section is the contact section. */
function isContactSection(section) {
  return section && section.id === "contact";
}

/** Checks whether the desktop form is closer than its section edge. */
function isDesktopFormCloserThanSection(section, mainLeft) {
  const desktopForm = document.querySelector("#contact-form-desktop");
  if (!desktopForm) return false;

  const formRect = desktopForm.getBoundingClientRect();
  const sectionRect = section.getBoundingClientRect();

  return Math.abs(formRect.left - mainLeft) < Math.abs(sectionRect.left - mainLeft);
}

/** Returns the closest section based on a distance callback. */
function getClosestSectionByDistance(getDistance) {
  return [...document.querySelectorAll("main > section[id]")].reduce(
    (best, section) => getCloserSection(best, section, getDistance),
    { section: null, distance: Infinity },
  ).section;
}

/** Returns the closer section comparison result. */
function getCloserSection(best, section, getDistance) {
  const distance = getDistance(section.getBoundingClientRect());
  if (distance >= best.distance) return best;

  return { section, distance };
}

/** Converts a section element into a hash anchor. */
function getSectionAnchor(section) {
  return section ? `#${section.id}` : "";
}

/** Preserves the visible page anchor when switching languages. */
function setupLanguageAnchorPreservation() {
  const languageLinks = document.querySelectorAll("[data-lang-link]");

  languageLinks.forEach(addLanguageLinkHandler);
}

/** Adds the language switch click handler to a link. */
function addLanguageLinkHandler(link) {
  link.addEventListener("click", (event) => handleLanguageLinkClick(event, link), true);
}

/** Handles a language switch link click. */
function handleLanguageLinkClick(event, link) {
  const href = link.getAttribute("href");
  if (!href) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  window.location.href = getNextLanguageUrl(href);
}

/** Builds the next language URL with the current anchor preserved. */
function getNextLanguageUrl(href) {
  const nextUrl = new URL(href, window.location.href);
  const anchor = getVisibleAnchorForLanguageSwitch();

  if (anchor) nextUrl.hash = anchor;

  return nextUrl.toString();
}

document.addEventListener("DOMContentLoaded", setupLanguageAnchorPreservation);