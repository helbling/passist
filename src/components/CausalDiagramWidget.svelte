<svelte:options namespace=svg />

<script>
	export let jif;
	export let startConfigurations;
	export let steps = 1;
	export let url = '';

	let jugglers = {};
	let xoff = 55;
	let yoff = 70;
	let dy = 100;
	let dx;
	let r = 13
	let nJugglers;
	let width, height;
	let nodes = {};
	const arrowLength = 20;

	function arrow(i, step, jugglerFrom, jugglerTo) {
		var j = i + step;
		if (jugglerFrom != jugglerTo || Math.abs(step) == nJugglers)
			return "M" + xy(i, r, x(j), y(j, jugglerFrom), jugglerFrom) + " L" + xy(j, r + arrowLength, x(i), y(i, jugglerFrom), jugglerTo);
		var dirX = x(j) > x(i) ? 1 : -1;
		var dirY = jugglerFrom ? 1 : -1;

		var offsetX = dirX * dy / 2;
		var offsetY = dirY * dy / 2;

		var controlPoint1 = (x(i) + offsetX) + "," + (y(i, jugglerFrom) + offsetY);
		var controlPoint2 = (x(j) - offsetX) + "," + (y(i, jugglerFrom) + offsetY);
		return "M" + xy(i, r, x(i) + dirX, y(i, jugglerFrom) + dirY, jugglerFrom)
				 + "C" + controlPoint1
				 + " " + controlPoint2
				 + " " + xy(j, r + arrowLength, x(j) - dirX, y(i, jugglerFrom) + dirY, jugglerFrom);
	};

	function x(i) { return xoff + i * dx;}
	function y(i, juggler) { return yoff + juggler * dy;}
	function xy(i, shorten, towardsX, towardsY, juggler) {
		let X = x(i);
		let Y = y(i, juggler);
		if (shorten) {
			let dx = towardsX - X;
			let dy = towardsY - Y;
			let len = Math.sqrt(dx * dx + dy * dy);
			X += shorten * dx / len;
			Y += shorten * dy / len;
		}
		return X + ',' + Y;
	}

$: {
		nJugglers = jif.nJugglers;
		dx = 70 / nJugglers;

		width = steps * dx + 50;
		height = (nJugglers - (nJugglers > 1 ? 1 : 1.4)) * dy + 2 * yoff;

		nodes = [];
		let throws = [];
		for (let i = 0; i < jif.events.length; i++) {
			let event = jif.events[i];
			if (event.type != 'throw' && event.type != 'pause')
				continue;
			throws.push(event);
		}
		
		for (let i = 0; i < steps; i++) {
			const th = throws[i % throws.length];
			let t = th.time + Math.floor(i / throws.length) * jif.timePeriod;
			let jugglerFrom = th.fromHand % nJugglers;
			let jugglerTo = th.toHand % nJugglers;

			nodes.push({
				r: r,
				x: x(t),
				y: y(t, jugglerFrom),
				class: (Math.floor(th.fromHand / nJugglers) % 2) ? 'leftHand' : 'rightHand',
				juggler: jugglerFrom,
				label: th.label,
				arrow: arrow(t, th.duration - 2 * nJugglers, jugglerFrom, jugglerTo), // for ladder diagram: don't subtract 2 * nJugglers
			});
		}
		nodes = nodes; // update svelte state
	}
</script>

<style>
	.arrowStroke { stroke:#007bff }
	.arrowFill   {   fill:#007bff }
	circle { stroke:#343a40 }
	circle.rightHand { fill:white }
	circle.leftHand  { fill:#b7c8d5 }
	.nodeLabel { fill: #343a40 }
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
				class=arrowFill
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

	{#each startConfigurations as j, i}
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
		>{j.startPropsLeft}</text>

		<text
			x=20
			y={yoff + 30 + i * dy}
			font-size=20
			stroke-width=0px
			strke=black
		>{j.startPropsRight}</text>
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
			class=nodeLabel
			font-size=16
			stroke-width=0px
			text-anchor=middle
		>{n.label}</text>

		<!-- TODO allow more than one arrow per node -->
		{#if n.arrow}
			<path
				class=arrowStroke
				d={n.arrow}
				stroke-width=2px
				fill=none
				marker-end=url({url}#arrow)
			/>
		{/if}
	{/each}
</svg>

