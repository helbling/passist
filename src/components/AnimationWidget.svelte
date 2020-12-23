<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import Animation from './animation.js';
	import Icon from './Icon.svelte';

	export let jif;
	export let teaser = true;
	export let closeButton = false;
	export let enableSettings = false;
	export let options = {};
	export let initialFullscreen;
	let anim;
	let paused = false;
	let loaded = false;
	let canvas;
	let container;
	let dragging = false;
	let dragStart;
	let fps = '';
	let fpsInterval;
	let animationJif;
	let showSettings = false;
	let isFullscreen = false;
	let isMaximized = false;
	let isFull = false;
	let width;
	let height;

	const noop = () => {};
	const maximize = () => {
		isMaximized = true;
		return new Promise((resolve, reject) => {
			resolve()
		})
	};
	const unmaximize = () => { isMaximized = false;  };

	let requestFullscreen = maximize;
	let exitFullscreen = unmaximize;

	$: animationJif = JSON.parse(JSON.stringify(jif)); // deep clone

	const dispatch = createEventDispatcher();

	$: isFull = isFullscreen || isMaximized;

	const onFullscreenChange = e => {
		isFullscreen = document.fullscreenElement === container;
		dispatch('fullscreenchange', isFullscreen);
	};
	onMount(async () => {
		anim = new Animation(canvas, animationJif, options, width, height);
		loaded = true;
		fpsInterval = setInterval(() => fps = anim.fps, 1000);

		requestFullscreen = () => {
			const requestFS = (
				container.requestFullscreen ||
				container.mozRequestFullScreen ||
				container.webkitRequestFullscreen ||
				container.msRequestFullscreen ||
				maximize
			).bind(container);
			requestFS().catch(e => {
				maximize();
			});
		};

		exitFullscreen = () => {
			if (isMaximized) {
				unmaximize();
			} else {
				(
					document.exitFullscreen ||
					document.mozCancelFullScreen ||
					document.webkitExitFullscreen ||
					document.msExitFullscreen ||
					noop
				).bind(document)();
			}
		};

		document.addEventListener("fullscreenchange", onFullscreenChange);

		if (initialFullscreen)
			requestFullscreen();

		setTimeout(() => {
			const containerRect = container.getBoundingClientRect();
			if (containerRect.width != width || containerRect.height != height) {
				width = containerRect.width;
				height = containerRect.height;
			}
		}, 1);

	});

	onDestroy(() => {
		if (anim) {
			anim.destroy();
			anim = undefined;
		}
		if (fpsInterval)
			clearInterval(fpsInterval);

		document.removeEventListener("fullscreenchange", onFullscreenChange);
	});

	$: if (process.browser === true && anim) { anim.updateScene(animationJif, options); }
	$: if (process.browser === true && anim) { anim.resize(width, height); }
	$: if (process.browser === true) { document.body.style.overflow = isMaximized ? 'hidden' : 'auto'; }

	function togglePause() {
		if (anim)
			paused = anim.togglePause();
	}

	function handleEvent(e) {
		return isFull && e.target.tagName == "CANVAS";
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
		if (isFull && e.key == 'Escape')
			exitFullscreen();
	}
</script>

<style>
	.container    { position:relative; margin:0; padding:0; width:100%; height:100%; display:inline-block }
	.isFullscreen { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #fff; }
	.isMaximized  { position:fixed; top:0; right:0; bottom:0; left:0 }
	canvas { position:absolute; top:0; right:0; bottom:0; left:0; z-index:10; cursor:grab }
	canvas.dragging { cursor:grabbing }
	.background {  position:absolute; z-index:0; top:0; right:0; bottom:0; left:0; background-color:#c9ede7 }
	.controls { position:absolute; z-index:20 }
	.position-top    { top:1ex }
	.position-left   { left:1ex }
	.position-right  { right:1ex }
	.settings { position:absolute; z-index:20; top:5ex; left:1ex; max-width:calc(100% - 2ex); max-height:calc(100% - 7ex); overflow:auto; display:flex; flex-direction:column; align-items:flex-start; background-color:rgba(0,0,0,0.2); padding:1em; border-radius:0.5em; margin-top:1ex }
	.teaserForeground   { position:absolute; top:0; bottom:0; left:0; right:0; z-index:21; cursor:pointer }
	.message { color:white; background-color:rgba(0,0,0,0.2); pointer-events:none; position:absolute; bottom:2ex; left:50%; transform:translateX(-50%); padding:0 1ex; border-radius:1ex  }
	.isFullscreen .message { position:absolute; z-index:21; }
</style>

<svelte:window
	on:pointerdown|capture={onDown}
	on:pointermove|capture={onMove}
	on:pointerup|capture={onUp}
	on:keydown={onKeyDown}
/>

<div bind:this={container} class=container class:isFullscreen class:isMaximized bind:clientWidth={width} bind:clientHeight={height} >
	<div class=background />
	<canvas
		bind:this={canvas}
		class:dragging={dragStart}
	/>
	<div class="controls position-top position-right">
		{#if isFull}
		<Icon type=fullscreen_exit on:click={e => {showSettings = false; exitFullscreen()}}/>
		{:else}
		<Icon type=fullscreen on:click={requestFullscreen}/>
		{/if}
	</div>

	{#if isFull || !teaser}

	{#if enableSettings}
		<div class="controls position-top position-left">
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
		{#if teaser && !isFull}
			<div class=teaserForeground on:click={requestFullscreen}>
				{#if closeButton}
				<div class="controls position-top position-left" on:click|stopPropagation={dispatch('close', !isFull)}>
					<Icon type=close/>
				</div>
				{/if}
				{#if loaded}
				<div class=message>Click to interact in fullscreen</div>
				{/if}
			</div>
		{/if}
		{#if isFull && paused}
			<div class=message>Paused - Click to continue</div>
		{/if}
	{:else}
		<div class=message>Invalid Pattern</div>
	{/if}
</div>
