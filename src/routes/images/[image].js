import { promises } from 'fs';

export async function get({ params }) {
	const { image } = params;
	const strippedImage = image.replace(/[^a-zA-Z0-9._-]/, ''); // better be save to avoid data leaks
	try {
		return {
			headers: {
				'content-type': 'application/octet-stream', // will be replaced by src/hooks.js
			},
			body: (await promises.readFile(`static/_images/${strippedImage}`)),
		};
	} catch {
		return {
			status: 404
		};
	}
}
