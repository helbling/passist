<script>
	import { useLocalStorage, extendedSiteswapUrl } from '$lib/passist.mjs';
	import ExtendedSiteswapPage from '$lib/ExtendedSiteswapPage.svelte';
	import { browser } from '$app/environment';

	export let data;
	let siteswapInput, nJugglers, fullscreen;
	({siteswapInput, nJugglers, fullscreen} = data);

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
