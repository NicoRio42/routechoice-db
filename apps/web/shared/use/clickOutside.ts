/** Dispatch event on click outside of node */
function clickOutside(node: Element, callback: Function) {
  const handleClick = (event) => {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      callback();
    }
  };

  document.addEventListener("click", handleClick, true);

  return {
    update(newCallback: Function) {
      callback = newCallback;
    },
    destroy() {
      document.removeEventListener("click", handleClick, true);
    },
  };
}

export default clickOutside;
