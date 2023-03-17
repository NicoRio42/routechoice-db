import { tick } from 'svelte';

const portalMap = new Map();

export function createPortal(node: Node, id = 'default') {
	const key = `$$portal.${id}`;
	if (portalMap.has(key)) throw `duplicate portal key "${id}"`;
	else portalMap.set(key, node);
	return { destroy: portalMap.delete.bind(portalMap, key) };
}

function mount(node: Node, key: string) {
	if (!portalMap.has(key)) throw `unknown portal ${key}`;
	const host = portalMap.get(key);
	host.insertBefore(node, null);
	return () => host.contains(node) && host.removeChild(node);
}
export function portal(node: Node, id = 'default') {
	let destroy: Function;
	const key = `$$portal.${id}`;

	if (!portalMap.has(key))
		tick().then(() => {
			destroy = mount(node, key);
		});
	else destroy = mount(node, key);

	return { destroy: () => destroy?.() };
}
