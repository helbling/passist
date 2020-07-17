<script>
	import SiteswapInput from './SiteswapInput.svelte';
	import CausalDiagramWidget from './CausalDiagramWidget.svelte';
	import AnimationWidget from './AnimationWidget.svelte';
	import Siteswap from './siteswap.js';
	import Icon from './Icon.svelte';
	import { siteswapNames} from './patterns.js';
	import { defaults, siteswapUrl } from './passist.js';
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
	let windowWidth;
	let windowHeight;
	let sharebutton = process.browser === true && 'share' in navigator;

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
			jif = siteswap.toJif({
				nJugglers: nJugglers,
				flipTwos: true
			});
			valid = siteswap.isValid();
			period = siteswap.period;
			nProps = siteswap.nProps;
			siteswapName = siteswapNames[siteswap.canonicString()];
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
	a.arrow { color:inherit; text-decoration:none }
	.sharebutton { margin-top:1em }
</style>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

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

	<div class=causalDiagram>
		<CausalDiagramWidget
			{jif}
			{startConfigurations}
			steps={nJugglers * period * 2}
			{url}
		/>
	</div>

	<AnimationWidget
		{jif}
		{valid}
		width={windowWidth > 1000 ? 1000 : windowWidth - 32}
		height=300
		bind:fullscreen={fullscreen}
		on:fullscreenChange={onFullscreenChange}
	>
		<SiteswapInput
			bind:siteswapInput={siteswapInput}
			bind:nJugglers={nJugglers}
			bind:valid={valid}
			idPrefix=animation
		/>
	</AnimationWidget>

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
