<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import Animation from './animation.js';
	import InputField from './InputField.svelte';
	import Icon from './Icon.svelte';

	export let jif;
	export let valid = false;
	export let fullscreen = false;
	export let teaser = true;
	export let width = 400;
	export let height = 300;
	let window_width;
	let window_height;
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

	$: w = fullscreen ? window_width : width;
	$: h = fullscreen ? window_height : height;

	$: { // defaults
		if (!jif.propType)
			jif.propType = 'club';
		jif.beatsPerSecond = jif.beatsPerSecond ? parseFloat(jif.beatsPerSecond) : (1.4 * jif.n_hands);
		jif.animationSpeed = jif.animationSpeed ? parseFloat(jif.animationSpeed) : 1.0;
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
			anim.cleanup();
			anim = undefined;
		}
		if (fpsInterval)
			clearInterval(fpsInterval);
	});

	$: if (process.browser === true && anim) { anim.updateScene(jif, valid); }
	$: if (process.browser === true && anim) { anim.resize(w, h);  }
	$: if (process.browser === true) { document.body.style.overflow = fullscreen ? 'hidden' : 'auto'; }

	function toggleFullscreen() {
		dispatch('fullscreen_change', !fullscreen);
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
	.teaser_foreground   { position:absolute; top:0; bottom:0; left:0; right:0; z-index:21; cursor:pointer }
	.message { color:white; background-color:rgba(0,0,0,0.2); pointer-events:none; position:absolute; bottom:2ex; left:50%; transform:translateX(-50%); padding:0 1ex; border-radius:1ex  }
	.fullscreen .message { position:absolute; z-index:21; }
</style>

<svelte:window
	bind:innerWidth={window_width}
	bind:innerHeight={window_height}
	on:mousedown|capture={onDown}
	on:mousemove|capture={onMove}
	on:mouseup|capture={onUp}
	on:touchstart|capture={ e => e.touches.length == 1        && onDown(e.touches[0])     }
	on:touchmove|capture={  e => e.touches.length == 1        && onMove(e.touches[0])     }
	on:touchend|capture={   e => e.changedTouches.length == 1 && onUp(e.changedTouches[0])}
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
	{#if fullscreen}
	<div class="controls topright">
		<Icon type=close on:click={e => {showSettings = false; toggleFullscreen()}}/>
	</div>
	{/if}
	{#if showSettings}
	<div class="settings">
		<slot></slot>
		<InputField
			id=proptype
			type=custom
			label="Prop type"
		>
			<div class="btn-group btn-group-toggle" data-toggle="buttons">
				<label class="btn btn-light" class:active={jif.propType == 'ball'}>
					<input type="radio" bind:group={jif.propType} value="ball" autocomplete="off"> Balls
				</label>
				<label class="btn btn-light" class:active={jif.propType == 'club'}>
					<input type="radio" bind:group={jif.propType} value="club" autocomplete="off"> Clubs
				</label>
			</div>
		</InputField>
		<InputField
			bind:value={jif.beatsPerSecond}
			type=number
			id=bps
			label='Beats per second'
			step=0.1
		/>
		<InputField
			bind:value={jif.animationSpeed}
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
			<div class=teaser_foreground on:click={toggleFullscreen}>
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
