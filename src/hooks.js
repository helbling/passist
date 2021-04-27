export async function handle({ request, render }) {
	const response = await render(request);

	// TODO:
	// ensure Access-Control-Allow-Origin * for *.jif and /images/*
	// this header is already set in development environment, ist is also there in production?
	//
	if (request.path.match(/\.jif$/)) {
		return {
			...response,
			headers: {
				...response.headers,
				'Content-Type': 'application/jif+json'
			}
		};
	}
	return response;
}
