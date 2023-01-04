<script>
import Icon from '$lib/Icon.svelte';

export let id;
export let type;
export let title;
export let label;
export let value = '';
export let min = undefined;
export let max = undefined;
export let step = undefined;
export let defaultValue = undefined;
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
let searchInput;

if (type == 'number' || type == 'range') {
	inputAttr.min = min ? min : 0;
	if (max)
		inputAttr.max = max;
	if (step)
		inputAttr.step = step;
	if (type == 'number') {
		inputAttr.inputmode = 'number';
		inputAttr.class += (max && max < 10) ? ' digit' : ' twodigit';
	}
} else {
	inputAttr.placeholder = placeholder ? placeholder : label;
	for (const k in attr)
		inputAttr[k] = attr[k];
}

function blurTargetOnEnter(e) {
	if (e.key == 'Enter')
		e.target.blur();
}

</script>

<style>
	.input-group {
		margin-right:1em;
		margin-bottom:1em;
		width:auto;
		display: flex;
		flex-wrap: wrap;
		align-items: stretch;
		position:relative;
	}

	.input-group.direction-row > *:not(:last-child) {
		border-top-right-radius:0;
		border-bottom-right-radius:0;
		border-right:none
	}
	.input-group.direction-row > *:not(:first-child) {
		border-top-left-radius:0;
		border-bottom-left-radius:0
	}
	.input-group.direction-column > *:not(:last-child) {
		border-bottom-right-radius:0;
		border-bottom-left-radius:0;
		border-bottom:none
	}
	.input-group.direction-column > *:not(:first-child) {
		border-top:none;
		border-top-left-radius:0;
		border-top-right-radius:0;
	}

	.input-group.direction-column { flex-direction: column }

	input[type="number"].digit    { width:3rem !important }
	input[type="number"].twodigit { width:4rem !important }
	input[type="search"] { width: 12rem; -webkit-appearance:none; padding-right:1.55rem }
	input[type="search"]::-webkit-search-cancel-button { -webkit-appearance: none }
	@media screen and (max-width: 30rem) { input[type="search"].siteswap { width: 8rem } }
	input[type="checkbox"] { width:1.4em; height:1.4em; vertical-align:middle }
	input.invalid { color:#dc3545 !important }
	.input-group-text.checkbox { padding-top:0.1em; padding-bottom:0.1em }
	label, .input-group.direction-row input, .input-group.direction-column > div {
		color: #495057;
		border: 1px solid #ced4da;
		border-radius: 0.25rem;
		margin:0;
	}
	.input-group.direction-row label, .input-group.direction-row input {
		-webkit-box-shadow: inset 0 1px 3px #ddd;
		        box-shadow: inset 0 1px 3px #ddd;
	}
	.reset { border:none }
	.input-group.type-range label { min-width:12em; text-align:left }
	.range, .reset { background-color: #e9ecef; }
	.range { display:flex; height:2.4em }
	.range input { width:9em; border:none }
	.range-value { display:inline-block; min-width:2.5em; text-align:right; padding-left:1em }
	label {
		padding: 0.4em 0.75em;
		margin: 0;
		font-weight: 400;
		line-height: 1.5;
		text-align: center;
		white-space: nowrap;
		background-color: #e9ecef;
	}
	select { height: auto }
	.sr-only { position: absolute !important; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0 }

	:global(.input-group .close) { position:absolute; right:0; top:0; margin:0.7rem 0; height:1rem }
</style>

{#if title != label}
<label class=sr-only for={id}>{title}</label>
{/if}
<div class="input-group {id} type-{type} direction-{type == 'range' ? 'column' : 'row'}">
	<label for={id} {title}>
		{#if type == 'checkbox'}
			<input
				type=checkbox
				bind:checked={value}
				on:input
				{...inputAttr}
			>
		{/if}
		{label}
		{#if type == 'range'}
			<span class=range-value> {value} </span>
		{/if}
	</label>
	{#if type == 'number'}
		<input
			{id}
			type=number
			bind:value={value}
			class="form-control {max && max < 10 ? 'digit' : 'twodigit'}"
			on:keyup={blurTargetOnEnter}
			on:input
			autocomplete=off
			{...inputAttr}
		>
	{:else if type == 'select'}
		<select bind:value={value}>
			{#each values as [k, v]}
				<option value={k}>{v}</option>
			{/each}
		</select>
	{:else if type == 'range'}
		<div class=range>
			<input
				{id}
				class=range
				type=range
				bind:value={value}
				on:input
				autocomplete=off
				{...inputAttr}
			>
			{#if value != defaultValue}
			<button class=reset on:click={e => value = defaultValue}>
				<Icon type=reload/>
			</button>
			{/if}
		</div>
	{:else if type == 'custom'}
		<slot/>
	{:else if type != 'checkbox'}
		{#if type == 'search' && value}
		<Icon type=close on:click={e => {value = ''; searchInput.focus()}}/>
		{/if}
		<input
			bind:this={searchInput}
			bind:value={value}
			placeholder={placeholder ? placeholder : label}
			class:invalid={!valid}
			spellcheck=false
			autocomplete=off
			on:keyup={blurTargetOnEnter}
			on:input
			{...inputAttr}
		>
	{/if}
</div>
