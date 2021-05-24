<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import defaults from '$lib/defaults.mjs';
	import Icon from './Icon.svelte';
	import InputField from './InputField.svelte';
	import { browser } from '$app/env';

	export let jif;
	export let teaser = true;
	export let closeButton = false;
	export let enableSettings = false;
	export let initialFullscreen = false;
	export let valid = true;
	export let jugglingSpeed = defaults.jugglingSpeed;
	export let animationSpeed = defaults.animationSpeed;
	export let showOrbits = false;
	export let resolution = 'medium';

	let animation;
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
	let animationOptions = {};
	let width;
	let height;
	let pixelRatio = 1;

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
	$: pixelRatio = { low:0.5, medium:1, high:2 }[resolution];
	$: animationOptions = { valid, jugglingSpeed, animationSpeed, showOrbits };
	$: sizeOptions = { width, height, pixelRatio };

	const dispatch = createEventDispatcher();

	$: {
		isFull = isFullscreen || isMaximized;
		dispatch('fullscreenchange', isFull);
	}

	const onFullscreenChange = e => {
		isFullscreen = (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) === container;
	};
	onMount(async () => {
		const Animation = (await import('$lib/animation.mjs')).default; // dynamic import, only on browser

		animation = new Animation(canvas, animationJif, animationOptions, sizeOptions);
		loaded = true;
		fpsInterval = setInterval(() => fps = animation.fps, 1000);

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
		if (animation) {
			animation.destroy();
			animation = undefined;
		}
		if (fpsInterval)
			clearInterval(fpsInterval);

		if (browser === true)
			document.removeEventListener("fullscreenchange", onFullscreenChange);
	});

	$: if (browser === true && animation) { animation.updateScene(animationJif, animationOptions); }
	$: if (browser === true && animation) { animation.resize(sizeOptions); }
	$: if (browser === true) { document.body.style.overflow = isMaximized ? 'hidden' : 'auto'; }

	function togglePause() {
		if (animation)
			paused = animation.togglePause();
	}

	function handleEvent(e) {
		return (isFull || !teaser) && e.target.tagName == "CANVAS";
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
	.container    { position:relative; margin:0; padding:0; width:100%; height:100%; display:inline-block; overflow:hidden }
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
	.message { color:white; background-color:rgba(0,0,0,0.2); pointer-events:none; position:absolute; bottom:2ex; left:50%; transform:translateX(-50%); padding:0 1ex; border-radius:1ex; z-index:21  }
	label.pure-button { margin:0 }
	.fps { margin-left:1.5ex }
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
			<InputField
				id=resolution
				type=custom
				label="Resolution"
			>
				<label class="pure-button" class:pure-button-active={resolution == 'low'}>
					<input type="radio" bind:group={resolution} value="low" autocomplete="off"> low
				</label>
				<label class="pure-button" class:pure-button-active={resolution == 'medium'}>
					<input type="radio" bind:group={resolution} value="medium" autocomplete="off"> medium
				</label>
				<label class="pure-button" class:pure-button-active={resolution == 'high'}>
					<input type="radio" bind:group={resolution} value="high" autocomplete="off"> high
				</label>
			</InputField>
		</div>

		{/if}
	{/if}
	{/if}
	{#if valid}
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
		{#if (isFull || !teaser) && paused}
			<div class=message>Paused - Click to continue</div>
		{/if}
	{:else}
		<div class=message>Invalid Pattern</div>
	{/if}
</div>
