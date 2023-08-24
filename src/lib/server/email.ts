import { dev } from '$app/environment';
import { BREVO_API_KEY } from '$env/static/private';

const BASE_URL = dev ? 'http://localhost:5173' : 'https://routechoice-db.com';
const EMAIL_VERIFICATION_URL = `${BASE_URL}/email-verification`;
const PASSWORD_RESET_URL = `${BASE_URL}/reset-password`;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_ADRESS = 'noreply@routechoice-db.com';
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

	const response = await sendEmailViaBrevoFromCloudflareWorker(
		SENDER_ADRESS,
		SENDER_NAME,
		recipientEmailAddress,
		recipientName,
		'Verify your email address',
		content,
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

	const response = await sendEmailViaBrevoFromCloudflareWorker(
		SENDER_ADRESS,
		SENDER_NAME,
		recipientEmailAddress,
		recipientName,
		'Verify your email address',
		content,
		fetch
	);

	console.log('[email confirmation]', response.status, await response.json());
}

async function sendEmailViaBrevoFromCloudflareWorker(
	senderEmailAddress: string,
	senderName: string,
	recipientEmailAddress: string,
	recipientName: string,
	subject: string,
	htmlContent: string,
	fetch: Fetch
) {
	return await fetch(BREVO_API_URL, {
		method: 'POST',
		headers: {
			'api-key': BREVO_API_KEY,
			'Content-Type': 'application/json',
			'Content-Length': htmlContent.length.toString()
		},
		body: JSON.stringify({
			sender: { email: senderEmailAddress, name: senderName },
			to: [{ email: recipientEmailAddress, name: recipientName }],
			subject,
			htmlContent
		})
	});
}
