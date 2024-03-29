<script>
	import SiteswapInput from '$lib/SiteswapInput.svelte';
	import CausalDiagramWidget from '$lib/CausalDiagramWidget.svelte';
	import AnimationWidget from '$lib/AnimationWidget.svelte';
	import Siteswap from '$lib/siteswap.mjs';
	import Icon from '$lib/Icon.svelte';
	import InputField from '$lib/InputField.svelte';
	import { siteswapNames} from '$lib/patterns.mjs';
	import { defaults, useLocalStorage, siteswapUrl, siteswapAlternativesUrl, jugglerName, defaultLimbs, limbs2hands, hands2limbs, jifdev, U } from '$lib/passist.mjs';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	export let siteswapInput = "45678";
	export let nJugglers = defaults.nJugglers;
	export let handsInput = '';
	export let fullscreen = false;

	let siteswapShift = 0;
	let siteswap, strippedInput, originalSiteswap;
	let siteswapValid = false;
	let handsValid = false;
	let period;
	let nProps;
	let siteswapName;
	let startProperties;
	let localPeriod;
	let prechacthisUrl;
	let alternativesUrl;
	let startConfigurations;
	let unusualThrows = false;
	let jif;
	let propType = defaults.propType;
	let jugglingSpeed = defaults.jugglingSpeed;
	let animationSpeed = defaults.animationSpeed;
	let showOrbits = false;
	let windowWidth;
	let windowHeight;
	let sharebutton = browser === true && 'share' in navigator;
	let showAnimationWidget = false;
	let limbs = [];
	let title;

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

	if (browser === true) {
		showAnimationWidget = useLocalStorage ? localStorage.getItem("showAnimationWidget") != "false" : true; // NOTE localStorage always saves strings

		if (useLocalStorage) {
			propType = localStorage.getItem("propType") || defaults.propType;
			animationSpeed = localStorage.getItem("animationSpeed") || defaults.animationSpeed;
		}
	}
	$: useLocalStorage && localStorage.setItem("showAnimationWidget", showAnimationWidget ? "true" : "false");
	$: useLocalStorage && localStorage.setItem("propType", propType);
	$: useLocalStorage && localStorage.setItem("animationSpeed", animationSpeed);

	function shiftLeft() {
		siteswapShift = (siteswapShift + 1) % period;
	}
	function shiftRight() {
		siteswapShift = (siteswapShift + period - 1) % period;
	}
	function getUrl(p = {}) {
		p = Object.assign({
			siteswapInput: siteswapInput,
			nJugglers: nJugglers,
			handsInput: handsInput,
			fullscreen: fullscreen,
		}, p);
		return siteswapUrl(p);
	}
	function onFullscreenChange(e) {
		const url = getUrl({fullscreen: e.detail});
		goto(url);
	}

$:	{
		strippedInput = String(siteswapInput).replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
		originalSiteswap = new Siteswap(strippedInput);
		siteswap = originalSiteswap.shift(siteswapShift);

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

			siteswapValid = siteswap.isValid();
			period = siteswap.period;
			nProps = siteswap.nProps;
			const props = [];
			for (let i = 0; i < nProps; i++)
				props.push({
					color: propColors[i % propColors.length],
					type: propType,
				});

			siteswapName = siteswapNames[siteswap.canonicString()];

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

		} else {
			siteswapValid = false;
		}


		title = 'Siteswap ' + strippedInput;
		if (siteswapName)
			title += ' (' + siteswapName + ')';
		title += ', ' + nJugglers + ' jugglers';
		if (handsInput)
			title += ', hands: ' + handsInput;
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

	function share() {
		navigator.share({
			url: location.href,
			title: title + ' - passist.org',
		});
		return false;
	}

	function sum(arr) {
		return arr.reduce(function(a, b) { return a + b; }, 0);
	}
</script>

