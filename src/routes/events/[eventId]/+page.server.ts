import { redirect } from '@sveltejs/kit';

export function load({ params: { eventId } }) {
	console.warn('DO NOT REDIRECT TO /events/:eventID');
	throw redirect(302, `/events/${eventId}/map`);
}
