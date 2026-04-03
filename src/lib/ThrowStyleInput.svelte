<script>
	import IconButton from '$lib/IconButton.svelte';
	import InfoBox from '$lib/InfoBox.svelte';
	import InputField from '$lib/InputField.svelte';
	import Jif from '$lib/jif.mjs';

	export let nJugglers;
	export let idPrefix;
	export let jif = {};
	export let throwStyles = [];
	export let showSettings = false;

	let newStyle = {};
	let newStyleThrow = '{}';
	let newStyleLimbs = '{}';
	let newStyleWhat = 'spins';
	let newStyleValue = '1';
	let throwSelect = new Map();
	let limbsSelect = new Map();
	let limbsLabels = {};
	let lastIdx = {};
	let completedJif = jif;
	let labelToDuration = {};
	let hasHolds = false;
	let holdLabel;
	let holdSpins;

	const throwStylesBetaWarning = 'Note: Throw styles is new and might still have bugs';

	function styleKey(style) {
		return [style.label, style.ordinal, style.limbs, style.what].join('|');
	}

	function isHoldSpinStyle(style) {
		return style.what == "spins" && style.label == holdLabel && !style.ordinal;
	}
	$: {
		throwStyles.forEach((style, idx) => {
				lastIdx[styleKey(style)] = idx;
		});
		for (const idx in throwStyles)
			lastIdx[throwStyles[idx].label] = idx;

		if (jif && jif.throws) {
			try {
				completedJif = Jif.complete(jif).jif;
			} catch (e) {
				completedJif = jif;
			}
			const throwLabels = new Set();
			const maxOrdinal = {};
			labelToDuration = {};

			for (const th of jif.throws) {
				throwLabels.add(th.label);
				labelToDuration[th.label] = th.duration;
				maxOrdinal[th.label] = Math.max(maxOrdinal[th.label] ?? 0, th._throwStyleOrdinal);
			}
			throwSelect = new Map([['all', {}]]);
			for (const label of [...throwLabels.keys()]) {
				if (maxOrdinal[label] < 2) {
					throwSelect.set(label, { label });
				} else {
					throwSelect.set((maxOrdinal[label] == 2 ? 'both' : 'all') + ' ' + label, { label  });
					for (let ordinal = 1; ordinal <= maxOrdinal[label]; ordinal++)
						throwSelect.set(ordinalString(ordinal) + ' ' + label, { label, ordinal });
				}
			}

			limbsSelect = new Map([[(nJugglers <= 2 ? 'both' : 'all') + ' ' + (nJugglers == 1 ? 'hands' : 'jugglers'), {}]]);
			if (completedJif) {
				const jugglerToLimbs = Array.from(new Array(completedJif.jugglers.length), ()=>[]);
				completedJif.limbs.forEach((limb, idx) => jugglerToLimbs[limb.juggler].push(idx));

				if (nJugglers > 1)
					completedJif.jugglers.forEach((juggler, idx) => limbsSelect.set("juggler " + juggler.name, {limbs: jugglerToLimbs[idx]}));

				completedJif.limbs.forEach((limb, idx) => limbsSelect.set(limb.type + (nJugglers > 1 ? " of " + completedJif.jugglers[limb.juggler].name : ''), { limbs: [idx]}));
			}

			limbsLabels = {};
			limbsSelect.forEach((style, label) => {
				limbsLabels[JSON.stringify(style.limbs)] = label;
			});

			// for flip/hold "two"s buttons
			const timeStretchFactor = jif.timeStretchFactor || 1;
			hasHolds = false;
			holdSpins = 1;
			for (const th of jif.throws) {
				const soloHeight = th.duration / timeStretchFactor;
				if (soloHeight == 2 && !th.ordinal && th.label == soloHeight * timeStretchFactor) { // must make sure we don't have some 2p, 2x, 1st 2 or similar
					hasHolds = true;
					holdLabel = th.label;
				}
			}
			if (hasHolds) {
				throwStyles.forEach(style => {
					if (isHoldSpinStyle(style))
						holdSpins = style.value;
				});
			}
		}
	}

	$: {
		try {
			newStyle = Object.assign({}, { what: newStyleWhat, value: newStyleValue}, JSON.parse(newStyleThrow), JSON.parse(newStyleLimbs) );
		} catch(e) {
			// ignore
		}
	}

	function setDefaultThrowStyleValue() {
		const nst = JSON.parse(newStyleThrow);
		if (!nst.label)
			return;

		const timeStretchFactor = jif.timeStretchFactor || 1;
		const duration = labelToDuration[nst.label];
		const soloHeight = duration ? labelToDuration[nst.label] / timeStretchFactor : 3;

		if (newStyleWhat == 'spins')
			newStyleValue = Math.max(0, Math.floor(soloHeight - 2));
		if (newStyleWhat == 'dwell')
			newStyleValue = (soloHeight > 2 ? 1 : (soloHeight < 1 ? 0 : 0.5)) * timeStretchFactor;
	}

	/**
	 * prints the ordinal string for a number (1st, 2nd, 3rd, 4th, etc)
	 */
	function ordinalString(n) {
			return n + ([,'st','nd','rd'][(''+n).match`1?.$`]||'th');
	}

	function throwStyleString(style, limbsLabels) {
		let limbsLabel = '';
		if (style.limbs) {
			const limbsJSON= JSON.stringify(style.limbs);
			if (limbsLabels[limbsJSON])
				limbsLabel = limbsLabels[limbsJSON];
			else
				limbsLabel = style.limbs; // cheap fallback, better than nothing..
		}

		const throwLabel = (style.ordinal ? ordinalString(style.ordinal) + ' ' : '') + (style.label || 'all');

		return (limbsLabel ? (throwLabel == 'all' ? limbsLabel : throwLabel + ' of ' + limbsLabel) : throwLabel) + ': ' + style.what + '=' + style.value;
	}
	
