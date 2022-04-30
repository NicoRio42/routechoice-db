/**
 *
 * @param {HTMLIFrameElement} iframe
 * @param {string} selectElementId
 * @param {string} selectElementValue
 */
export function selectHack(iframe, selectElementId, selectElementValue) {
  /**@type {HTMLSelectElement} */
  const select = iframe.contentDocument.getElementById(selectElementId);
  select.value = selectElementValue;
  select.dispatchEvent(new Event("change"));
}
