<script>
	import { useLocalStorage, siteswapUrl } from '$lib/passist.mjs';
	import SiteswapPage from '$lib/SiteswapPage.svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	export let data;
	let siteswapInput, nJugglers, handsInput, fullscreen;
	({ siteswapInput, nJugglers, handsInput, fullscreen } = data);

	$:  useLocalStorage && siteswapInput && localStorage.setItem("siteswap", siteswapInput);
	$:  useLocalStorage && nJugglers && localStorage.setItem("nJugglers", nJugglers);

	$: {
		if (browser === true && window && location) {
			const url = siteswapUrl({
				siteswapInput,
				nJugglers,
				handsInput,
				fullscreen,
			});
			if (location.pathname + location.search != url) {
				goto(url, { replaceState: true, keepFocus:true } );
			}
		}
	}
</script>

<SiteswapPage bind:siteswapInput bind:nJugglers bind:handsInput bind:fullscreen />
