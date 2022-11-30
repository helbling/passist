<script>
	import InputField from '$lib/InputField.svelte';
	import PatternSiteswap from '$lib/PatternSiteswap.svelte';
	import PatternSimultaneousSiteswap from '$lib/PatternSimultaneousSiteswap.svelte';
	import { defaults } from '$lib/passist.mjs';

	export let nJugglers = defaults.nJugglers;
	export let notation = 'simultaneous';
	let component = PatternSiteswap;

	const notations = [
		{
			key:  'siteswap',
			text: 'Global Siteswap',
		},
		{
			key:  'simultaneous',
			text: 'Simult. Siteswaps',
			minJugglers: 2,
		},
		// prechac: 'Prechac',
		// social: 'Social Siteswap',
	];
	let notationTexts = {};
	$: notationTexts = notations.filter(
		(n) => nJugglers >= (n.minJugglers ?? 1)
	).map((n) => [n.key, n.text]);
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

<svelte:component {nJugglers} this={component}/>
