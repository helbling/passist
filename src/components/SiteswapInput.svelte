<script>
import InputField from './InputField.svelte';

export let siteswap_input;
export let n_jugglers;
export let id_prefix;
export let valid;

</script>

<div class=form-inline>
	<InputField
		bind:value={siteswap_input}
		id={id_prefix + "siteswap_input"}
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
		bind:value={n_jugglers}
		id={id_prefix + "n_jugglers"}
		type=number
		label='👥'
		title='Number of jugglers'
		min=1
		max=9
		/>
</div>
