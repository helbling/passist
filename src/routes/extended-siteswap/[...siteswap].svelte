<script context="module">
	import { defaults, hands2limbs, limbs2hands } from '$lib/passist.mjs';

	export async function load({ url, params }) {
		let nJugglers = parseInt(url.searchParams.get('jugglers'));
		if (!nJugglers)
			nJugglers = defaults.nJugglers;

		return {
			props: {
				siteswapInput: params.siteswap.replace('/', ''),
				nJugglers,
				fullscreen: parseInt(url.searchParams.get('fullscreen')),
			}
		};
	}
</script>
<script>
	import { useLocalStorage, extendedSiteswapUrl } from '$lib/passist.mjs';
	import ExtendedSiteswapPage from '$lib/ExtendedSiteswapPage.svelte';
	import { browser } from '$app/env';
	export let siteswapInput, nJugglers, fullscreen;

	$:  useLocalStorage && siteswapInput && localStorage.setItem("extendedSiteswap", siteswapInput);
	$:  useLocalStorage && nJugglers && localStorage.setItem("nJugglers", nJugglers);

	$: {
		if (browser === true && window && ('history' in window)) {
			const url = extendedSiteswapUrl({
				siteswapInput,
				nJugglers,
				fullscreen,
			});
			history.replaceState({}, '', url);
		}
	}
</script>

<ExtendedSiteswapPage bind:siteswapInput bind:nJugglers bind:fullscreen />
