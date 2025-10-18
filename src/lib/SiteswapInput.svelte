<script>
	import InputField from '$lib/InputField.svelte';
	import DragDropList from '$lib/DragDropList.svelte';
	import Icon from '$lib/Icon.svelte';
	import { jugglerName, hands2limbs, limbs2hands, defaultLimbs } from '$lib/passist.mjs';

	export let siteswapInput;
	export let nJugglers;
	export let showNJugglers = true;
	export let showHandOrderInput = true;
	export let handsInput = '';
	export let idPrefix;
	export let siteswapValid;
	export let handsValid = true;
	export let size = 10;
	export let big = false;
	export let jif = {};
	export let style = [];

	let handsInputDefault = '';
	let handsDragDropVisible = false;
	let handsDragDropElement;
	let handsInputElement;
	let handList = [];
	let showStyle = true;
	let heights = new Set();
	let heightCount = {};
	let newStyle = {dummy:'du'};

	$: handsInputDefault = limbs2hands(defaultLimbs(nJugglers));
	$: handList = calculateHandList(handsInput, nJugglers);

	$: {
		if (jif.throws) {
			heights = new Set();
			heightCount = {};
			for (const th of jif.throws) {
					heights.add(th.label);
					heightCount[th.label] = (heightCount[th.label] ?? 0) + 1;
				}
			}
			heights = heights;
	}

	function calculateHandList(handsInput, nJugglers) {
		const limbs = hands2limbs(handsInput, nJugglers) || defaultLimbs(nJugglers);
		return limbs.map(limb => jugglerName(limb.juggler) + ' ' + limb.type.split(' ')[0]);
	}

	function handsDragDropChanged() {
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

	/**
	 * prints the ordinal string for a number (1st, 2nd, 3rd, 4th, etc)
	 */
	function ordinal(n) {
			return n + ([,'st','nd','rd'][(''+n).match`1?.$`]||'th');
	}
</script>

<style>
	.hands-input, .style-overview {
		display: inline-flex;
		position:relative;
	}
	.hands-input input, .style-overview {
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
		appearance: none;
		-webkit-appearance:none;
	}
	.hands-input input.empty { padding-right:0.3rem }
	.hands-input input::-webkit-search-cancel-button { -webkit-appearance: none }
	.hands-input input.invalid { color:#dc3545 }
	.style-overview { line-height:1.15; padding:0.5em 1em; width:auto; padding-right:3em; margin-bottom:1em }

	:global(.dragdroplist) { position:absolute !important; left:0; right:0; top:2.4em; z-index:1; box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px; border:1px solid gray; background:white }
	:global(.dragdroplist > .list > div.item) { margin-bottom:-1px; border-left:none; border-right:none }
	:global(.dragdroplist > .list > div.item div.content p ) { margin:0 }
	:global(.dragdroplist div.buttons) { visibility:hidden }

	.show-style-button {
		margin-bottom: 1em;
		margin-right: 1em;
	}
	:global(.pure-button svg) {
		height:1.5em
	}
</style>

<svelte:window on:touchstart={windowOnClick} on:mousedown={windowOnClick}/>

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
		on:change={() => { handsInput = ''; }}
		{big}
		/>
	{/if}

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
			size,
		}}
		{big}
		/>

	<button
		class="pure-button show-style-button"
		class:pure-button-active={showStyle}
		on:click={() => showStyle = !showStyle }
	>
		<Icon type=options />
	</button>
</div>

<div class="pure-form form-inline">
	{#if showStyle}
		{#if showHandOrderInput}
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
					on:focus={() => { handsDragDropVisible = true }}
					bind:this={handsInputElement}
					class:invalid={!handsValid}
					on:keyup={e => { if (e.key == 'Enter') { e.target.blur(); handsDragDropVisible = false;}} }
				>
				{#if handsDragDropVisible}

				<!--svelte-ignore a11y_no_static_element_interactions -->
				<div
					bind:this={handsDragDropElement}
					on:touchstart|capture={() => { handsInputElement.blur(); }}
					on:touchend|capture={handsDragDropChanged}
					on:mouseup|capture={handsDragDropChanged}
				>
					<DragDropList bind:data={handList} />
				</div>
				{/if}
				{#if handsInput}
				<Icon type=close on:click={() => {handsInput = '';}}/>
				{/if}
			</div>
		</InputField>
		{/if}

		<div class="throw-style">
			<InputField
				id={idPrefix + "style_new"}
				label='Style'
				type=custom
				>
					{#each style as s}
						{JSON.stringify(s)}
					{/each}
					<select name="throw">
						{#each [...heights.keys()] as height}
							{#if heightCount[height] == 1}
							  <option value="{height}">{height}</option>
						  {:else}
							  <option value="{height}">{heightCount[height] == 2 ? 'both' : 'all'} {height}</option>
							  {#each { length: heightCount[height] } as _,ith}}
								  <option value="{height}">{ordinal(ith+1)} {height}</option>
							  {/each}

						  {/if}
						{/each}
					</select>
					<select name="jugglers">
					  <option value="all">of all jugglers</option>
						{#each jif.jugglers as juggler, idx}
							<option value="{idx}">of juggler {juggler.name}</option>
						{/each}
					</select>
					<select name="what">
						  <option value="spins">#spins</option>
						  <!-- <option value="dwell">dwell time</option> -->
					</select>
					<input
						type=number
						min=-99
						max=99
						value=1
					/>
					<button on:click={_=>{style.push(newStyle); style=style } }>
						add
					</button>
				</InputField>
		</div>
	{:else} <!-- !showStyle -->
		{#if showHandOrderInput && handsInput}
			<!--svelte-ignore a11y_no_static_element_interactions -->
			<!--svelte-ignore a11y_click_events_have_key_events -->
			<div class="style-overview input-group" on:click={() => showStyle = true}>
				<Icon type=close on:click={() => {handsInput = '';}}/>
				Hand order: {handsInput}
			</div>
		{/if}
	{/if}
</div>
