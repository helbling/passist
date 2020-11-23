<script>
	import SiteswapInput from './SiteswapInput.svelte';
	import CausalDiagramWidget from './CausalDiagramWidget.svelte';
	import AnimationWidget from './AnimationWidget.svelte';
	import Siteswap from './siteswap.js';
	import Icon from './Icon.svelte';
	import InputField from './InputField.svelte';
	import { siteswapNames} from './patterns.js';
	import { defaults, colors, useLocalStorage, siteswapUrl, jifdev } from './passist.js';
	import { goto } from '@sapper/app';

	export let siteswapInput = "45678";
	export let nJugglers = defaults.nJugglers;
	export let fullscreen = false;
	export let url = '';

	let siteswapShift = 0;
	let siteswap, strippedInput, originalSiteswap;
	let valid = false;
	let period;
	let nProps;
	let siteswapName;
	let startProperties;
	let localPeriod;
	let prechacthisUrl;
	let startConfigurations;
	let jif;
	let propType = defaults.propType;
	let jugglingSpeed = defaults.jugglingSpeed;
	let animationSpeed = defaults.animationSpeed;
	let showOrbits = false;
	let animationOptions = {}
	let windowWidth;
	let windowHeight;
	let sharebutton = process.browser === true && 'share' in navigator;
	let showAnimationWidget = false;

	$: {
		animationOptions = {
			valid,
			jugglingSpeed: parseFloat(jugglingSpeed),
			animationSpeed: parseFloat(animationSpeed),
			showOrbits,
		};
	}

	if (process.browser === true) {
		showAnimationWidget = useLocalStorage ? localStorage.getItem("showAnimationWidget") != "false" : true; // NOTE localStorage always saves strings

		if (useLocalStorage)
			propType = localStorage.getItem("propType");
	}
	$: useLocalStorage && localStorage.setItem("showAnimationWidget", showAnimationWidget ? "true" : "false");
	$: useLocalStorage && localStorage.setItem("propType", propType);

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
					name: String.fromCharCode(65 + i),
				};
				if (nJugglers == 1) {
					Object.assign(juggler, {
						position: [0, 0, 0],
						lookAt:   [0, 0, 1],
					});
				} else {
					const a = Math.PI * 2 * i / nJugglers;
					Object.assign(juggler, {
						position: [circleRadius * Math.cos(a), 0, circleRadius * Math.sin(a)],
						lookAt:   [0, 0, 0],
					});
				}
				jugglers.push(juggler);
			}

			const limbs = [];
			for (let i = 0; i < 2 * nJugglers; i++)
				limbs.push({
					juggler:i % nJugglers,
					type: i < nJugglers ? 'right hand' : 'left hand',
				});

			valid = siteswap.isValid();
			period = siteswap.period;
			nProps = siteswap.nProps;
			const props = [];
			for (let i = 0; i < nProps; i++)
				props.push({
					color: colors.props[i % colors.props.length],
					type: propType,
				});

			siteswapName = siteswapNames[siteswap.canonicString()];

			jif = siteswap.toJif({
				name: siteswapName ? siteswapName + " (" + siteswap.toString() + ")" : undefined,
				jugglers: jugglers,
				limbs: limbs,
				props: props,
				flipTwos: true
			});
			startProperties = siteswap.getStartProperties(nJugglers);

			localPeriod = period % nJugglers == 0 ? period / nJugglers : period;

			startConfigurations = siteswap.startConfigurations(nJugglers);

			prechacthisUrl = 'http://prechacthis.org/info.php?pattern=['
		 + startConfigurations[0].local.map(function(x) { var h = x.height / 2; return 'p(' + h + (+x.height & 1 ? ',1,' + (h + localPeriod / 2) : ',0,' + h) + ')';}).join(',')
		 + ']&persons=2';
		} else {
			valid = false;
		}
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
			title: 'Siteswap ' + strippedInput + (siteswapName ? ' (' + siteswapName + ')' : '') + ' - passist.org',
		});
		return false;
	}

</script>

<style>
	.causalDiagram { overflow-x:auto; margin-bottom:1em }
	a.arrow { color:inherit; text-decoration:none; cursor:pointer }
	.sharebutton { margin-top:1em }
	.localThrows { overflow-x:auto; margin-bottom:1em }
	.localThrows td { white-space:nowrap }
	.jif-button { float:right }
	label.pure-button { margin:0 }
</style>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

{#if jifdev}
	<button class="pure-button jif-button" on:click={e => {
		// localStorage.setItem("jif", JSON.stringify(jif)); goto('/jif');
		console.log(jif);
	}}>JIF</button>
{/if}

<SiteswapInput
	bind:siteswapInput={siteswapInput}
	bind:nJugglers={nJugglers}
	bind:valid={valid}
	idPrefix=main
/>

{#if valid || fullscreen}
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
		{nProps} props, period {period}, squeezes {startProperties.squeezes}{startProperties.isGroundState ? ', ground state' : ''}

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
					<td colspan={localPeriod + 1}>Siteswap</td>
					<td colspan={localPeriod + 1}>
						{#if nJugglers == 2}
							<a href={prechacthisUrl}>Prechac</a>
						{:else}
							Prechac
						{/if}
					</td>

					{#if nJugglers == 2}
						<td colspan={localPeriod}>Words</td>
					{/if}
				</tr>
				{#each startConfigurations as j}
					<tr>
						<th>{j.name} <sub>{j.startPropsLeft}|{j.startPropsRight}</sub></th>
						{#each j.local as t}
							<td>{t.siteswap}{@html t.desc}&nbsp;</td>
						{/each}
						<td class=px-3 />
						{#each j.local as t}
							<td>{prechac(t.height, nJugglers)}{@html t.desc}</td>
						{/each}
						{#if nJugglers == 2}
							<td class=px-3 />
							{#each j.local as t}
								<td>{word(t.height)},&nbsp;</td>
							{/each}
						{/if}
					</tr>

				{/each}
			</table>

		</div>
	{/if}

	{#if valid}
		<div class=causalDiagram>
			<CausalDiagramWidget
				{jif}
				{startConfigurations}
				steps={nJugglers * period * 2}
				{url}
			/>
		</div>
	{/if}

	{#if showAnimationWidget}
	<AnimationWidget
		{jif}
		width={windowWidth > 1000 ? 1000 : windowWidth - 32}
		height=300
		closeButton=true
		enableSettings=true
		options={animationOptions}
		bind:fullscreen={fullscreen}
		on:fullscreenChange={onFullscreenChange}
		on:close={e => {showAnimationWidget = false;}}
	>
		<SiteswapInput
			bind:siteswapInput={siteswapInput}
			bind:nJugglers={nJugglers}
			bind:valid={valid}
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
			type=number
			id=jugglingspeed
			label='Juggling speed'
			step=0.1
		/>
		<InputField
			bind:value={animationSpeed}
			type=number
			id=animationspeed
			label='Animation speed'
			step=0.1
			min=0.1
		/>
		<InputField
			id=orbits
			bind:value={showOrbits}
			type=checkbox
			label="Show orbits"
		/>
	</AnimationWidget>

	{:else}
		<button class="pure-button" on:click={e => {showAnimationWidget = true;}}>Show Animation</button>
	{/if}


	{#if sharebutton}
		<button class="sharebutton pure-button" on:click={share}><Icon type=send /> share</button>
	{/if}
{:else if siteswapInput}
	<div>
		<img src=images/mr_meeseeks_shocked_small.png alt="mr meeseeks is shocked to see no siteswaps">
		<p>Invalid Siteswap</p>
	</div>
{:else}
	<!-- empty string: no output -->
{/if}
