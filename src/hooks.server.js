export async function handle({ event, resolve }) {
	const response = await resolve(event);

	const path = event.url?.pathname || '';

	if (path.match(/\.jif$/)) {
		response.headers.set('content-type', 'application/jif+json');
		response.headers.set('access-control-allow-origin', '*');
	} else if (path.match(/^\/images\//)) {
		response.headers.set('access-control-allow-origin', '*');

		const match = path.match(/\.([^.]+)$/);
		const types = {
			png: 'image/png',
			svg: 'image/svg+xml',
			jpg: 'image/jpeg',
		};
		if (match) {
			const type = types[match[1]];
			if (type)
				response.headers.set('content-type', type);
		}
	}
	return response;
}
