import { error } from '@sveltejs/kit';

export function GET({ url, fetch }) {
	const imageUrl = url.searchParams.get('url');

	if (imageUrl === null) {
		throw error(400, "No 'url' search param, unable to proxy image");
	}

	return fetch(imageUrl);
}
