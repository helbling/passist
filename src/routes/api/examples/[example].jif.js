import { promises } from 'fs';

export async function get({ params }) {
    const { example } = params;
	const strippedExample = example.replace(/[^a-zA-Z0-9._-]/, ''); // better be save to avoid data leaks
	try {
		return {
			body: await promises.readFile(`static/api/_examples/${strippedExample}.jif`),
		};
	} catch {
		return {
			status: 404
		};
	}
}
