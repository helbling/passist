<script>
	import Icon from '$lib/Icon.svelte';
	import InfoBox from '$lib/InfoBox.svelte';
	import InputField from '$lib/InputField.svelte';

	export let nJugglers;
	export let idPrefix;
	export let jif = {};
	export let throwStyles = [];
	export let showSettings = false;

	let newStyle = {};
	let newStyleThrow = JSON.stringify({label:'all'});
	let newStyleJugglers = '-1';
	let newStyleWhat = 'spins';
	let newStyleValue = '1';
	let throwSelect = {};

	const throwStylesBetaWarning = 'Note: Throw styles is new and might still have bugs';

	$: {
		if (jif && jif.throws) {
			const throwLabels = new Set();
			const labelCount = {};
			for (const th of jif.throws) {
				throwLabels.add(th.label);
				labelCount[th.label] = (labelCount[th.label] ?? 0) + 1;
			}
			throwSelect = { 'all': { label:'all' }};
			for (const label of [...throwLabels.keys()]) {
				if (labelCount[label] == 1) {
					throwSelect[label] = { label };
				} else {
					throwSelect[(labelCount[label] == 2 ? 'both' : 'all') + ' ' + label] = { label };
					for (let ith = 0; ith < labelCount[label]; ith++)
						throwSelect[ordinal(ith + 1) + ' ' + label] = { label, ith };
				}
			}
			// newStyleThrow = JSON.stringify(Object.values(throwSelect)[0]);
		}
	}

	$: {
		try {
			newStyle = Object.assign({}, {jugglers: newStyleJugglers, what: newStyleWhat, value: newStyleValue}, JSON.parse(newStyleThrow));
		} catch(e) {
			// ignore
		}
	}

	function setDefaultThrowStyleValue() {
		const nst = JSON.parse(newStyleThrow);
		if (!nst.label)
			return;
		const soloHeight = nst.label.replace(/[px]*$/g, '') / nJugglers;
		if (newStyleWhat == 'spins')
			newStyleValue = Math.max(0, Math.floor(soloHeight - 2));
		if (newStyleWhat == 'dwell')
			newStyleValue = soloHeight > 2 ? 1 : (soloHeight < 1 ? 0 : 0.5);
	}

	/**
	 * prints the ordinal string for a number (1st, 2nd, 3rd, 4th, etc)
	 */
	function ordinal(n) {
			return n + ([,'st','nd','rd'][(''+n).match`1?.$`]||'th');
	}

	function throwStyleString(style, jif) {
		return style.label + (style.jugglers >= 0 ? ' of ' + jif.jugglers[style.jugglers].name : '') + ': ' + style.what + '=' + style.value;
	}
	
</script>

<style>
	.style-overview {
		display: inline-flex;
		position:relative;
	}
	.style-overview {
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
	.style-overview { line-height:1.15; padding:0.5em 1em; width:auto; padding-right:3em; margin-bottom:1em; margin-right:1em }

	select { height: 2.4em }
</style>

{#if showSettings}
<div class="pure-form form-inline">
	<InputField
		id={idPrefix + "throw-styles"}
		label='Throw styles'
		type=custom
		>
			<select bind:value={newStyleThrow}  on:change={setDefaultThrowStyleValue} >
				{#each Object.entries(throwSelect) as [key, values]}
					  <option value="{JSON.stringify(values)}">{key}</option>
				{/each}
			</select>
			{#if nJugglers > 1}
				<select name="jugglers" bind:value={newStyleJugglers}>
					<option value="-1">of {nJugglers == 2 ? 'both' : 'all'} jugglers</option>
					{#if jif }
						{#each jif.jugglers as juggler, idx}
							<option value="{idx}">of juggler {juggler.name}</option>
						{/each}
					{/if}
				</select>
			{/if}
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
		<div class=throw-styles>
			{#each throwStyles as s,idx}
			<div class="style-overview input-group">
				{throwStyleString(s, jif)}
				<Icon type=close on:click={() => { throwStyles.splice(idx, 1); throwStyles = throwStyles }}/>
			</div>
			{/each}
		</div>
		<InfoBox type=warning>{throwStylesBetaWarning}</InfoBox>
	</div>


	{:else} <!-- !showSettings -->
		{#if throwStyles.length > 0}
			<!--svelte-ignore a11y_no_static_element_interactions -->
			<!--svelte-ignore a11y_click_events_have_key_events -->
			<div class="style-overview input-group" on:click={() => showSettings = true}>
				<Icon type=close on:click={e => {
						throwStyles = [];
						e.stopPropagation();
					}}/>
				Throw styles: {throwStyles.map(s => throwStyleString(s, jif)).join(', ')}
			</div>

			<InfoBox type=warning>{throwStylesBetaWarning}</InfoBox>
		{/if}
{/if}
