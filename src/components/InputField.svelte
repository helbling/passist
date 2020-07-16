<script>

export let id;
export let type;
export let title;
export let label;
export let value = '';
export let min = undefined;
export let max = undefined;
export let step = undefined;
export let placeholder = undefined;
export let valid = true;
export let values = {};
export let attr = {};

if (!title)
	title = label;

let inputAttr = {
	type:      type,
	id:        id,
	class:    'form-control',
}

if (type == 'number') {
	inputAttr.inputmode = 'number';
	inputAttr.min = min ? min : 0;
	if (max)
		inputAttr.max = max;
	if (step)
		inputAttr.step = step;
	inputAttr.class += (max && max < 10) ? ' digit' : ' twodigit';
} else {
	inputAttr.placeholder = placeholder ? placeholder : label;
	for (const k in attr)
		inputAttr[k] = attr[k];
}

</script>

<style>
	.input-group { margin-right:1em; margin-bottom:1em; width:auto }
	input[type="search"]::-webkit-search-cancel-button { -webkit-appearance: searchfield-cancel-button }
	input[type="number"].digit    { width:3.5em !important }
	input[type="number"].twodigit { width:5em !important }
	input.invalid { color:#dc3545 }
	input[type="checkbox"] { width:1.5em; margin-right:0.2em }
	.input-group-text.checkbox { padding-top:0.1em; padding-bottom:0.1em }
</style>


<label class=sr-only for={id}>{title}</label>
<div class="input-group {id}">
	<div class=input-group-prepend>
		<div class="input-group-text {type}" {title}>
			{#if type == 'checkbox'}
				<input
					type=checkbox
					bind:checked={value}
					{...inputAttr}
				>
			{/if}
			{label}
		</div>
	</div>
	{#if type == 'number'}
		<input
			{id}
			type=number
			bind:value={value}
			class="form-control {max && max < 10 ? 'digit' : 'twodigit'}"
			{...inputAttr}
		>
	{:else if type == 'select'}
		<select bind:value={value}>
			{#each values as v}
				<option value={v}>{v}</option>
			{/each}
		</select>
	{:else if type == 'custom'}
		<slot/>
	{:else if type != 'checkbox'}
		<input
			bind:value={value}
			placeholder={placeholder ? placeholder : label}
			class:invalid={!valid}
			{...inputAttr}
		>
	{/if}
</div>
