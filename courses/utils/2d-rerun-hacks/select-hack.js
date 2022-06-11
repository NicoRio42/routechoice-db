/**
 *
 * @param {string} selectElementId
 * @param {string} selectElementValue
 */
export function selectHack(selectElementId, selectElementValue) {
  /**@type {HTMLSelectElement} */
  const select = document.getElementById(selectElementId);
  select.value = selectElementValue;
  select.dispatchEvent(new Event("change"));
}
