<script>
	import InputField from './InputField.svelte';
	// TODO: this currently doesn't work
	//import DragDropList from "$lib/svelte-dragdroplist";
	import Icon from './Icon.svelte';
	import { jugglerName, hands2limbs, limbs2hands, defaultLimbs } from './passist.js';

	export let siteswapInput;
	export let nJugglers;
	export let handsInput;
	export let idPrefix;
	export let siteswapValid;
	export let handsValid;

	let handsInputDefault = '';
	let handsDragDropVisible = false;
	let handsDragDropElement;
	let handsInputElement;
	let handList = [];

	$: handsInputDefault = limbs2hands(defaultLimbs(nJugglers));
	$: handList = calculateHandList(handsInput, nJugglers);

	function calculateHandList(handsInput, nJugglers) {
		const limbs = hands2limbs(handsInput, nJugglers) || defaultLimbs(nJugglers);
		return limbs.map(limb => jugglerName(limb.juggler) + ' ' + limb.type.split(' ')[0]);
	}

	function handsDragDropChanged(e) {
		handsInput = handList.join(' ')
			.replace(/ right/g, 'r')
			.replace(/ left/g, 'l');
	}

	function windowOnClick(e) {
		if (handsDragDropVisible && !handsDragDropElement.contains(e.target)) {
			handsDragDropVisible = false
			handsInputElement.blur();
		}
	}
</script>

<style>
	.hands-input {
		display: inline-flex;
		position:relative;
	}
	.hands-input input {
		border-top-left-radius:0;
		border-bottom-left-radius:0;
		padding-right:1.55rem;
		width: 12rem;

		/* NOTE: copy-pasted from InputField.svelte! */
		color: #495057;
		border: 1px solid #ced4da;
		border-radius: 0.25rem;
		-webkit-box-shadow: inset 0 1px 3px #ddd;
		        box-shadow: inset 0 1px 3px #ddd;
		margin:0;
		border-top-left-radius:0;
		border-bottom-left-radius:0;
		-webkit-appearance:none;
	}
	.hands-input input.empty { padding-right:0.3rem }
	.hands-input input::-webkit-search-cancel-button { -webkit-appearance: none }
	.hands-input input.invalid { color:#dc3545 }

	:global(.dragdroplist) { position:absolute !important; left:0; right:0; top:2.4em; z-index:1; box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px; border:1px solid gray; background:white }
	:global(.dragdroplist > .list > div.item) { margin-bottom:-1px; border-left:none; border-right:none }
	:global(.dragdroplist > .list > div.item div.content p ) { margin:0 }
	:global(.dragdroplist div.buttons) { visibility:hidden }
</style>

<svelte:window on:touchstart={windowOnClick} on:mousedown={windowOnClick}/>

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
	<InputField
		bind:value={nJugglers}
		id={idPrefix + "NJugglers"}
		type=number
		label='👥'
		title='Number of jugglers'
		min=1
		max=9
		on:change={e => { handsInput = ''; }}
		/>

	<InputField
		id={idPrefix + "HandOrder"}
		label='Hand order'
		type=custom
		>
		<div class=hands-input>
			<input
				id={idPrefix + "Hands"}
				type=search
				spellcheck=false
				autocomplete=off
				class:empty={!handsInput}
				bind:value={handsInput}
				placeholder={handsInputDefault}
				on:focus={e => { handsDragDropVisible = true }}
				bind:this={handsInputElement}
				class:invalid={!handsValid}
				on:keyup={e => { if (e.key == 'Enter') { e.target.blur(); handsDragDropVisible = false;}} }
			>
			{#if handsDragDropVisible}
			<div
				bind:this={handsDragDropElement}
				on:touchstart|capture={e => { handsInputElement.blur(); }}
				on:touchend|capture={handsDragDropChanged}
				on:mouseup|capture={handsDragDropChanged}
			>
				<!-- TODO
				<DragDropList bind:data={handList} />
				-->
			</div>
			{/if}
			{#if handsInput}
			<Icon type=close on:click={e => {handsInput = '';}}/>
			{/if}
		</div>
	</InputField>
</div>