<style>
	.causalDiagram { overflow-x:auto; margin-bottom:1em }
	a.arrow { color:inherit; text-decoration:none; cursor:pointer }
	.sharebutton { margin-top:1em }
	.localThrows { overflow-x:auto; margin-bottom:1em }
	.animationWidget { max-width:100%; overflow-x:auto; overflow-y:hidden }
	.localThrows td { white-space:nowrap }
	.jif-button { float:right; margin-left:0.5em }
	label.pure-button { margin:0 }
	td.space { padding-left:0.5em }
	.animation-controls { display:flex; flex-flow:row wrap }
</style>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<svelte:head>
	<title>passist - {title}</title>
</svelte:head>

<SiteswapInput
	bind:siteswapInput
	bind:nJugglers
	bind:handsInput
	bind:siteswapValid
	bind:handsValid
	idPrefix=main
/>
{#if jifdev}
	<button class="pure-button jif-button" on:click={e => {
		localStorage.setItem("jif", JSON.stringify(jif, null, 2)); goto('/jif');
	}}>
		<Icon type=code /> JIF
	</button>
{/if}

{#if siteswapValid || fullscreen}
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

	{#if siteswapValid}
		<div class=causalDiagram>
			<CausalDiagramWidget
				{jif}
				{startConfigurations}
				steps={nJugglers * period * 2}
			/>
		</div>
	{/if}

	{#if showAnimationWidget}
	<div class="animationWidget">
		<div style="width:{windowWidth > 1032 ? 1000 : windowWidth - 32}px; height:300px">
			<AnimationWidget
				{jif}
				initialFullscreen={fullscreen}
				closeButton={true}
				enableSettings={true}
				valid={siteswapValid}
				jugglingSpeed={parseFloat(jugglingSpeed)}
				animationSpeed={parseFloat(animationSpeed)}
				{showOrbits}
				on:fullscreenchange={onFullscreenChange}
				on:close={e => {showAnimationWidget = false;}}
			>
			<SiteswapInput
					bind:siteswapInput
					bind:nJugglers
					bind:handsInput
					bind:siteswapValid
					bind:handsValid
					idPrefix=animation
				/>
				<InputField
					id=proptype
					type=custom
					label="Prop type"
				>
					<label class="pure-button" class:pure-button-active={propType == 'ball'}>
						<input type="radio" bind:group={propType} value="ball" autocomplete="off"> Balls
					</label>
					<label class="pure-button" class:pure-button-active={propType == 'club'}>
						<input type="radio" bind:group={propType} value="club" autocomplete="off"> Clubs
					</label>
				</InputField>
				<InputField
					bind:value={jugglingSpeed}
					type=range
					id=jugglingspeed
					label='Juggling speed'
					step=0.1
					min=1
					max=5
					defaultValue={defaults.jugglingSpeed}
				/>
				<InputField
					bind:value={animationSpeed}
					type=range
					id=animationspeed
					label='Animation speed'
					step=0.1
					min=0.1
					max=2
					defaultValue={defaults.animationSpeed}
				/>
				<InputField
					id=orbits
					bind:value={showOrbits}
					type=checkbox
					label="Show orbits"
				/>
			</AnimationWidget>
		</div>
	</div>
	<p class=animation-controls>
		<InputField
			bind:value={animationSpeed}
			type=range
			id=animationspeed
			label='Animation speed'
			step=0.1
			min=0.1
			max=2
			defaultValue={defaults.animationSpeed}
		/>
	</p>

	{:else}
		<button class="pure-button" on:click={e => {showAnimationWidget = true;}}>Show Animation</button>
	{/if}


	{#if sharebutton}
		<p>
			<button class="sharebutton pure-button" on:click={share}><Icon type=send /> share</button>
		</p>
	{/if}

	{#if siteswapValid}
		<p>
			<a href="{alternativesUrl}" class="pure-button">{#if nJugglers >= 2}Compatible{:else}Similar{/if} siteswaps (beta)</a>
		</p>
	{/if}

{:else if siteswapInput}
	<div>
		<img src=/images/mr_meeseeks_shocked_small.png alt="mr meeseeks is shocked to see an invalid siteswap" >
		<p>Invalid Siteswap</p>
	</div>
{:else}
	<!-- empty string: no output -->
{/if}
