<script>
	import { useLocalStorage, extendedSiteswapUrl } from '$lib/passist.mjs';
	import ExtendedSiteswapPage from '$lib/ExtendedSiteswapPage.svelte';
	import { browser } from '$app/environment';

	export let data;
	let siteswapInputs, nJugglers, fullscreen;
	({siteswapInputs, nJugglers, fullscreen} = data);

	// $:  useLocalStorage && siteswapInputs && localStorage.setItem("extendedSiteswap", siteswapInputs);
	// $:  useLocalStorage && nJugglers && localStorage.setItem("nJugglers", nJugglers);

	$: {
		if (browser === true && window && ('history' in window)) {
			const url = extendedSiteswapUrl({
				siteswapInputs,
				nJugglers,
				fullscreen,
			});
			history.replaceState({}, '', url);
		}
	}
</script>

<ExtendedSiteswapPage bind:siteswapInputs bind:nJugglers bind:fullscreen />
