<svelte:options namespace=svg />

<script>
	export let jif;
	export let startConfigurations;
	export let steps = 1;
	export let url = '';

	let jugglers = {};
	const xoff = 55;
	const yoff = 70;
	const dy = 100;
	let dx;
	const r = 13
	let nJugglers;
	let width, height;
	let nodes = {};
	const arrowLength = 20;

	function arrow(time, step, jugglerFrom, jugglerTo) {
		const time2 = time + step;
		if (jugglerFrom != jugglerTo || Math.abs(step) == nJugglers)
			return "M" + xy(time, r, x(time2), y(jugglerFrom), jugglerFrom) + " L" + xy(time2, r + arrowLength, x(time), y(jugglerFrom), jugglerTo);
		const dirX = x(time2) > x(time) ? 1 : -1;
		const dirY = jugglerFrom ? 1 : -1;

		const offsetX = dirX * dy / 2;
		const offsetY = dirY * dy / 2;

		const controlPoint1 = (x(time) + offsetX) + "," + (y(jugglerFrom) + offsetY);
		const controlPoint2 = (x(time2) - offsetX) + "," + (y(jugglerFrom) + offsetY);
		return "M" + xy(time, r, x(time) + dirX, y(jugglerFrom) + dirY, jugglerFrom)
				 + "C" + controlPoint1
				 + " " + controlPoint2
				 + " " + xy(time2, r + arrowLength, x(time2) - dirX, y(jugglerFrom) + dirY, jugglerFrom);
	};

	function x(time) { return xoff + time * dx;}
	function y(juggler) { return yoff + juggler * dy;}
	function xy(time, shorten, towardsX, towardsY, juggler) {
		let X = x(time);
		let Y = y(juggler);
		if (shorten) {
			const dx = towardsX - X;
			const dy = towardsY - Y;
			const len = Math.sqrt(dx * dx + dy * dy);
			X += shorten * dx / len;
			Y += shorten * dy / len;
		}
		return X + ',' + Y;
	}

$: {
		nJugglers = jif.jugglers.length;
		dx = 70 / nJugglers;

		width = steps * dx + 50;
		height = (nJugglers - (nJugglers > 1 ? 1 : 1.4)) * dy + 2 * yoff;

		nodes = [];
		const throws = jif.throws ? jif.throws : [];
		for (let i = 0; i < steps; i++) {
			const th = throws[i % throws.length];
			const time = th.time + Math.floor(i / throws.length) * jif.period;
			const jugglerFrom = jif.limbs[th.from].juggler;
			const jugglerTo = jif.limbs[th.to].juggler;

			nodes.push({
				r: r,
				x: x(time),
				y: y(jugglerFrom),
				class: (Math.floor(th.from / nJugglers) % 2) ? 'leftHand' : 'rightHand',
				juggler: jugglerFrom,
				label: th.label,
				arrow: arrow(time, th.duration - 2 * nJugglers, jugglerFrom, jugglerTo), // for ladder diagram: don't subtract 2 * nJugglers
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

