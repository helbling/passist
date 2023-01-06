<script>
	import InputField from '$lib/InputField.svelte';
	import PatternSiteswap from '$lib/PatternSiteswap.svelte';
	import PatternSimultaneousSiteswap from '$lib/PatternSimultaneousSiteswap.svelte';
	import { defaults, useLocalStorage } from '$lib/passist.mjs';

	export let nJugglers = defaults.nJugglers;
	export let notation = defaults.notation;
	export let init = undefined;

	if (init) {
		const nJugglersUrl = parseInt(init.url.searchParams.get('jugglers'));
		if (nJugglersUrl && nJugglersUrl >= 1)
			nJugglers = nJugglersUrl;
		// else if (notation == 'simultaneous' && init.params.input)
		//	nJugglers = init.params.input.split('/').length;
	} else if (notation) {
			notation = localStorage.getItem('notation') || defaults.notation;
	}
	$:  useLocalStorage && notation && localStorage.setItem("notation", notation);
	$:  useLocalStorage && nJugglers && localStorage.setItem("nJugglers", nJugglers);

	let component = PatternSiteswap;
	const notations = [
		{
			key:  'siteswap',
			text: 'Global Siteswap',
		},
		{
			key:  'simultaneous',
			text: 'Simult. Siteswaps',
		},
		// prechac: 'Prechac',
		// social: 'Social Siteswap',
	];
	const notationTexts = notations.map((n) => [n.key, n.text]);
	$: {
		component = {
			siteswap: PatternSiteswap,
			simultaneous: PatternSimultaneousSiteswap,
		}[notation] ?? PatternSiteswap;
	}
</script>

<div class="pure-form form-inline">
	<InputField
		bind:value={nJugglers}
		id={"nJugglers"}
		type=number
		label='👥'
		title='Number of jugglers'
		min=1
		max=9
		/>

	<InputField
		bind:value={notation}
		id={"notation"}
		type=select
		values={notationTexts}
		label='Notation'
		title='Pattern notation'
		/>
</div>

<svelte:component this={component} bind:nJugglers {init} />
