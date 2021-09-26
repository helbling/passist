export async function get({ params }) {
	return {
		status: 301,
		body: 'Moved Permanently',
		headers: {
			Location: '/siteswap-generator',
		}
	};
}
