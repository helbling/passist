import { promises } from 'fs';
import { baseUrl } from '$lib/passist';

export async function get() {
	return {
		headers:{
			'content-type': 'text/html',
		},
		body:
			(await promises.readFile(`static/api/_causal-diagram-widget-demo.html`))
			.toString()
			.replaceAll('https://passist.org', baseUrl),
	};
}
