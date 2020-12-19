<svelte:options namespace=svg />

<script>
	export let type;
</script>

<style>
	.icon { cursor:pointer; vertical-align:middle }
</style>

<svg
	class="icon {type}"
	width=32
	height=32
	viewBox="0 0 32 32"
	fill=none
	stroke=currentcolor
	stroke-linecap=round
	stroke-linejoin=round
	stroke-width=2
	on:click
>
	{#if type == 'close'}
		<path d="M2 30 L30 2 M30 30 L2 2" />
	{:else if type == 'send'}
		<path d="M2 16 L30 2 16 30 12 20 Z M30 2 L12 20" />
	{:else if type == 'edit'}
		<path d="M30 7 L25 2 5 22 3 29 10 27 Z M21 6 L26 11 Z M5 22 L10 27 Z" />
	{:else if type == 'code'}
		<path d="M10 9 L3 17 10 25 M22 9 L29 17 22 25 M18 7 L14 27" />
	{:else if type == 'fullscreen'}
		<path d="M4 12 L4 4 12 4 M20 4 L28 4 28 12 M4 20 L4 28 12 28 M28 20 L28 28 20 28" />
	{:else if type == 'fullscreen_exit'}
		<path d="M4 12 L12 12 12 4 M20 4 L20 12 28 12 M4 20 L12 20 12 28 M28 20 L20 20 20 28" />
	{:else if type == 'settings'}
		<path d="M13 2 L13 6 11 7 8 4 4 8 7 11 6 13 2 13 2 19 6 19 7 21 4 24 8 28 11 25 13 26 13 30 19 30 19 26 21 25 24 28 28 24 25 21 26 19 30 19 30 13 26 13 25 11 28 8 24 4 21 7 19 6 19 2 Z" />
		<circle cx="16" cy="16" r="4" />
	{/if}
</svg>
