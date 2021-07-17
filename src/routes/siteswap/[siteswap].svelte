<script context="module">
	import { defaults, hands2limbs, limbs2hands } from '$lib/passist.mjs';

	export async function load({ page }) {
		let nJugglers = parseInt(page.query.get('jugglers'));
		if (!nJugglers)
			nJugglers = defaults.nJugglers;
		let handsInput = page.query.get('hands');
		const limbs = hands2limbs(handsInput, nJugglers);
		if (limbs)
			handsInput = limbs2hands(limbs);

		return {
			props: {
				siteswapInput: page.params.siteswap,
				nJugglers,
				handsInput,
				fullscreen: parseInt(page.query.get('fullscreen')),
			}
		};
	}
</script>
<script>
	import { useLocalStorage, siteswapUrl } from '$lib/passist.mjs';
	import SiteswapPage from '../../components/SiteswapPage.svelte';
	import { browser } from '$app/env';
	export let siteswapInput, nJugglers, handsInput, fullscreen;
	let query, url;

	$:  useLocalStorage && siteswapInput && localStorage.setItem("siteswap", siteswapInput);
	$:  useLocalStorage && nJugglers && localStorage.setItem("nJugglers", nJugglers);

	$: {
		if (browser === true && window && ('history' in window)) {
			url = siteswapUrl({
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
