export function selectHack(
  selectElementId: string,
  selectElementValue: string
) {
  const select = document.getElementById(
    selectElementId
  ) as HTMLSelectElement | null;

  if (select === null) return;
  select.value = selectElementValue;
  select.dispatchEvent(new Event("change"));
}
