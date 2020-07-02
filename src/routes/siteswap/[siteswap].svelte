<script context="module">
	import { defaults, siteswapUrl } from '../../components/passist.js';
	export async function preload({ params, query }) {
		return {
			siteswap_input: params.siteswap,
			n_jugglers: parseInt(query.n_jugglers),
			fullscreen: parseInt(query.fullscreen),
		};
	}
</script>
<script>
	import Siteswap from '../../components/Siteswap.svelte';
	export let siteswap_input, n_jugglers, fullscreen;
	let query, url;

	const useLocalStorage = process.browser === true && 'localStorage' in window;
	$:  useLocalStorage && siteswap_input && localStorage.setItem("siteswap", siteswap_input);
	$:  useLocalStorage && n_jugglers && localStorage.setItem("n_jugglers", n_jugglers);

	$: {
		url = siteswapUrl({
			siteswap_input: siteswap_input,
			n_jugglers: n_jugglers,
			fullscreen: fullscreen,
		});
		if (process.browser === true && ('history' in window)) {
			history.replaceState({}, '',url);
		}
	}
</script>

<Siteswap bind:siteswap_input={siteswap_input} bind:n_jugglers={n_jugglers} bind:fullscreen={fullscreen} {url} />
