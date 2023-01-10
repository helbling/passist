<script>
	import InputField from '$lib/InputField.svelte';
	import { jugglerName } from '$lib/passist.mjs';

	export let siteswapInputs = [];
	export let nJugglers = 2;
	export let idPrefix;
	export let siteswapValid;
	export let showNJugglers = true;
	export let individualPatterns = false;

	// if (siteswapInputs.length > 1)
	//     individualPatterns = !siteswapInputs.every(s => s == siteswapInputs[0]);

$: {
	// set unset input field to first input
	const firstInput = siteswapInputs[0];
	if (firstInput) {
		for (let i = 1; i < nJugglers; i++) {
			if (siteswapInputs[i] === undefined)
				siteswapInputs[i] = firstInput;
		}
	}
}
$: {
	// make sure length of siteswapInputs is not greater than nJugglers
	if (nJugglers < siteswapInputs.length)
		siteswapInputs = siteswapInputs.slice(0, nJugglers);
}

$: {
	if (!individualPatterns)
		siteswapInputs = Array(nJugglers).fill(siteswapInputs[0]);
}

</script>

<div class="pure-form form-inline">

{#if showNJugglers}
	<InputField
		bind:value={nJugglers}
		id={idPrefix + "NJugglers"}
		type=number
		label='👥'
		title='Number of jugglers'
		min=1
		max=9
		/>
{/if}

{#if nJugglers > 1}
<InputField
	bind:value={individualPatterns}
	id={idPrefix + "individualPatterns"}
	type=checkbox
	label='individual'
	title='individual patterns'
	/>
{/if}

{#if individualPatterns}
	{#each Array(nJugglers) as _,i }
	<InputField
		bind:value={siteswapInputs[i]}
		id={idPrefix + "SiteswapInput" + i}
		label={jugglerName(i)}
		type=search
		valid={siteswapValid || !siteswapInputs[i]}
		attr={{
			class:     'siteswap',
			inputmode: 'verbatim',
			pattern:   '[0-9a-zA-Z ]+',
			size:      10,
		}}
		on:input={() => { siteswapInputs = siteswapInputs }}
		/>
	{/each}

{:else}
	<InputField
		bind:value={siteswapInputs[0]}
		id={idPrefix + "SiteswapInput"}
		label='Siteswap'
		type=search
		valid={siteswapValid || !siteswapInputs[0]}
		attr={{
			class:     'siteswap',
			inputmode: 'verbatim',
			pattern:   '[0-9a-zA-Z ]+',
			size:      10,
		}}
		/>

{/if}

</div>
