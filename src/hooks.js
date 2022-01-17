export async function handle({ request, resolve }) {
	const response = await resolve(request);

	const path = request?.url?.pathname || '';

	if (path.match(/\.jif$/)) {
		return {
			...response,
			headers: {
				...response.headers,
				'content-type': 'application/jif+json',
				'access-control-allow-origin': '*',
			}
		};
	} else if (path.match(/^\/images\//)) {
		const headers = {
			...response.headers,
			'access-control-allow-origin': '*',
		};
		const match = path.match(/\.([^.]+)$/);
		const types = {
			png: 'image/png',
			svg: 'image/svg+xml',
			jpg: 'image/jpeg',
		};
		if (match) {
			const type = types[match[1]];
			if (type)
				headers['content-type'] = type;
		}
		return {
			...response,
			headers
		};
	}
	return response;
}
