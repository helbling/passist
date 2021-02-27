<script>
	import InputField from './InputField.svelte';
	import DragDropList from "svelte-dragdroplist";
	import { jugglerName, defaultHandOrder } from './passist.js';

	export let siteswapInput;
	export let nJugglers;
	export let idPrefix;
	export let valid;
	export let handOrder = [];

	let handOrderStringCurrent = '';
	let handOrderStringDefault = '';
	let handOrderDragDropVisible = false;
	let handOrderDragDropElement;
	let handOrderInput;
	$: handOrderStringCurrent = handOrderString(handOrder);
	$: handOrderStringDefault = handOrderString(defaultHandOrder(nJugglers));
	function handOrderString(handOrder) {
		return handOrder.map(hand => hand.textShort).join(' ');
	}
	function windowOnClick(e) {
		if (handOrderDragDropVisible && !handOrderDragDropElement.contains(e.target)) {
			handOrderDragDropVisible = false
			handOrderInput.blur();
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
</style>

<svelte:window on:pointerdown={windowOnClick}/>

<div class="pure-form form-inline">
	<InputField
		bind:value={siteswapInput}
		id={idPrefix + "SiteswapInput"}
		label=Siteswap
		type=search
		bind:valid={valid}
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
				id={idPrefix + "HandOrder"}
				type=text
				value={handOrderStringCurrent}
				placeholder={handOrderStringDefault}
				on:focus={e => { handOrderDragDropVisible = true }}
				bind:this={handOrderInput}
			>
			{#if handOrderDragDropVisible}
			<div class=hand-drag-drop bind:this={handOrderDragDropElement}>
				<DragDropList bind:data={handOrder}/>
			</div>
			{/if}
		</div>
	</InputField>
</div>
