import ExtendedSiteswap from '$lib/extended_siteswap.mjs';
import { redirect } from '@sveltejs/kit';

export async function load({ url, params }) {
	// redirect <..|..> notation
	const inputStr = decodeURIComponent(params.input);
	if (inputStr.match(/^<.*\|.*>$/)) {
		const redirectUrl = '/extended-siteswap/' + ExtendedSiteswap.stringToUrl(inputStr);
		throw redirect(307, redirectUrl);
	}

	return { url, params }
}
