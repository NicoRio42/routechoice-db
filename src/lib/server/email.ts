import { dev } from '$app/environment';

const BASE_URL = dev ? 'http://localhost:5173' : 'https://routechoice-db.pages.dev';
const EMAIL_VERIFICATION_URL = `${BASE_URL}/email-verification`;
const PASSWORD_RESET_URL = `${BASE_URL}/reset-password`;
const MAILCHANNELS_API_URL = 'https://api.mailchannels.net/tx/v1/send';
const SENDER_ADRESS = 'no-reply@routechoice-db.pages.dev';
const SENDER_NAME = 'Routechoice DB';

type Fetch = typeof fetch;

export async function sendEmailVerificationEmail(
	recipientEmailAddress: string,
	recipientName: string,
	token: string,
	fetch: Fetch
) {
	if (dev) {
		console.log(`Email verification url for ${recipientName}: ${EMAIL_VERIFICATION_URL}/${token}`);
		return;
	}

	const content = `Please click this <a href="${EMAIL_VERIFICATION_URL}/${token}" target="_blank">link</a> to verify your email address.	
		If you encourter a problem, please copy the link below to your url bar:
		${EMAIL_VERIFICATION_URL}/${token}
	`;

	const response = await sendEmailViaMailChannelsFromCloudflareWorker(
		SENDER_ADRESS,
		SENDER_NAME,
		recipientEmailAddress,
		recipientName,
		'Verify your email address',
		content,
		'text/html',
		fetch
	);

	console.log('[email confirmation]', response.status, await response.json());
}

export async function sendPasswordResetEmail(
	recipientEmailAddress: string,
	recipientName: string,
	token: string,
	fetch: Fetch
) {
	if (dev) {
		console.log(`Email verification url for ${recipientName}: ${PASSWORD_RESET_URL}/${token}`);
		return;
	}

	const content = `Please click this <a href="${PASSWORD_RESET_URL}/${token}" target="_blank">link</a> to reset your password.	
		If you encourter a problem, please copy the link below to your url bar:
		${PASSWORD_RESET_URL}/${token}
	`;

	const response = await sendEmailViaMailChannelsFromCloudflareWorker(
		SENDER_ADRESS,
		SENDER_NAME,
		recipientEmailAddress,
		recipientName,
		'Verify your email address',
		content,
		'text/html',
		fetch
	);

	console.log('[email confirmation]', response.status, await response.json());
}

async function sendEmailViaMailChannelsFromCloudflareWorker(
	senderEmailAddress: string,
	senderName: string,
	recipientEmailAddress: string,
	recipientName: string,
	subject: string,
	content: string,
	contentType: 'text/html' | 'text/plain',
	fetch: Fetch
) {
	return await fetch(MAILCHANNELS_API_URL, {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			personalizations: [{ to: [{ email: recipientEmailAddress, name: recipientName }] }],
			from: { email: senderEmailAddress, name: senderName },
			subject: subject,
			content: [{ type: contentType, value: content }]
		})
	});
}
