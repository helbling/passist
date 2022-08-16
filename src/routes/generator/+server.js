export async function GET({ params }) {
	return new Response('Moved Permanently', {
		status: 301,
		headers: {
			Location: '/siteswap-generator',
		}
	});
}
