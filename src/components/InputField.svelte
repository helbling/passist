<script>

export let value;
export let id;
export let type;
export let title;
export let label;
export let min = undefined;
export let max = undefined;
export let placeholder = undefined;
export let attr = {};

if (!title)
	title = label;

let input_attr = {
	type:      type,
	id:        id,
	class:    'form-control',
}

if (type == 'number') {
	input_attr.inputmode = 'number';
	input_attr.min = min ? min : 0;
	if (max)
		input_attr.max = max;
	input_attr.class += (max && max < 10) ? ' digit' : ' twodigit';
} else {
	input_attr.placeholder = placeholder ? placeholder : label;
	for (const k in attr)
		input_attr[k] = attr[k];
}

</script>

<style>
	.input-group { margin-right:1em; margin-bottom:1em; width:auto }
	input[type="search"]::-webkit-search-cancel-button { -webkit-appearance: searchfield-cancel-button }
	input[type="number"].digit    { width:3.5em !important }
	input[type="number"].twodigit { width:5em !important }
</style>


<label class=sr-only for={id}>{title}</label>
<div class="input-group {id}">
	<div class=input-group-prepend>
		<div class="input-group-text" {title}>
			{label}
		</div>
	</div>
	{#if type == 'number'}
		<input
			{id}
			type=number
			bind:value={value}
			min={min ? min : 0}
			{max}
			class="form-control {max && max < 10 ? 'digit' : 'twodigit'}"
		>
	{:else}
		<input
			bind:value={value}
			placeholder={placeholder ? placeholder : label}
			{...input_attr}
		>
	{/if}
</div>
