import { error } from '@sveltejs/kit';

export function GET({ url, fetch }) {
	const urlToProxy = url.searchParams.get('urlToProxy');
	if (urlToProxy === null) throw error(404);

	return fetch(urlToProxy);
}
