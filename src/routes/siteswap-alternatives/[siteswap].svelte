<script context="module">
	import { defaults } from '$lib/passist.mjs';

	export async function load({ page }) {

		return { props: {
			siteswapInput: page.params.siteswap,
			nJugglers: parseInt(page.query.get('jugglers')) || defaults.nJugglers,
			handsInput: page.query.get('hands') || ''
		} }
	}
</script>

<script>
	import SiteswapAlternativesPage from '$lib/SiteswapAlternativesPage.svelte';
	import { useLocalStorage, siteswapAlternativesUrl } from '$lib/passist.mjs';
	import { browser } from '$app/env';

	export let siteswapInput, nJugglers, handsInput;
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
