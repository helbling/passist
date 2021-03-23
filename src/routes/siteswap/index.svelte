<script>
	//	import SiteswapPage from '../../components/SiteswapPage.svelte';
	import { defaults, useLocalStorage, siteswapUrl } from '../../components/passist.js';
	import { goto } from '$app/navigation';

	if (useLocalStorage) {
		goto(siteswapUrl({
			siteswapInput: (localStorage.getItem('siteswap') || defaults.siteswap),
			nJugglers: (localStorage.getItem('nJugglers') || 2),
		}));
	}
</script>

<!-- server should return empty siteswap to avoid flashing some overwritten default -->
<!-- <SiteswapPage siteswapInput="" nJugglers=2 /> -->
