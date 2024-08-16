/**
 * API client for mailchannels API on cloduflare workers
 * Licensed under MIT
 * 2023 maddsua
 */

interface MailchannelsReponse {
	errors: string[];
}

export interface SendProps {
	sender: SenderIdentity;
	subject: string;
	recepients: string[];
	content: string;
}

export interface SenderIdentity {
	email: string;
	name: string;
}

export const sendEmail = async (opts: SendProps): Promise<void> => {

	const sendRequest = new Request('https://api.mailchannels.net/tx/v1/send', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify({
			subject: opts.subject,
			from: {
				email: opts.sender.email,
				name: opts.sender.name,
			},
			personalizations: [
				{
					to: opts.recepients.map(email => ({ email })),
				}
			],
			content: [
				{
					type: 'text/html',
					value: opts.content
				}
			]
		}),
	});

	const response = await fetch(sendRequest).catch(() => null);
	if (!response) {
		throw new Error('Network error. Failed to contacts mailchannels');
	}

	if (response.ok) {
		return;
	}

	const responseText = await response.text();
	if (responseText.trim() === 'null') {
		return;
	}

	if (!response.headers.get('content-type')?.includes('json')) {
		throw new Error(`Mailchannels API rejected: ${responseText}`);
	}

	const jsonResponse = await new Promise<MailchannelsReponse>(resolve => resolve(JSON.parse(responseText))).catch(() => null);
	if (!jsonResponse) {
		throw new Error(`Mailchannels API rejected: ${responseText}`);
	}

	throw new Error(`Mailchannels API rejected: ${jsonResponse.errors.join('; ')}`);
};
