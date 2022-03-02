<svelte:options namespace=svg />

<script>
	export let type;
	export let fill = false;

	const paths = {
		'caret-bottom':  "M30 10 L16 26 2 10 Z",
		'caret-right':   "M10 30 L26 16 10 2 Z",
		close:           "M2 30 L30 2 M30 30 L2 2",
		code:            "M10 9 L3 17 10 25 M22 9 L29 17 22 25 M18 7 L14 27",
		edit:            "M30 7 L25 2 5 22 3 29 10 27 Z M21 6 L26 11 Z M5 22 L10 27 Z",
		fullscreen_exit: "M4 12 L12 12 12 4 M20 4 L20 12 28 12 M4 20 L12 20 12 28 M28 20 L20 20 20 28",
		fullscreen:      "M4 12 L4 4 12 4 M20 4 L28 4 28 12 M4 20 L4 28 12 28 M28 20 L28 28 20 28",
		load:            "M28 22 L28 30 4 30 4 22 M16 4 L16 24 M8 12 L16 4 24 12",
		pause:           "M23 2 L23 30 M9 2 L9 30",
		play:            "M10 2 L10 30 24 16 Z",
		plus:            "M16 2 L16 30 M2 16 L30 16",
		reload:          "M29 16 C29 22 24 29 16 29 8 29 3 22 3 16 3 10 8 3 16 3 21 3 25 6 27 9 M20 10 L27 9 28 2",
		save:            "M28 22 L28 30 4 30 4 22 M16 4 L16 24 M8 16 L16 24 24 16",
		send:            "M2 16 L30 2 16 30 12 20 Z M30 2 L12 20",
		settings:        "M13 2 L13 6 11 7 8 4 4 8 7 11 6 13 2 13 2 19 6 19 7 21 4 24 8 28 11 25 13 26 13 30 19 30 19 26 21 25 24 28 28 24 25 21 26 19 30 19 30 13 26 13 25 11 28 8 24 4 21 7 19 6 19 2 Z",
		trash:           "M28 6 L6 6 8 30 24 30 26 6 4 6 M16 12 L16 24 M21 12 L20 24 M11 12 L12 24 M12 6 L13 2 19 2 20 6",
	};
	let d;

$:  d = paths[type];

</script>

<style>
	.icon { cursor:pointer; vertical-align:middle }
</style>

<svg
	class="icon {type}"
	width=32
	height=32
	viewBox="0 0 32 32"
	fill={fill ? 'currentcolor' : 'none'}
	stroke=currentcolor
	stroke-linecap=round
	stroke-linejoin=round
	stroke-width=2
	on:click
>

	{#if d}
		<path {d} />
		{#if type == 'settings'}
			<circle cx="16" cy="16" r="4" />
		{/if}
	{/if}

</svg>
