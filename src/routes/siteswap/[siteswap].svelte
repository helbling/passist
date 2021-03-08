<script context="module">
	import { defaults, hands2limbs, limbs2hands } from '../../components/passist.js';

	export async function preload({ params, query }) {
		let nJugglers = parseInt(query.jugglers);
		if (!nJugglers)
			nJugglers = defaults.nJugglers;
		let handsInput = query.hands;
		const limbs = hands2limbs(handsInput, nJugglers);
		if (limbs)
			handsInput = limbs2hands(limbs);

		return {
			siteswapInput: params.siteswap,
			nJugglers,
			handsInput,
			fullscreen: parseInt(query.fullscreen),
		};
	}
</script>
<script>
	import { useLocalStorage, siteswapUrl } from '../../components/passist.js';
	import SiteswapPage from '../../components/SiteswapPage.svelte';
	export let siteswapInput, nJugglers, handsInput, fullscreen;
	let query, url;

	$:  useLocalStorage && siteswapInput && localStorage.setItem("siteswap", siteswapInput);
	$:  useLocalStorage && nJugglers && localStorage.setItem("nJugglers", nJugglers);

	$: {
		if (process.browser === true && ('history' in window)) {
			url = siteswapUrl({
				siteswapInput,
				nJugglers,
				handsInput,
				fullscreen,
			});
			history.replaceState({}, '', url);
		}
	}
</script>

<SiteswapPage bind:siteswapInput bind:nJugglers bind:handsInput bind:fullscreen {url} />
