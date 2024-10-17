<script>
	import GeneratorPage from '$lib/GeneratorPage.svelte';
	import { useLocalStorage, siteswapGeneratorUrl } from '$lib/passist.mjs';
	import { goto } from '$app/navigation';

	let params = {};
	if (useLocalStorage) {
		const propsJSON = localStorage.getItem('siteswapGeneratorParams');
		if (propsJSON) {
			try {
				const props = JSON.parse(propsJSON);
				params = props;
				goto(siteswapGeneratorUrl(params), { replaceState: true });
			} catch(e) {
				// ignore
			}
		}
	}
</script>

<svelte:head>
	<title>passist - passing siteswap assistant</title>
</svelte:head>

<GeneratorPage bind:params />
