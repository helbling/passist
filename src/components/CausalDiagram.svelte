<svelte:options namespace=svg />

<script>
	import { onMount } from 'svelte';
	export let jif;
	export let start_configurations;
	export let steps = 1;

	let jugglers = {};
	let xoff = 55;
	let yoff = 70;
	let dy = 100;
	let dx;
	let r = 13
	let n_jugglers;
	let width, height;
	let nodes = {};
	const arrow_length = 20;

	onMount(async () => {
		// fix relative urls in svg paths (arrow heads) which don't work on ios because of sveltes base tag
		for (let path of document.querySelectorAll('path')) {
			let markerend = path.getAttribute('marker-end');
			if (path.hasAttribute('marker-end'))
				path.setAttribute('marker-end', path.getAttribute('marker-end').replace(/url\((#.*)\)/, 'url(' + location.href + '$1)'));
		}
	});

	function arrow(i, step, juggler_from, juggler_to) {
		var j = i + step;
		if (juggler_from != juggler_to || Math.abs(step) == n_jugglers)
			return "M" + xy(i, r, x(j), y(j, juggler_from), juggler_from) + " L" + xy(j, r + arrow_length, x(i), y(i, juggler_from), juggler_to);
		var dir_x = x(j) > x(i) ? 1 : -1;
		var dir_y = juggler_from ? 1 : -1;

		var offset_x = dir_x * dy / 2;
		var offset_y = dir_y * dy / 2;

		var control_point1 = (x(i) + offset_x) + "," + (y(i, juggler_from) + offset_y);
		var control_point2 = (x(j) - offset_x) + "," + (y(i, juggler_from) + offset_y);
		return "M" + xy(i, r, x(i) + dir_x, y(i, juggler_from) + dir_y, juggler_from)
				 + "C" + control_point1
				 + " " + control_point2
				 + " " + xy(j, r + arrow_length, x(j) - dir_x, y(i, juggler_from) + dir_y, juggler_from);
	};

	function x(i) { return xoff + i * dx;}
	function y(i, juggler) { return yoff + juggler * dy;}
	function xy(i, shorten, towards_x, towards_y, juggler) {
		let X = x(i);
		let Y = y(i, juggler);
		if (shorten) {
			let dx = towards_x - X;
			let dy = towards_y - Y;
			let len = Math.sqrt(dx * dx + dy * dy);
			X += shorten * dx / len;
			Y += shorten * dy / len;
		}
		return X + ',' + Y;
	}

$: {
		n_jugglers = jif.n_jugglers;
		dx = 70 / n_jugglers;

		width = steps * dx + 50;
		height = (n_jugglers - (n_jugglers > 1 ? 1 : 1.4)) * dy + 2 * yoff;

		nodes = [];
		for (let i = 0; i < jif.events.length; i++) {
			let event = jif.events[i];
			if (event.type != 'throw')
				continue;
			let t = event.time;
			let juggler_from = event.from_hand % n_jugglers;
			let juggler_to = event.to_hand % n_jugglers;

			nodes.push({
				r: r,
				x: x(t),
				y: y(t, juggler_from),
				class: (Math.floor(event.from_hand / n_jugglers) % 2) ? 'left_hand' : 'right_hand',
				juggler: juggler_from,
				label: event.label,
				arrow: arrow(i, event.duration - 2 * n_jugglers, juggler_from, juggler_to), // for ladder diagram: don't subtract 2 * n_jugglers
			});
		}
		nodes = nodes; // update svelte state
	}
</script>

<style>
	.arrow_stroke { stroke:#007bff }
	.arrow_fill   {   fill:#007bff }
	circle { stroke:#343a40 }
	circle.right_hand { fill:white }
	circle.left_hand  { fill:#b7c8d5 }
	.node_label { fill: #343a40 }
</style>

<svg {width} {height}>
	<defs>
		<marker
			id=arrow
			markerWidth=10
			markerHeight=10
			refX=0
			refY=3
			orient=auto
			markerUnits=strokeWidth>
			<path
				class=arrow_fill
				d='M0,0 L0,6 L9,3 z'
			/>
		</marker>
	</defs>
	<rect
		x=0
		y=0
		{width}
		{height}
		stroke=#ccc
		stroke-width=2px
		fill=none
	/>

	{#each start_configurations as j, i}
		<text
			x=10
			y={yoff + 9 + i * dy}
			font-size=20
			stroke-width=0px
			strke=black
		>{j.name}</text>

		<text
			x=20
			y={yoff - 10 + i * dy}
			font-size=20
			stroke-width=0px
			strke=black
		>{j.start_obj_left}</text>

		<text
			x=20
			y={yoff + 30 + i * dy}
			font-size=20
			stroke-width=0px
			strke=black
		>{j.start_obj_right}</text>
	{/each}

	{#each nodes as n}
		<circle
			cx={n.x}
			cy={n.y}
			r={n.r}
			class={n.class}
			stroke=black
			stroke-width=2
		/>
		<text
			x={n.x}
			y={n.y + 5}
			class=node_label
			font-size=16
			stroke-width=0px
			text-anchor=middle
		>{n.label}</text>

		<!-- TODO allow more than one arrow per node -->
		{#if n.arrow}
			<path
				class=arrow_stroke
				d={n.arrow}
				stroke-width=2px
				fill=none
				marker-end=url(#arrow)
			/>
		{/if}
	{/each}
</svg>

