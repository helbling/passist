<script>
	import { useLocalStorage, siteswapUrl } from '$lib/passist.mjs';
	import SiteswapPage from '$lib/SiteswapPage.svelte';
	import { browser } from '$app/env';

	export let data;
	$: ({ siteswapInput, nJugglers, handsInput, fullscreen } = data);

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
