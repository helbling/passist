<script>
	import InputField from './InputField.svelte';
	import DragDropList from "svelte-dragdroplist";
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
		return handList = limbs.map(limb => jugglerName(limb.juggler) + ' ' + limb.type.split(' ')[0]);
	}

	function handsDragDropChanged(e) {
		handsInput = handList.join(' ')
			.replaceAll(/ right/g, 'r')
			.replaceAll(/ left/g, 'l');
	}

	function windowOnClick(e) {
		if (handsDragDropVisible && !handsDragDropElement.contains(e.target)) {
			handsDragDropVisible = false
			handsInputElement.blur();
		}
	}
</script>

<style>
	.hand-order-input { position:relative; display:grid }
	.hand-order-input input {border-top-left-radius:0; border-bottom-left-radius:0 }
	:global(.dragdroplist) { position:absolute !important; left:0; right:0; z-order:1; box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px; border:1px solid gray; background:white }
	:global(.dragdroplist > .list > div.item) { margin-bottom:-1px; border-left:none; border-right:none }
	:global(.dragdroplist > .list > div.item div.content p ) { margin:0 }
	:global(.dragdroplist div.buttons) { visibility:hidden }
	input.invalid { color:#dc3545 }
</style>

<svelte:window on:pointerdown={windowOnClick}/>

<div class="pure-form form-inline">
	<InputField
		bind:value={siteswapInput}
		id={idPrefix + "SiteswapInput"}
		label=Siteswap
		type=search
		bind:valid={siteswapValid}
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
		/>

	<InputField
		id={idPrefix + "HandOrder"}
		label='Hand order'
		type=custom
		>
		<div class=hand-order-input>
			<input
				id={idPrefix + "Hands"}
				type=search
				spellcheck=false
				bind:value={handsInput}
				placeholder={handsInputDefault}
				on:focus={e => { handsDragDropVisible = true }}
				bind:this={handsInputElement}
				class:invalid={!handsValid}
			>
			{#if handsDragDropVisible}
			<div bind:this={handsDragDropElement} on:pointerup={handsDragDropChanged} >
				<DragDropList bind:data={handList}/>
			</div>
			{/if}
		</div>
	</InputField>
</div>
