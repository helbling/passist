<script>
	import { defaults, useLocalStorage, siteswapUrl } from '$lib/passist.mjs';
	import { goto } from '$app/navigation';

	goto('/extended-siteswap/abc/def?foo=bar'); // NOCOMMIT
	/*
	if (useLocalStorage) {
		goto(siteswapUrl({
			siteswapInput: (localStorage.getItem('siteswap') || defaults.siteswap),
			nJugglers: (localStorage.getItem('nJugglers') || 2),
		}));
	}
	 */
</script>

<!-- server should return empty siteswap to avoid flashing some overwritten default -->
<!-- <SiteswapPage siteswapInput="" nJugglers=2 /> -->
