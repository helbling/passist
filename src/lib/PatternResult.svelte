<script>
	import SiteswapInput from '$lib/SiteswapInput.svelte';
	import CausalDiagramWidget from '$lib/CausalDiagramWidget.svelte';
	import AnimationWidget from '$lib/AnimationWidget.svelte';
	import Siteswap from '$lib/siteswap.mjs';
	import ExtendedSiteswap from '$lib/extended_siteswap.mjs';
	import Icon from '$lib/Icon.svelte';
	import InputField from '$lib/InputField.svelte';
	import { defaults } from '$lib/passist.mjs';

	export let nJugglers = defaults.nJugglers;
	export let jif = {};
	export let valid = false;
	export let fullscreen = false;
	export let startConfigurations = {};
	export let causalDiagramSteps = 10; // TODO
	export let showAnimationWidget = false;

	let animationSpeed = defaults.animationSpeed;
</script>

<slot name="input"/>

<slot name="info"/>

{#if valid}
	<div class=causalDiagram>
		<CausalDiagramWidget
			{jif}
			{startConfigurations}
			steps={cauaslDiagramSteps}
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
