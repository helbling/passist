import { promises } from 'fs';
import { baseUrl } from '$lib/passist';

export async function GET() {
	return {
		headers:{
			'content-type': 'text/html',
		},
		body:
			(await promises.readFile(`static/api/_animation-widget-demo.html`))
			.toString()
			.replaceAll('https://passist.org', baseUrl),
	};
}
