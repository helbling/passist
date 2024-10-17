import { defaults, hands2limbs, limbs2hands } from '$lib/passist.mjs';

export async function load({ url, params }) {
	let nJugglers = parseInt(url.searchParams.get('jugglers'));
	if (!nJugglers)
		nJugglers = defaults.nJugglers;
	let handsInput = url.searchParams.get('hands');
	const limbs = hands2limbs(handsInput, nJugglers);
	if (limbs)
		handsInput = limbs2hands(limbs);

	return {
		siteswapInput: params.siteswap == '-' ? '' : params.siteswap,
		nJugglers,
		handsInput,
		fullscreen: parseInt(url.searchParams.get('fullscreen')),
	};
}
