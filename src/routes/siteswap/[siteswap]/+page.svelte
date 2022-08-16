<script context="module">
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
			props: {
				siteswapInput: params.siteswap,
				nJugglers,
				handsInput,
				fullscreen: parseInt(url.searchParams.get('fullscreen')),
			}
		};
	}
</script>
<script>
	import { useLocalStorage, siteswapUrl } from '$lib/passist.mjs';
	import SiteswapPage from '$lib/SiteswapPage.svelte';
	import { browser } from '$app/env';
	export let siteswapInput, nJugglers, handsInput, fullscreen;

	$:  useLocalStorage && siteswapInput && localStorage.setItem("siteswap", siteswapInput);
	$:  useLocalStorage && nJugglers && localStorage.setItem("nJugglers", nJugglers);

	$: {
		if (browser === true && window && ('history' in window)) {
			const url = siteswapUrl({
				siteswapInput,
				nJugglers,
				handsInput,
				fullscreen,
			});
			history.replaceState({}, '', url);
		}
	}
</script>

<SiteswapPage bind:siteswapInput bind:nJugglers bind:handsInput bind:fullscreen />
