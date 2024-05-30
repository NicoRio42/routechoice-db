import { error, text } from '@sveltejs/kit';

export async function GET({ url, fetch }) {
	const urlToProxy = url.searchParams.get('urlToProxy');
	if (urlToProxy === null) throw error(404);

	// Awaiting the response because of decoding issues
	return fetch(urlToProxy);
}
