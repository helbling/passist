import { defaults, hands2limbs, limbs2hands } from '$lib/passist.mjs';

export async function load({ url, params }) {
	let nJugglers = parseInt(url.searchParams.get('jugglers'));
	if (!nJugglers)
		nJugglers = defaults.nJugglers;

	return {
		siteswapInput: params.siteswap.replace('/', ''),
		nJugglers,
		fullscreen: parseInt(url.searchParams.get('fullscreen')),
	};
}
