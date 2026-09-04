import { defaults } from '$lib/passist.mjs';

export async function load({ url, params }) {
	let nJugglers = parseInt(url.searchParams.get('jugglers'));
	if (!nJugglers)
		nJugglers = defaults.nJugglers;
	if (nJugglers > 26) // limit number of jugglers - server might crash on too high number and we run out of uppercase characters..
		nJugglers = 26;

	return {
		siteswapInput: params.siteswap,
		nJugglers,
		handsInput: url.searchParams.get('hands') || ''
	}
}
