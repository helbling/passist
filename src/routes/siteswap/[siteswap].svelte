<script context="module">
	import { defaults, useLocalStorage, siteswapUrl } from '../../components/passist.js';
	export async function preload({ params, query }) {
		const nJugglers = parseInt(query.nJugglers);
		return {
			siteswapInput: params.siteswap,
			nJugglers: nJugglers ? nJugglers : defaults.nJugglers,
			fullscreen: parseInt(query.fullscreen),
		};
	}
</script>
<script>
	import SiteswapPage from '../../components/SiteswapPage.svelte';
	export let siteswapInput, nJugglers, fullscreen;
	let query, url;

	$:  useLocalStorage && siteswapInput && localStorage.setItem("siteswap", siteswapInput);
	$:  useLocalStorage && nJugglers && localStorage.setItem("nJugglers", nJugglers);

	$: {
		if (process.browser === true && ('history' in window)) {
			url = siteswapUrl({
				siteswapInput: siteswapInput,
				nJugglers: nJugglers,
				fullscreen: fullscreen,
			});
			history.replaceState({}, '',url);
		}
	}
</script>

<SiteswapPage bind:siteswapInput={siteswapInput} bind:nJugglers={nJugglers} bind:fullscreen={fullscreen} {url} />
