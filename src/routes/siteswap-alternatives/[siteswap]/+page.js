import { defaults } from '$lib/passist.mjs';

export async function load({ url, params }) {
	return {
		siteswapInput: params.siteswap,
		nJugglers: parseInt(url.searchParams.get('jugglers')) || defaults.nJugglers,
		handsInput: url.searchParams.get('hands') || ''
	}
}
