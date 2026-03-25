import { SecretsStore } from './secrets-store';

export { SecretsStore };

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// Route /secrets/* to the SecretsStore DO
		if (url.pathname.startsWith('/secrets/')) {
			const userId = url.searchParams.get('user_id');
			if (!userId) {
				return new Response('Missing user_id', { status: 400 });
			}
			const id = env.SECRETS_STORE.idFromName(userId);
			const stub = env.SECRETS_STORE.get(id);
			return stub.fetch(request);
		}

		return new Response('Not found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;