</script>

<style>
	.input-group {
		display: inline-flex;
		position:relative;

		width: 12rem;

		/* NOTE: copy-pasted from InputField.svelte! */
		color: #495057;
		border: 1px solid #ced4da;
		-webkit-box-shadow: inset 0 1px 3px #ddd;
		        box-shadow: inset 0 1px 3px #ddd;
		margin:0;
		appearance: none;
		-webkit-appearance:none;

		line-height:1.15;
		padding:0.5em 1em;
		width:auto;
		padding-right:3em;
		margin-bottom:1em;
		margin-right:0.5em
	}
	:global(.input-group select), :global(.input-group input) {
			border-radius: 0 !important;
			border-right:none;
	}
	.style-overview {
		border-radius: 4px;
	}

	select { height: 2.4em !important }
	.inactive { color: #aaa; }
	input { margin-bottom: 0 !important } /* override weird pure margin on small screens that made value field smaller in height than add button */
</style>

{#if showSettings}
<div class="pure-form form-inline">
	<InputField
		id={idPrefix + "throw-styles"}
		label='Throw styles'
		type=custom
		>
			<select bind:value={newStyleThrow}  on:change={setDefaultThrowStyleValue} >
				{#each [...throwSelect] as [key, values]}
					  <option value="{JSON.stringify(values)}">{key}</option>
				{/each}
			</select>

			<select bind:value={newStyleLimbs} >
				{#each [...limbsSelect] as [key, values]}
					  <option value="{JSON.stringify(values)}">{key}</option>
				{/each}
			</select>

			<select name="what" bind:value={newStyleWhat} on:change={setDefaultThrowStyleValue}>
				  <option value="spins">#spins</option>
				  <option value="dwell">dwell time</option>
			</select>
			<input
				type=number
				min={ newStyleWhat == 'dwell' ? 0 : -99 }
				max={ newStyleWhat == 'dwell' ? 9 : 99 }
				bind:value={newStyleValue}
				step={newStyleWhat == 'dwell' ? 0.01 : 1}
			/>
			<button
				class="pure-button"
				on:click={_=>{throwStyles.push(Object.assign({}, newStyle)); throwStyles=throwStyles } }>
				add
			</button>
		</InputField>
		<div class=style-overview throw-styles>
			{#each throwStyles as s,idx}
			<div class="input-group" class:inactive={idx != lastIdx[styleKey(s)] } >
				{throwStyleString(s, limbsLabels)}
				<IconButton type=close on:click={() => { throwStyles.splice(idx, 1); throwStyles = throwStyles }}/>
			</div>
			{/each}
		</div>
		<InfoBox type=warning>{throwStylesBetaWarning}</InfoBox>
	</div>

	{#if hasHolds}
	{#if holdSpins == 1}
	<div class="pure-form form-inline">
		<button
			class="pure-button"
			on:click={_ => {throwStyles.push({what:"spins", label:holdLabel, value:0}); throwStyles=throwStyles}}
		>
			hold {holdLabel}s
		</button>
	</div>
	{:else}
	<div class="pure-form form-inline">
		<button
			class="pure-button"
			on:click={_ => {throwStyles = throwStyles.filter(style => !isHoldSpinStyle(style))}}
		>
			flip {holdLabel}s
		</button>
	</div>
	{/if}
	{/if}

	{:else} <!-- !showSettings -->
		{#if throwStyles.length > 0}
			<!--svelte-ignore a11y_no_static_element_interactions -->
			<!--svelte-ignore a11y_click_events_have_key_events -->
			<div class="style-overview input-group" on:click={() => showSettings = true}>
				<IconButton type=close on:click={e => {
						throwStyles = [];
						e.stopPropagation();
					}}/>
				Throw styles: {throwStyles.map(s => throwStyleString(s, limbsLabels)).join(', ')}
			</div>

			<InfoBox type=warning>{throwStylesBetaWarning}</InfoBox>
		{/if}
{/if}
