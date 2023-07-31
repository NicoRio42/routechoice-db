function isInstanceOfRedirect(instance: any) {
	return typeof instance?.status === 'number' && typeof instance?.location === 'string';
}

function isInstanceOfHttpError(instance: any) {
	return typeof instance?.status === 'number' && typeof instance?.message === 'string';
}

export function reThrowRedirectsAndErrors(e: unknown) {
	if (isInstanceOfHttpError(e) || isInstanceOfRedirect(e)) {
		throw e;
	}
}
