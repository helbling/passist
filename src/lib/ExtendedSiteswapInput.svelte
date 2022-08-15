<script>
	import InputField from '$lib/InputField.svelte';
	import Icon from '$lib/Icon.svelte';
	import { jugglerName, defaultLimbs } from '$lib/passist.mjs';

	export let siteswapInput;
	export let nJugglers;
	export let showNJugglers = true;
	export let idPrefix;
	export let siteswapValid;

</script>

<div class="pure-form form-inline">
	<InputField
		bind:value={siteswapInput}
		id={idPrefix + "SiteswapInput"}
		label=Siteswap
		type=search
		valid={siteswapValid || !siteswapInput}
		attr={{
			class:     'siteswap',
			inputmode: 'verbatim',
			pattern:   '[0-9a-zA-Z ]+',
			size:      10,
		}}
		/>

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
</div>
