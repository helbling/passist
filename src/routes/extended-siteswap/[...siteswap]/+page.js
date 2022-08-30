import { defaults, hands2limbs, limbs2hands } from '$lib/passist.mjs';
import ExtendedSiteswap from '$lib/extended_siteswap.mjs';

export async function load({ url, params }) {
	const path = ExtendedSiteswap.stringToUrl(params.siteswap);
	let siteswapInputs = path.split('/');

	let nJugglers = parseInt(url.searchParams.get('jugglers'));
	if (!nJugglers)
		nJugglers = siteswapInputs.length;
	if (nJugglers <= 0)
		nJugglers = defaults.nJugglers;

	return {
		siteswapInputs,
		nJugglers,
		fullscreen: parseInt(url.searchParams.get('fullscreen')),
	};
}
