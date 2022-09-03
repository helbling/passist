<script>
	import ExtendedSiteswapInput from '$lib/ExtendedSiteswapInput.svelte';
	import AnimationWidget from '$lib/AnimationWidget.svelte';
	import ExtendedSiteswap from '$lib/extended_siteswap.mjs';
	import Icon from '$lib/Icon.svelte';
	import InputField from '$lib/InputField.svelte';
	import { siteswapNames} from '$lib/patterns.mjs';
	import { defaults, useLocalStorage, extendedSiteswapUrl, siteswapAlternativesUrl, jugglerName, defaultLimbs, jifdev, U } from '$lib/passist.mjs';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	export let siteswapInputs = [];
	export let nJugglers = 2;
	export let fullscreen = false;

	let siteswapInput = '';
	let extendedSiteswap;
	let siteswapValid = false;
	let nProps;
	let siteswapName;
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

	$: siteswapInput = '<' + siteswapInputs.join('|') + '>';

	function getUrl(p = {}) {
		p = Object.assign({
			siteswapInputs,
			nJugglers,
			fullscreen: fullscreen,
		}, p);
		return extendedSiteswapUrl(p);
	}
	function onFullscreenChange(e) {
		const url = getUrl({fullscreen: e.detail});
		goto(url);
	}

$: {
		extendedSiteswap = new ExtendedSiteswap(siteswapInput);
		siteswapValid = extendedSiteswap.isValid();
		siteswapName = siteswapNames[extendedSiteswap.nJugglers + '|' + extendedSiteswap.toString()];

		title = 'Extended Siteswap ' + siteswapInput;

		if (siteswapValid) {
			jif = extendedSiteswap.toJif({
				name: siteswapName ? siteswapName + " (" + extendedSiteswap.toString() + ")" : undefined,
				generator: 'passist', // TODO: put version of package.json here again
				// jugglers: jugglers,
				// limbs: limbs,
				// props: props,
				flipTwos: true, // TODO: implement this
			});
			nProps = extendedSiteswap.nProps();
		}
	}

	function share() {
		navigator.share({
			url: location.href,
			title: title + ' - passist.org',
		});
		return false;
	}
</script>

<style>
	.sharebutton { margin-top:1em }
	.animationWidget { max-width:100%; overflow-x:auto; overflow-y:hidden }
	.jif-button { float:right; margin-left:0.5em }
	label.pure-button { margin:0 }
	.animation-controls { display:flex; flex-flow:row wrap }
</style>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<svelte:head>
	<title>passist - {title}</title>
</svelte:head>

<ExtendedSiteswapInput
	bind:siteswapInputs
	bind:nJugglers
	bind:siteswapValid
	idPrefix=main
/>
{#if jifdev && siteswapValid}
	<button class="pure-button jif-button" on:click={e => {
		localStorage.setItem("jif", JSON.stringify(jif, null, 2)); goto('/jif');
	}}>
		<Icon type=code /> JIF
	</button>
{/if}

{#if siteswapValid || fullscreen}
	<h2>
		{extendedSiteswap.toString()}
	</h2>

	{#if siteswapName}
		<h2>{siteswapName}</h2>
	{/if}

	<p>
		Extended Siteswap, {nProps} props, {extendedSiteswap.nJugglers()} juggler{extendedSiteswap.nJugglers() > 1 ? 's' : ''}
	</p>
	<p>
		Note: Support for extended siteswaps is new and might still have some bugs and rough edges..
	</p>

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
			<ExtendedSiteswapInput
					bind:siteswapInputs
					bind:nJugglers
					bind:siteswapValid
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

{:else if siteswapInput}
	<div>
		<img src=/images/mr_meeseeks_shocked_small.png alt="mr meeseeks is shocked to see an invalid siteswap" >
		<p>Invalid Siteswap</p>

		{#if extendedSiteswap && extendedSiteswap.error}
			<p>
			{extendedSiteswap.error}
			{#if extendedSiteswap.error.snippet}
				<pre>{extendedSiteswap.error.snippet}</pre>
			{/if}
			</p>
		{/if}
	</div>
{:else}
	<!-- empty string: no output -->
{/if}
