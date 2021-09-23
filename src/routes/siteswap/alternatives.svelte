<script context="module">
	export async function load({ page }) {
		return { props: {
			siteswapInput: page.query.get('siteswap'),
			nJugglers: page.query.get('jugglers'),

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
