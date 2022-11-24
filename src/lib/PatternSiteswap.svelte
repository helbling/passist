<script>
	import PatternResult from '$lib/PatternResult.svelte';
	import SiteswapInput from '$lib/SiteswapInput.svelte';
	import Siteswap from '$lib/siteswap.mjs';
	import ExtendedSiteswap from '$lib/extended_siteswap.mjs';
	import { defaults, useLocalStorage, siteswapUrl, siteswapAlternativesUrl, jugglerName, defaultLimbs, limbs2hands, hands2limbs, jifdev, U } from '$lib/passist.mjs';
	import { siteswapNames} from '$lib/patterns.mjs';

	export let nJugglers = defaults.nJugglers;
	export let input = '975';
	export let valid = false;
	export let jif = {};
	export let shift = 0;
	export let handsInput = '';
	export let propType = defaults.propType;
	let handsValid = false;
	let siteswap, extendedSiteswap, strippedInput, originalSiteswap;
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

	// TODO move jugglers / limbs / props to more general place
	const propColors = [
		'#c0392b', // red
		'#0c0d5d', // blue
		'#f45d20', // orange
		'#ed4694', // pink
		'#6f5499', // violet
		'#00dc3c', // green
		'#ffd700', // yellow
		'#f2f2f2', // white
	];


	$:{
		// TODO: extended siteswap as well
		// TODO: shift

			strippedInput = String(input).replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
			originalSiteswap = new Siteswap(strippedInput);
			siteswap = originalSiteswap.shift(shift);

			if (nJugglers > 0) {
				const circleRadius = 1.2 + nJugglers * 0.2;
				const jugglers = [];
				for (let i = 0; i < nJugglers; i++) {
					const juggler = {
						name: jugglerName(i),
					};
					if (nJugglers == 1) {
						Object.assign(juggler, {
							position: [0, 0, 0],
							lookAt:   [0, 0, 1],
						});
					} else {
						const a = Math.PI * 2 * i / nJugglers;
						const round = x => Math.round(x * 1000) / 1000;
						Object.assign(juggler, {
							position: [round(circleRadius * Math.cos(a)), 0, round(circleRadius * Math.sin(a))],
							lookAt:   [0, 0, 0],
						});
					}
					jugglers.push(juggler);
				}

				limbs = hands2limbs(handsInput, nJugglers);
				handsValid = limbs || !handsInput;
				if (!limbs)
					limbs = defaultLimbs(nJugglers);

				valid = siteswap.isValid();
				period = siteswap.period;
				nProps = siteswap.nProps;
				const props = [];
				for (let i = 0; i < nProps; i++)
					props.push({
						color: propColors[i % propColors.length],
						type: propType,
					});

				jif = siteswap.toJif({
					name: siteswapName ? siteswapName + " (" + siteswap.toString() + ")" : undefined,
					generator: 'passist', // TODO: put version of package.json here again
					jugglers: jugglers,
					limbs: limbs,
					props: props,
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
					prechacthisUrl = 'http://prechacthis.org/info.php?pattern=['
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

			siteswapName = siteswapNames[nJugglers + '|' + siteswap.canonicString()];
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

<PatternResult {valid} {jif} {startConfigurations}>
	<SiteswapInput
		slot=input
		{nJugglers}
		showNJugglers={false}
		siteswapValid={valid}
		bind:siteswapInput={input}
		bind:handsInput
		bind:handsValid
		idPrefix=main
	/>

	<div slot=info>

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
	{:else}
		<!-- empty string as input: no output -->
	{/if}
	</div>

</PatternResult>
