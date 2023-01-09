import { redirect } from '@sveltejs/kit';

export function load() {
	throw redirect(301, '/pattern-list'); // 301 Moved Permanently - https://http.cat/301
}
