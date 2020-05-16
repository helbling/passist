<script context="module">
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
</script>

<Siteswap siteswap_input={siteswap_input} {n_jugglers} {fullscreen}/>
