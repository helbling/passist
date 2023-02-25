<script>
	import ExtendedSiteswap from '$lib/extended_siteswap.mjs';
	import InfoBox from '$lib/InfoBox.svelte';
	import PatternResult from '$lib/PatternResult.svelte';
	import Siteswap from '$lib/siteswap.mjs';
	import SiteswapInput from '$lib/SiteswapInput.svelte';
	import { defaults, useLocalStorage, siteswapUrl, siteswapAlternativesUrl, jugglerName, jugglersInCircle, defaultLimbs, limbs2hands, hands2limbs} from '$lib/passist.mjs';
	import { siteswapNames} from '$lib/patterns.mjs';

	export let init;
	let nJugglers = defaults.nJugglers;
	let input = defaults.siteswap;
	let valid = false;
	let jif = {};
	let shift = 0;
	let handsInput = '';
	let handsValid = false;
	let siteswap, strippedInput, originalSiteswap, extendedSiteswap;
	let period;
	let nProps;
	let siteswapName;
	let startProperties;
	let localPeriod;
	let prechacthisUrl;
	let alternativesUrl;
	let startConfigurations;
	let unusualThrows = false;
	let limbs = [];
	let title;
	let url;

	if (init) {
		input = init.params.input;

		const nJugglersUrl = parseInt(init.url.searchParams.get('jugglers'));
		if (nJugglersUrl && nJugglersUrl >= 1)
			nJugglers = nJugglersUrl;

		const handsParam = init.url.searchParams.get('hands');
		const limbs = hands2limbs(handsParam, nJugglers);
		if (limbs)
			handsInput = limbs2hands(limbs);
	} else if (useLocalStorage) {
			input = localStorage.getItem('siteswap') || defaults.siteswap;
			nJugglers = localStorage.getItem('nJugglers') || defaults.nJugglers;
	}


	$: useLocalStorage && input && localStorage.setItem("siteswap", input);
	$: useLocalStorage && nJugglers && localStorage.setItem("nJugglers", nJugglers);
	// TODO: sticky handsInput

	$:{
		// TODO: add hint/link when entering extended siteswap
		// TODO: shift

			strippedInput = String(input).replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
			originalSiteswap = new Siteswap(strippedInput);
			siteswap = originalSiteswap.shift(shift);

			extendedSiteswap = new ExtendedSiteswap(input);

			url = siteswapUrl({
					siteswapInput: input,
					nJugglers: nJugglers,
					handsInput: handsInput,
			});

			if (nJugglers > 0) {
				const circleRadius = 1.2 + nJugglers * 0.2;
				const jugglers = jugglersInCircle(nJugglers);

				limbs = hands2limbs(handsInput, nJugglers);
				handsValid = limbs || !handsInput;
				if (!limbs)
					limbs = defaultLimbs(nJugglers);

				valid = siteswap.isValid();
				period = siteswap.period;
				nProps = siteswap.nProps;

				jif = siteswap.toJif({
					name: siteswapName ? siteswapName + " (" + siteswap.toString() + ")" : undefined,
					generator: 'passist', // TODO: put version of package.json here again
					jugglers: jugglers,
					limbs: limbs,
					props: valid ? Array.from(Array(nProps), () => { return {}; }) : [],
					flipTwos: true
				});

				startProperties = siteswap.getStartProperties(nJugglers);

				startConfigurations = siteswap.startConfigurations(limbs);
				localPeriod = startConfigurations[0].local.length;
				unusualThrows = startConfigurations.some(
					configuration => configuration.local.some(
						localthrow => localthrow && localthrow.unusual
					)
				);

				prechacthisUrl = '';
				if (nJugglers == 2 && limbs.length == 4 && (period % 2) == 1) {
					prechacthisUrl = 'http://prechacthis.takeouts.eu/info.php?pattern=['
						+ startConfigurations[0].local.map(x => {
							var h = x.height / 2;
							return 'p(' + h + (+x.height & 1 ? ',1,' + (h + period / 2) : ',0,' + h) + ')';
						}).join(',')
					+ ']&persons=2';
				}


				const alternativesSiteswap = siteswap.toString().repeat(localPeriod * nJugglers / period);
				alternativesUrl = siteswapAlternativesUrl({
					siteswapInput: alternativesSiteswap,
					nJugglers,
					handsInput,
				});

				siteswapName = siteswapNames[url];
				title = 'Siteswap ' + strippedInput;
				if (siteswapName)
					title += ' (' + siteswapName + ')';
				title += ', ' + nJugglers + ' jugglers';
				if (handsInput)
					title += ', hands: ' + handsInput;


			} else {
				valid = false;
			}
	}

	function shiftLeft() {
		shift = (shift + 1) % period;
	}
	function shiftRight() {
		shift = (shift + period - 1) % period;
	}
	function prechac(x, nJugglers) {
		return Math.round(+x / nJugglers * 100) / 100;
	}
	function word(x) {
		var word = [
			'wait',
			1,
			'zip',
			3,
			'flip',
			'zap',
			'self',
			'single pass',
			'heff',
			'double pass',
			'triple self',
			'triple pass'
		][x];
		return word ? word : x;
	}
	function sum(arr) {
		return arr.reduce(function(a, b) { return a + b; }, 0);
	}
