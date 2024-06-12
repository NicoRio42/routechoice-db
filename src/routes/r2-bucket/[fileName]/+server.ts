import { dev } from '$app/environment';

export async function GET({ params, platform }) {
	// TODO remove this route when https://github.com/cloudflare/workers-sdk/issues/3687 is resolved
	if (!dev) return new Response(null, { status: 404 });

	const object = await platform?.env?.R2_BUCKET.get(params.fileName);
	if (object === null || object === undefined) return new Response(null, { status: 404 });

	return new Response(object.body as unknown as ReadableStream, { status: 200 });
}
