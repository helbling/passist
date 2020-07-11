<script>
	//	import SiteswapPage from '../../components/SiteswapPage.svelte';
	import { defaults, siteswapUrl } from '../../components/passist.js';
	import { goto } from '@sapper/app';

	const useLocalStorage = process.browser === true && 'localStorage' in window;

	if (useLocalStorage) {
		goto(siteswapUrl({
			siteswap_input: (localStorage.getItem('siteswap') || defaults.siteswap),
			n_jugglers: (localStorage.getItem('n_jugglers') || 2),
		}));
	}
</script>

<!-- server should return empty siteswap to avoid flashing some overwritten default -->
<!-- <SiteswapPage siteswap_input="" n_jugglers=2 /> -->
