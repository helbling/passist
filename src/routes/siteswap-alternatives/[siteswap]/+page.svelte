<script>
	import SiteswapAlternativesPage from '$lib/SiteswapAlternativesPage.svelte';
	import { useLocalStorage, siteswapAlternativesUrl } from '$lib/passist.mjs';
	import { browser } from '$app/env';

	export let data;
	$: ({siteswapInput, nJugglers, handsInput} = data);

	let exclude = nJugglers == 2 ? '3 4.4' : '';

	$:  useLocalStorage && siteswapInput && localStorage.setItem("siteswap-alternatives/siteswap", siteswapInput);
	$:  useLocalStorage && nJugglers && localStorage.setItem("siteswap-alternatives/nJugglers", nJugglers);

	$: {
		if (browser === true && window && ('history' in window)) {
			const url = siteswapAlternativesUrl({
				siteswapInput,
				nJugglers,
				handsInput,
			});
			history.replaceState({}, '', url);
		}
	}
</script>

<svelte:head>
	<title>passist - Siteswap - Alternatives</title>
</svelte:head>

<SiteswapAlternativesPage bind:siteswapInput bind:nJugglers bind:handsInput bind:exclude />
