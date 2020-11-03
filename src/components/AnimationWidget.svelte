<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import Animation from './animation.js';
	import InputField from './InputField.svelte';
	import Icon from './Icon.svelte';
	import { defaults, useLocalStorage } from './passist.js';

	export let jif;
	export let valid = false;
	export let fullscreen = false;
	export let teaser = true;
	export let width = 400;
	export let height = 300;
	export let closeButton = false;
	let windowWidth;
	let windowHeight;
	let w, h;
	let anim;
	let paused = false;
	let loaded = false;
	let canvas;
	let dragging = false;
	let dragStart;
	let showSettings = false;
	let fps = '';
	let fpsInterval;
	let jugglingSpeed = 2.8;
	let animationSpeed = 0.8;

	$: w = fullscreen ? windowWidth : width;
	$: h = fullscreen ? windowHeight : height;

	$: { // defaults
		if (!jif.propType) {
			if (useLocalStorage) {
				const lsPropType = localStorage.getItem("propType");
				jif.propType = lsPropType ? lsPropType : defaults.propType;
			} else {
				jif.propType = defaults.propType;
			}
		} else if (useLocalStorage)
			localStorage.setItem("propType", jif.propType);
		jif.jugglingSpeed = jugglingSpeed ? parseFloat(jugglingSpeed) : 2.8;
		jif.animationSpeed = animationSpeed ? parseFloat(animationSpeed) : 1.0;
		jif.showOrbits = ('showOrbits' in jif) ? jif.showOrbits : false;
	}

	const dispatch = createEventDispatcher();

	onMount(async () => {
		anim = new Animation(canvas, jif, valid, w, h);
		loaded = true;
		fpsInterval = setInterval(() => fps = anim.fps, 1000);
	});

	onDestroy(() => {
		if (anim) {
			anim.destroy();
			anim = undefined;
		}
		if (fpsInterval)
			clearInterval(fpsInterval);
	});

	$: if (process.browser === true && anim) { anim.updateScene(jif, valid); }
	$: if (process.browser === true && anim) { anim.resize(w, h);  }
	$: if (process.browser === true) { document.body.style.overflow = fullscreen ? 'hidden' : 'auto'; }

	function toggleFullscreen() {
		dispatch('fullscreenChange', !fullscreen);
	}
	function togglePause() {
		if (anim)
			paused = anim.togglePause();
	}

	function handleEvent(e) {
		return fullscreen && e.target.tagName == "CANVAS";
	}
	function onDown(e) {
		if (!handleEvent(e))
			return;
		if (showSettings) {
			showSettings = false;
			return;
		}
		dragging = false;
		dragStart = [e.clientX, e.clientY];
	}
	function onMove(e) {
		if (!handleEvent(e))
			return;
		if (
			dragStart && (
				Math.abs(e.clientX - dragStart[0]) > 10 ||
				Math.abs(e.clientY - dragStart[1]) > 10
			))
				dragging = true;
	}
	function onUp(e) {
		dragStart = undefined;
		if (dragging || !handleEvent(e))
			return;
		togglePause();
	}
	function onKeyDown(e) {
		if (e.key == ' ')
			togglePause();
		if (fullscreen && e.key == 'Escape')
			toggleFullscreen();
	}
</script>

<style>
	.outer { position:relative; margin:0; padding:0 }
	.outer.fullscreen { position:fixed; top:0; bottom:0; left:0; right:0; z-index:9999 }
	canvas { position:absolute; top:0; right:0; bottom:0; left:0; z-index:10; cursor:grab }
	canvas.dragging { cursor:grabbing }
	.background {  position:absolute; z-index:0; top:0; right:0; bottom:0; left:0; background-color:#c9ede7 }
	.controls { position:absolute; z-index:20 }
	.controls.topleft  { top:1ex; left:1ex }
	.controls.topright { top:1ex; right:1ex }
	.settings { position:absolute; z-index:20; top:5ex; left:1ex; max-width:calc(100% - 2ex); max-height:calc(100% - 7ex); overflow:auto; display:flex; flex-direction:column; align-items:flex-start; background-color:rgba(0,0,0,0.2); padding:1em; border-radius:0.5em; margin-top:1ex }
	.teaserForeground   { position:absolute; top:0; bottom:0; left:0; right:0; z-index:21; cursor:pointer }
	.message { color:white; background-color:rgba(0,0,0,0.2); pointer-events:none; position:absolute; bottom:2ex; left:50%; transform:translateX(-50%); padding:0 1ex; border-radius:1ex  }
	.fullscreen .message { position:absolute; z-index:21; }
	label.pure-button { margin:0 }
</style>

<svelte:window
	bind:innerWidth={windowWidth}
	bind:innerHeight={windowHeight}
	on:pointerdown|capture={onDown}
	on:pointermove|capture={onMove}
	on:pointerup|capture={onUp}
	on:keydown={onKeyDown}
/>


<div class=outer class:fullscreen style="width:{w}px; height:{h}px">
	<div class=background />
	<canvas
		bind:this={canvas}
		class:dragging={dragStart}
	/>
	{#if fullscreen || !teaser}
	<div class="controls topleft">
		<Icon type=settings on:click={e => showSettings = !showSettings}/>
	</div>
	<div class="controls topright">
		<Icon type=close on:click={e => {showSettings = false; toggleFullscreen()}}/>
	</div>
	{#if showSettings}
	<div class="settings pure-form form-inline">
		<slot></slot>
		<InputField
			id=proptype
			type=custom
			label="Prop type"
		>
			<label class="pure-button" class:pure-button-active={jif.propType == 'ball'}>
				<input type="radio" bind:group={jif.propType} value="ball" autocomplete="off"> Balls
			</label>
			<label class="pure-button" class:pure-button-active={jif.propType == 'club'}>
				<input type="radio" bind:group={jif.propType} value="club" autocomplete="off"> Clubs
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
			bind:value={jif.showOrbits}
			type=checkbox
			label="Show orbits"
		/>
		<div class=fps>
		FPS: {fps}
		</div>
	</div>
	{/if}
	{/if}
	{#if valid}
		{#if teaser && !fullscreen}
			<div class=teaserForeground on:click={toggleFullscreen}>
				{#if closeButton}
				<div class="controls topright" on:click|stopPropagation={dispatch('close', !fullscreen)}>
					<Icon type=close/>
				</div>
				{/if}
				{#if loaded}
				<div class=message>Click to interact</div>
				{/if}
			</div>
		{/if}
		{#if fullscreen && paused}
			<div class=message>Paused - Click to continue</div>
		{/if}
	{:else}
		<div class=message>Invalid Pattern</div>
	{/if}
</div>
