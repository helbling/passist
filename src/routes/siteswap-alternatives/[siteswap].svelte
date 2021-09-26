<script context="module">
	import { defaults } from '$lib/passist.mjs';

	export async function load({ page }) {

		return { props: {
			siteswapInput: page.params.siteswap,
			nJugglers: parseInt(page.query.get('jugglers')) || defaults.nJugglers,
		} }
	}
</script>

<script>
	import SiteswapAlternativesPage from '$lib/SiteswapAlternativesPage.svelte';

	export let siteswapInput, nJugglers;
</script>

<svelte:head>
	<title>passist - Siteswap - Alternatives</title>
</svelte:head>

<SiteswapAlternativesPage bind:siteswapInput bind:nJugglers />
