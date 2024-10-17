<script>
	import { appName } from '$lib/passist.mjs';
	import GeneratorPage from '$lib/GeneratorPage.svelte';
	import { useLocalStorage, siteswapGeneratorUrl } from '$lib/passist.mjs';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	export let data;
	let params = data;
	if (useLocalStorage && Object.keys(params).length == 0) {
		const propsJSON = localStorage.getItem('siteswapGeneratorParams');
		if (propsJSON) {
			try {
				const props = JSON.parse(propsJSON);
				params = props;
				// goto(siteswapGeneratorUrl(props));
			} catch(e) {
				// ignore
			}
		}
	}
</script>

<svelte:head>
	<title>{appName} - Generator</title>
</svelte:head>

<GeneratorPage bind:params />
