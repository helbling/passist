import { redirect } from '@sveltejs/kit';

export function load() {
	throw redirect(301, '/library'); // 301 Moved Permanently - https://http.cat/301
}
