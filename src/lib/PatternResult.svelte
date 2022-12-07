<script>
	import SiteswapInput from '$lib/SiteswapInput.svelte';
	import CausalDiagramWidget from '$lib/CausalDiagramWidget.svelte';
	import AnimationWidget from '$lib/AnimationWidget.svelte';
	import Siteswap from '$lib/siteswap.mjs';
	import ExtendedSiteswap from '$lib/extended_siteswap.mjs';
	import Icon from '$lib/Icon.svelte';
	import InputField from '$lib/InputField.svelte';
	import { defaults, useLocalStorage, jifdev, U } from '$lib/passist.mjs';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	export let jif = {};
	export let valid = false;
	export let fullscreen = false;
	export let startConfigurations = false;
	export let causalDiagramSteps = 10; // TODO
	export let title;
	export let url;
	export let init;
	let propType = defaults.propType;
	let jugglingSpeed = defaults.jugglingSpeed;
	let animationSpeed = defaults.animationSpeed;
	let showOrbits = false;
	let windowWidth;
	let windowHeight;
	let sharebutton = browser === true && 'share' in navigator;
	let showAnimationWidget = false;
	let limbs = [];
	let fullUrl;


	if (init && init.url.searchParams.has('fullscreen'))
		fullscreen = parseInt(init.url.searchParams.get('fullscreen'))

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

	function colorProps(props, propType)
	{
		return props.map((v, k) => {
			if (!v.color)
				v.color = propColors[k % propColors.length];
			v.type = propType;
			return v;
		});
	}
	$: {
		if (jif && jif.props)
			jif.props = colorProps(jif.props, propType);
	}
	$: {
		const params = {};
		if (fullscreen)
			params.fullscreen = 1;
		fullUrl = U(url, params);
		console.log('fullurl:', fullUrl);
		if (browser === true && window && ('history' in window))
			history.replaceState({}, '', fullUrl);
	}

	function share() {
		navigator.share({
			url: location.href,
			title: title + ' - passist.org',
		});
		return false;
	}

	function onFullscreenChange(e) {
		fullscreen = e.detail;
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

{#if valid && startConfigurations}
	<div class=causalDiagram>
		<CausalDiagramWidget
			{jif}
			{startConfigurations}
			steps={causalDiagramSteps}
		/>
	</div>
{/if}

{#if valid || fullscreen} <!-- TODO: show animation widget if invalid jif as well -->

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
			<slot name="animation_input"/>
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

{:else}
<!-- empty string as input: no output -->
{/if}
