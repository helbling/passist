<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import Animation from './animation.js';
	import Icon from './Icon.svelte';

	export let jif;
	export let fullscreen = false;
	export let teaser = true;
	export let width = 400;
	export let height = 300;
	export let closeButton = false;
	export let enableSettings = false;
	export let options = {};
	let windowWidth;
	let windowHeight;
	let w, h;
	let anim;
	let paused = false;
	let loaded = false;
	let canvas;
	let dragging = false;
	let dragStart;
	let fps = '';
	let fpsInterval;
	let animationJif;
	let showSettings = false;

	$: w = fullscreen ? windowWidth : width;
	$: h = fullscreen ? windowHeight : height;
	$: animationJif = JSON.parse(JSON.stringify(jif)); // deep clone

	const dispatch = createEventDispatcher();

	onMount(async () => {
		anim = new Animation(canvas, animationJif, options, w, h);
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

	$: if (process.browser === true && anim) { anim.updateScene(animationJif, options); }
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
	<div class="controls topright">
		<Icon type=close on:click={e => {showSettings = false; toggleFullscreen()}}/>
	</div>

	{#if enableSettings}
		<div class="controls topleft">
			<Icon type=settings on:click={e => showSettings = !showSettings}/>
		</div>
		{#if showSettings}
		<div class="settings pure-form form-inline">
			<slot></slot>

			<div class=fps>
			FPS: {fps}
			</div>
		</div>

		{/if}
	{/if}
	{/if}
	{#if options.valid}
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
