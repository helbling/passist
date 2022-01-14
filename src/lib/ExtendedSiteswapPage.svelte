<script>
	import InputField from '$lib/InputField.svelte';
	import CausalDiagramWidget from '$lib/CausalDiagramWidget.svelte';
	import AnimationWidget from '$lib/AnimationWidget.svelte';
	import Icon from '$lib/Icon.svelte';
	import { defaults, useLocalStorage, U } from '$lib/passist.mjs';
	import { browser } from '$app/env';
	import ExtendedSiteswap from '$lib/extended_siteswap.mjs';

	export let patternInput = "(a, [33p])";
	export let fullscreen = false;
	let pattern;
	let patternValid = false;
	let period;
	let jif;
	let propType = defaults.propType;
	let jugglingSpeed = defaults.jugglingSpeed;
	let animationSpeed = defaults.animationSpeed;
	let showOrbits = false;
	let windowWidth;
	let windowHeight;
	let limbs = [];
	let title;

$:	{
		pattern = new ExtendedSiteswap(patternInput);
		patternValid = pattern.isValid();
	console.log('valid', patternValid);
	}

</script>

<style>
	/*.causalDiagram { overflow-x:auto; margin-bottom:1em }*/
	label.pure-button { margin:0 }
</style>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<svelte:head>
	<title>passist - {title}</title>
</svelte:head>

<InputField
	bind:value={patternInput}
	id=patternInput
	label=Pattern
	type=search
	valid={patternValid || !patternInput}
	attr={{
		class:     'siteswap',
		inputmode: 'verbatim',
		size:      20,
	}}
		/>

{#if patternValid || fullscreen}
	<!--
	<h2>{pattern.toString()}</h2>
	-->

	<h3>AST:</h3>
	<pre>
		{JSON.stringify(pattern.ast, null, 2)}
	</pre>
	<h3>JIF:</h3>
	<!--
	{#if patternValid}
		<div class=causalDiagram>
			<CausalDiagramWidget
				{jif}
			/>
		</div>
	{/if}
	-->
	<pre>
	{JSON.stringify(jif, null, 2)}
	</pre>

	<!--
	<div class=animation-wrapper style="width:{windowWidth > 1000 ? 1000 : windowWidth - 32}px; height:300px">
		<AnimationWidget
			{jif}
			initialFullscreen={fullscreen}
			closeButton={true}
			enableSettings={true}
			valid={patternValid}
			jugglingSpeed={parseFloat(jugglingSpeed)}
			animationSpeed={parseFloat(animationSpeed)}
			{showOrbits}
		>
			<InputField
				bind:value={patternInput}
				id=patternInput
				label=Pattern
				type=search
				valid={patternValid || !patternInput}
				attr={{
					class:     'siteswap',
					inputmode: 'verbatim',
					size:      20,
				}}
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
	</div>
	-->

{:else if patternInput}
	<div>
		<!--
		<img src=/images/mr_meeseeks_shocked_small.png alt="mr meeseeks is shocked to see an invalid siteswap" >
			-->
		<p>Invalid Pattern</p>
		{#if pattern.error}
			{pattern.error}

		{/if}

	</div>
{:else}
	<!-- empty string: no output -->
{/if}
