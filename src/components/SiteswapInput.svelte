<script>
import InputField from './InputField.svelte';

export let siteswapInput;
export let nJugglers;
export let idPrefix;
export let valid;

</script>

<div class=form-inline>
	<InputField
		bind:value={siteswapInput}
		id={idPrefix + "SiteswapInput"}
		label=Siteswap
		type=search
		bind:valid={valid}
		attr={{
			inputmode: 'verbatim',
			pattern:   '[0-9a-zA-Z ]+',
			size:      10,
		}}
		/>
	<InputField
		bind:value={nJugglers}
		id={idPrefix + "NJugglers"}
		type=number
		label='👥'
		title='Number of jugglers'
		min=1
		max=9
		/>
</div>
