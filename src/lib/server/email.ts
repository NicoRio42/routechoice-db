import { dev } from '$app/environment';
import { BREVO_API_KEY } from '$env/static/private';
import { eq } from 'drizzle-orm';
import { db } from './db/db.js';
import { emailVerificationCodeTable, passwordResetTokenTable } from './db/schema.js';

const BASE_URL = dev ? 'http://localhost:5173' : 'https://routechoice-db.com';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_ADRESS = 'noreply@routechoice-db.com';
const SENDER_NAME = 'Routechoice DB';

export async function sendEmail(
	subject: string,
	htmlContent: string,
	recipientEmailAdress: string,
	recipientName: string
) {
	if (dev) {
		console.log(`Email sent to ${recipientEmailAdress}
    subject: ${subject}
    ${htmlContent}`);
		return;
	}

	const response = await fetch(BREVO_API_URL, {
		method: 'POST',
		headers: {
			'api-key': BREVO_API_KEY,
			'Content-Type': 'application/json',
			'Content-Length': htmlContent.length.toString()
		},
		body: JSON.stringify({
			sender: { email: SENDER_ADRESS, name: SENDER_NAME },
			to: [{ email: recipientEmailAdress, name: recipientName }],
			subject,
			htmlContent
		})
	});

	if (!response.ok) {
		throw new Error(`[BREVO] ${response.status}, ${response.statusText}\n${await response.text()}`);
	} else {
		console.log(`[BREVO] ${response.status}, ${response.statusText}\n${await response.text()}`);
	}
}

export async function sendVerificationCodeEmail(
	fkUser: string,
	userEmail: string,
	userName: string
) {
	await db
		.delete(emailVerificationCodeTable)
		.where(eq(emailVerificationCodeTable.fkUser, fkUser))
		.run();

	const [verificationCode] = await db
		.insert(emailVerificationCodeTable)
		.values({ fkUser })
		.returning();

	const content = `Code: ${verificationCode.code}`;
	await sendEmail('Code pour vérification adresse email', content, userEmail, userName);
}

export async function sendPasswordResetEmail(fkUser: string, userEmail: string, userName: string) {
	await db.delete(passwordResetTokenTable).where(eq(passwordResetTokenTable.fkUser, fkUser)).run();

	const [passwordResetToken] = await db
		.insert(passwordResetTokenTable)
		.values({ fkUser })
		.returning();

	const passwordResetLink = `${BASE_URL}/reset-password/${passwordResetToken.id}`;
	const content = `Lien : ${passwordResetLink}`;
	await sendEmail('Lien pour réinitialisation du mot de passe', content, userEmail, userName);
}
