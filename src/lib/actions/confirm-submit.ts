export function confirmSubmit(form: HTMLFormElement, message: string) {
	function confirmEventListener(e: Event) {
		if (!confirm(message)) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
		}
	}

	form.addEventListener('submit', confirmEventListener, { capture: true });

	return { destroy: () => form.removeEventListener('submit', confirmEventListener) };
}
