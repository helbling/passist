<script context="module">
	export async function preload({ params, query }) {
		return {
			siteswap_input: params.siteswap,
			n_jugglers: query.n_jugglers,
		};
	}
</script>
<script>
	import Siteswap from '../../components/Siteswap.svelte';
	export let siteswap_input, n_jugglers;
</script>

<Siteswap siteswap_input={siteswap_input} n_jugglers={n_jugglers}/>
