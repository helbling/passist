<script>
	import SiteswapInput from '$lib/SiteswapInput.svelte';
	import CausalDiagramWidget from '$lib/CausalDiagramWidget.svelte';
	import AnimationWidget from '$lib/AnimationWidget.svelte';
	import Siteswap from '$lib/siteswap.mjs';
	import ExtendedSiteswap from '$lib/extended_siteswap.mjs';
	import Icon from '$lib/Icon.svelte';
	import InputField from '$lib/InputField.svelte';
	import { defaults, useLocalStorage, siteswapUrl, jifdev } from '$lib/passist.mjs';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	export let jif = {};
	export let valid = false;
	export let fullscreen = false;
	export let startConfigurations = {};
	export let causalDiagramSteps = 10; // TODO
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

	function share() {
		navigator.share({
			url: location.href,
			title: title + ' - passist.org',
		});
		return false;
	}

	// TODO: handle urls and title
	// function getUrl(p = {}) {
	// 	p = Object.assign({
	// 		siteswapInput: input,
	// 		nJugglers: nJugglers,
	// 		handsInput: handsInput,
	// 		fullscreen: fullscreen,
	// 	}, p);
	// 	return siteswapUrl(p);
	// }
	function onFullscreenChange(e) {
		// const url = getUrl({fullscreen: e.detail});
		// goto(url);
	}
</script>

<style>
	.causalDiagram { overflow-x:auto; margin-bottom:1em }
	.sharebutton { margin-top:1em }
	.animationWidget { max-width:100%; overflow-x:auto; overflow-y:hidden }
	.jif-button { float:right; margin-left:0.5em }
	.animation-controls { display:flex; flex-flow:row wrap }
</style>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<svelte:head>
	<title>passist - {title}</title>
</svelte:head>

<slot name="input"/>

{#if jifdev && valid && jif}
	<button class="pure-button jif-button" on:click={e => {
		localStorage.setItem("jif", JSON.stringify(jif, null, 2)); goto('/jif');
	}}>
		<Icon type=code /> JIF
	</button>
{/if}

<slot name="info"/>

{#if valid}
	<div class=causalDiagram>
		<CausalDiagramWidget
			{jif}
			{startConfigurations}
			steps={causalDiagramSteps}
		/>
	</div>
{/if}

{#if valid || fullscreen}

{#if showAnimationWidget}
<div class="animationWidget">
	<div style="width:{windowWidth > 1032 ? 1000 : windowWidth - 32}px; height:300px">
		<AnimationWidget
			{jif}
			initialFullscreen={fullscreen}
			closeButton={true}
			enableSettings={true}
			{valid}
			jugglingSpeed={parseFloat(jugglingSpeed)}
			animationSpeed={parseFloat(animationSpeed)}
			{showOrbits}
			on:fullscreenchange={onFullscreenChange}
			on:close={e => {showAnimationWidget = false;}}
		>
			<!-- INPUT -->
			<!-- Animation Options -->
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

{:else}
<!-- empty string as input: no output -->
{/if}
