export function selectHack(iframe, selectElementId, selectElementValue) {
  const select = iframe.contentDocument.getElementById(selectElementId);
  select.value = selectElementValue;
  select.dispatchEvent(new Event("change"));
}
