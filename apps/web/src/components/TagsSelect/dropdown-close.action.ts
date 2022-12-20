export function onDropDownClose(
  node: HTMLElement,
  callback: Function
): {
  destroy: () => void;
} {
  const config = { attributes: true, childList: false, subtree: false };

  const observer = new MutationObserver((mutationList) => {
    mutationList.forEach((mutation) => {
      if (
        mutation.type !== "attributes" ||
        mutation.attributeName !== "open" ||
        node.getAttribute("open") !== null
      )
        return;

      callback();
    });
  });

  observer.observe(node, config);

  return {
    destroy() {
      observer.disconnect();
    },
  };
}
