<script>
	import Icon from '$lib/Icon.svelte';
	import InputField from '$lib/InputField.svelte';
	import ThrowStyleInput from '$lib/ThrowStyleInput.svelte';
	import { jugglerName, useLocalStorage } from '$lib/passist.mjs';

	export let siteswapInputs = [];
	export let nJugglers = 2;
	export let idPrefix;
	export let siteswapValid;
	export let showNJugglers = true;
	export let throwStyles = [];
	export let jif = [];

	let showSettings = false;

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

</script>

<style>
	.show-settings-button {
		margin-bottom: 1em;
		margin-right: 1em;
	}
	:global(.pure-button svg) {
		height:1.5em
	}
</style>

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

	<button
		class="pure-button show-settings-button"
		class:pure-button-active={showSettings}
		on:click={() => showSettings = !showSettings }
		title="{showSettings ? 'hide' : 'show'} settings"
	>
		<Icon type=options />
	</button>
</div>

{#if showSettings}
		<ThrowStyleInput
			bind:throwStyles
			bind:nJugglers
			bind:idPrefix
			bind:jif
			bind:showSettings
		/>

	
	{:else} <!-- !showSettings -->
	<div class="pure-form form-inline">
		<ThrowStyleInput
			bind:throwStyles
			bind:nJugglers
			bind:idPrefix
			bind:jif
			bind:showSettings
		/>
	</div>
{/if}