</script>

<style>
	a.arrow { color:inherit; text-decoration:none; cursor:pointer }
	.localThrows { overflow-x:auto; margin-bottom:1em }
	.localThrows td { white-space:nowrap }
	label.pure-button { margin:0 }
	td.space { padding-left:0.5em }
</style>

<PatternResult {valid} {jif} {startConfigurations} {title} {url} {init} >
	<SiteswapInput
		slot=input
		siteswapValid={valid}
		bind:nJugglers
		bind:siteswapInput={input}
		bind:handsInput
		bind:handsValid
		idPrefix=main
	/>

	<SiteswapInput
		slot=animation_input
		{nJugglers}
		showNJugglers={false}
		siteswapValid={valid}
		bind:siteswapInput={input}
		bind:handsInput
		bind:handsValid
		idPrefix=animation
	/>

	<div slot=info>

	{#if extendedSiteswap && !extendedSiteswap.isVanillaSiteswap && extendedSiteswap.isValid() }
		<InfoBox type=warning>
			Did you mean the extended siteswap <a href="{extendedSiteswap.toUrl()}">{extendedSiteswap.toString()}</a>?
		</InfoBox>
	{/if}

	{#if valid}
		{#if siteswap}
			<h2>
				<!-- TODO: put correct siteswap shift in href -->
				<!-- svelte-ignore a11y-invalid-attribute -->
				<a class=arrow href='javascript:;' on:click={shiftLeft}>◄</a>
				{siteswap.toString()}
				<!-- svelte-ignore a11y-invalid-attribute -->
				<a class=arrow href='javascript:;' on:click={shiftRight}>►</a>

				{siteswapName ? siteswapName : ''}
			</h2>

			<p>
				{nProps} props, period {period}, squeezes {startProperties.squeezes}{startProperties.isGroundState ? ', ground state' : ''}, orbits: {siteswap.orbits().map(orbit => Siteswap.heightsToString(orbit) + ' (' + (sum(orbit)/period) + ' props)').join(' ')}

				<!--
				{#if nJugglers > 1}
				, interface: {siteswap.globalInterface(nJugglers)}
				{/if}
				-->
			</p>
			{#if nJugglers > 1}
				<div class=localThrows>
					<table>
						<tr>
							<td>Local&nbsp;</td>
							<td class=space />
							<td colspan={localPeriod + 1}>Siteswap</td>
							<td colspan={localPeriod + 1}>
								{#if prechacthisUrl}
									<a href={prechacthisUrl}>Prechac</a>
								{:else}
									Local
								{/if}
							</td>

							{#if nJugglers == 2 && !unusualThrows}
								<td colspan={localPeriod}>Words</td>
							{/if}
						</tr>
						{#each startConfigurations as j}
							<tr>
								<th>{j.name} <sub>{j.startProps['left hand'] || 0}|{j.startProps['right hand'] || 0}</sub></th>
								<td class=space />
								{#each j.local as t}
									<td>{#if t}{t.siteswap}{@html t.desc}{/if}&nbsp;</td>
								{/each}
								<td class=space />
								{#each j.local as t}
									<td>
										{#if t}{prechac(t.height, nJugglers)}{@html t.desc}{:else}&nbsp;{/if}
									</td>
								{/each}
								{#if nJugglers == 2 && !unusualThrows}
									<td class=space />
									{#each j.local as t}
										<td>{#if t}{word(t.height)},{/if}&nbsp;</td>
									{/each}
								{/if}
							</tr>

						{/each}
					</table>

				</div>
			{/if}
		{/if}

	{:else if input}
			<InfoBox type=error>
				<h5>Invalid Siteswap</h5>
				{#if siteswap && siteswap.error}
					<p>
					{siteswap.error}
					{#if siteswap.error.snippet}
							<pre>{siteswap.error.snippet}</pre>
					{/if}
					</p>
				{/if}
			 <img src=/images/mr_meeseeks_shocked_small.png alt="mr meeseeks is shocked to see an invalid siteswap" >
			</InfoBox>
	{:else}
		<!-- empty string as input: no output -->
	{/if}
	</div>

</PatternResult>
